import loadIcons from "../hooks/loadIcons.js";
import { fetchInvoices, fetchUserById } from "../hooks/firestore.js";
import {
  displayOverview,
  displayInvoices,
  displayPayments,
  displaySettings,
} from "./displayTabs.js";

import stripeConfig from "../hooks/stripe-config.js";

const HEROKU_URL = stripeConfig.serverUrl;

const YONE_PORO_ID = "rBCPLxqkvhU9bnLN2ttU";
let customerId = YONE_PORO_ID;

const stripe = Stripe(stripeConfig.publishableKey, {
  stripeAccount: YONE_PORO_ID,
});

let pageTab = "overview";
window.setPageTab = function (tab) {
  pageTab = tab;

  // Remove 'selected' class from all tabs
  const tabs = document.querySelectorAll(".content-tab");
  tabs.forEach((tabEl) => tabEl.classList.remove("selected"));
  const selectedTab = document.querySelector(
    `.content-tabs .content-tab[onclick*="${tab}"]`
  );

  if (selectedTab) {
    selectedTab.classList.add("selected");
  }
  loadIcons();

  if (pageTab === "overview") {
    loadData();
  } else if (pageTab === "settings") {
    displaySettings(stripe);
  } else if (pageTab === "invoices") {
    displayInvoices(customerId);
  } else if (pageTab === "payments") {
    displayPayments();
  }
};

async function loadData() {
  loadCustomerData(YONE_PORO_ID);

  const currentBalance = loadCustomerInvoices(YONE_PORO_ID);
  displayOverview({
    currentBalance: await currentBalance,
    scheduledPayments: {
      amount: 0,
      dueDate: new Date(),
      description: "No scheduled payments",
      createdBy: "N/A",
    },
    lastPayment: {
      amount: 0,
      date: new Date(),
      confirmationNumber: "N/A",
      paidBy: "N/A",
    },
  });

  loadIcons();
}

async function loadCustomerData(userId) {
  const user = await fetchUserById(userId, "customers");
  if (!user) {
    console.error("User not found");
    return;
  }

  console.log("Customer data:", user);

  const customerName = document.querySelector("#customer-name");
  customerName.textContent = `Hello, ${user.name}`;
}

async function loadCustomerInvoices(userId) {
  // status index == 0 should be unpaid invoices
  const invoices = await fetchInvoices(userId, false);

  console.log("customerId:", userId);
  console.log("Invoices for YONE_PORO_ID:", invoices);
  return createCurrentBalanceObject(invoices);
}

function createCurrentBalanceObject(invoices) {
  console.log("Creating current balance object from invoices:", invoices);

  let currentBalance = 0;
  let dueDate = null;

  for (const invoice of invoices) {
    // Sum up all billing item amounts in the invoice
    for (const itemId in invoice.billingItemMap) {
      const item = invoice.billingItemMap[itemId];
      currentBalance += item.amount || 0;
    }

    // Find the earliest due date
    if (
      dueDate === null ||
      invoice.dueDateTimestamp.seconds < dueDate.seconds
    ) {
      dueDate = invoice.dueDateTimestamp;
    }
  }

  currentBalance = currentBalance / 100;

  // Invoice ID link
  let firstInvoiceId = null;
  if (invoices.length !== 0) {
    firstInvoiceId = invoices[0].id;
  }

  return {
    amount: currentBalance,
    dueDate: dueDate ? new Date(dueDate.seconds * 1000) : null,
    notifications: [],
    payNowFunction: () => {
      if (firstInvoiceId) {
        window.location.href = `/InvoiceDetails/invoiceDetails.html?id=${firstInvoiceId}`;
      }
    },
  };
}
async function payNow(invoiceId, userId, paymentMethodId) {
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
}

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

//initial load
loadData();

// loadIcons();
