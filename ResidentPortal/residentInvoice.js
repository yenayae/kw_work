import loadIcons from "../hooks/loadIcons.js";
import { fetchInvoices } from "../hooks/firestore.js";
import formatCost from "../hooks/formatCost.js";
import formatDate from "../hooks/formatDate.js";

import stripeConfig from "../hooks/stripe-config.js";

const stripe = window.Stripe(stripeConfig.publishableKey);
const HEROKU_URL = stripeConfig.serverUrl;

const YONE_PORO_ID = "uSpp2ApQElgQ3yuxsPHu";

async function loadCustomerInvoices() {
  // status index == 0 should be unpaid invoices
  const invoices = await fetchInvoices(YONE_PORO_ID, 0);

  console.log("Invoices for YONE_PORO_ID:", invoices);

  displayCustomerInvoices(invoices);
}

function displayCustomerInvoices(invoices) {
  let currentBalance = 0;
  let dueDate = null;

  for (const invoice of invoices) {
    // calculate current balance
    currentBalance += invoice.total;

    // find the earliest due date
    if (
      dueDate === null ||
      invoice.dueDateTimestamp.seconds < dueDate.seconds
    ) {
      dueDate = invoice.dueDateTimestamp;
    }
  }

  // display current balance
  currentBalance = currentBalance / 100;
  const currentBalanceSpan = document.querySelector("#current-balance");
  currentBalanceSpan.textContent = formatCost(currentBalance);

  // display next bill due date
  const dueDateSpan = document.querySelector("#next-bill");
  const formattedDate = dueDate ? formatDate(dueDate) : "N/A";
  dueDateSpan.textContent = `Next bill due on ${formattedDate}`;
}

window.payNow = async function () {
  console.log("Pay Now button clicked");

  const invoices = await fetchInvoices(YONE_PORO_ID, 0);
  if (invoices.length === 0) {
    alert("No unpaid invoices found.");
    return;
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const response = await fetch(`${HEROKU_URL}create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: totalAmount,
      invoiceIds: invoices.map((inv) => inv.id),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    alert(`Payment failed: ${data.error}`);
    return;
  }

  alert("Payment successful!");
  await markInvoicesAsPaid(invoices);
};

async function markInvoicesAsPaid(invoices) {
  if (!Array.isArray(invoices) || invoices.length === 0) {
    console.warn("No invoices provided to mark as paid.");
    return;
  }

  try {
    const response = await fetch(`${HEROKU_URL}mark-invoices-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceIds: invoices.map((inv) => inv.id) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to mark invoices as paid:", errorData.error);
      console.error(errorData);
    } else {
      console.log("Invoices marked as paid successfully.");

      //update the UI to reflect the paid status
      loadCustomerInvoices();
    }
  } catch (err) {
    console.error("Error marking invoices as paid:", err.message);
  }
}

console.log("Resident Invoice Page Loaded");
loadIcons();
loadCustomerInvoices();
