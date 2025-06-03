import loadIcons from "../hooks/loadIcons.js";
import {
  fetchInvoices,
  fetchPayments,
  fetchUserById,
} from "../hooks/firestore.js";
import {
  displayOverview,
  displayInvoices,
  displayPayments,
  displaySettings,
} from "./displayTabs.js";

import stripeConfig from "../hooks/stripe-config.js";
import formatInvoiceEntryId from "../hooks/formatInvoiceEntryId.js";

const HEROKU_URL = stripeConfig.serverUrl;

const YONE_PORO_ID = "YxjftiBUqLiwN1xk7hSo";
let customerId = YONE_PORO_ID;

const stripe = Stripe(stripeConfig.publishableKey, {
  stripeAccount: YONE_PORO_ID,
});

let pageTab = "overview";
window.setPageTab = async function (tab) {
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

  const loadingEl = document.getElementById("loader-wrapper");
  loadingEl.classList.add("show");

  const tabDisplay = document.getElementById("tab-display");
  tabDisplay.innerHTML = "";

  try {
    if (pageTab === "overview") {
      await loadData();
    } else if (pageTab === "settings") {
      await displaySettings(stripe);
    } else if (pageTab === "invoices") {
      await displayInvoices(customerId);
    } else if (pageTab === "payments") {
      await displayPayments(customerId);
    }
  } catch (err) {
    console.error("Error loading tab data:", err);
  } finally {
    loadingEl.classList.remove("show");
  }
};

async function loadData() {
  loadCustomerData(YONE_PORO_ID);

  const currentBalance = await loadCustomerInvoices(YONE_PORO_ID);
  const payments = await loadCustomerPayments(YONE_PORO_ID);

  // 🔍 Find the most recent payment
  let mostRecentPayment = null;

  // TODO: idk i dont like this function
  if (payments.length > 0) {
    mostRecentPayment = payments.reduce((latest, current) => {
      const latestTime =
        latest.paidOn.seconds * 1_000 +
        Math.floor(latest.paidOn.nanoseconds / 1_000_000);
      const currentTime =
        current.paidOn.seconds * 1_000 +
        Math.floor(current.paidOn.nanoseconds / 1_000_000);
      return currentTime > latestTime ? current : latest;
    });
  }

  // Fallback if no payments
  const defaultLastPayment = {
    amount: 0,
    date: new Date(),
    confirmationNumber: "N/A",
    paidBy: "N/A",
  };

  displayOverview({
    currentBalance,
    scheduledPayments: {
      amount: 0,
      dueDate: new Date(),
      description: "No scheduled payments",
      createdBy: "N/A",
    },
    lastPayment: mostRecentPayment
      ? {
          amount:
            Object.values(mostRecentPayment.invoiceData.billingItemMap).reduce(
              (sum, item) => sum + item.amount,
              0
            ) / 100,
          date: mostRecentPayment.paidOn,
          confirmationNumber: formatInvoiceEntryId(
            mostRecentPayment.invoiceData.invoiceNumber
          ),
          paidBy: mostRecentPayment.invoiceData.residentName,
        }
      : defaultLastPayment,
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

async function loadCustomerPayments(userId) {
  const payments = await fetchPayments(userId);
  console.log("Payments for userId:", userId, payments);

  return payments;
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
