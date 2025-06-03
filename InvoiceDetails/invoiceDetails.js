import loadIcons from "../hooks/loadIcons.js";
import formatCost from "../hooks/formatCost.js";
import { payInvoiceStripe } from "../hooks/PayInvoice/payInvoice.js";
import { fetchInvoiceById, fetchUserById } from "../hooks/firestore.js";
import { createStatusComponent } from "../hooks/createTable.js";

import formatDate from "../hooks/formatDate.js";
import formatInvoiceEntryId from "../hooks/formatInvoiceEntryId.js";

loadIcons();

console.log("Loading icons...");

const CUSTOMER_ID = "YxjftiBUqLiwN1xk7hSo";

const params = new URLSearchParams(window.location.search);
const invoiceId = params.get("id");

console.log("Invoice ID:", invoiceId);

// fetch specific invoice data
async function fetchInvoiceData() {
  const params = new URLSearchParams(window.location.search);
  const invoiceId = params.get("id");

  if (!invoiceId) {
    console.error("Invoice ID is required.");
    return;
  }

  const invoiceData = await fetchInvoiceById(invoiceId);
  if (!invoiceData) {
    console.error("Invoice data not found.");
    return;
  }

  console.log("Invoice Data:", invoiceData);

  //display invoice data :
  // const displayAmount = document.querySelector("#invoice-amount");
  // let invoiceAmount = 0;
  // for (const itemId in invoiceData.billingItemMap) {
  //   const item = invoiceData.billingItemMap[itemId];
  //   invoiceAmount += item.amount || 0;
  // }

  // console.log("Invoice Amount:", invoiceAmount);
  // displayAmount.textContent = formatCost(invoiceAmount / 100);

  displayInvoiceData(invoiceData);
}

// display invoice data ==========================
function clearItem(item) {
  item.innerHTML = "";
}

function formatFrequency(freqIndex) {
  if (freqIndex == "1") {
    return "Every 1 Month";
  } else {
    return "FORMAT FREQUENCY";
  }
}

function displayInvoiceData(invoiceData) {
  console.log(invoiceData);

  // display invoice status =====================================
  const invoiceStatus = document.querySelector("#invoice-status");
  clearItem(invoiceStatus);
  invoiceStatus.appendChild(createStatusComponent(invoiceData.status));

  // display invoice amount =====================================
  const displayAmount = document.querySelector("#invoice-amount");

  let invoiceAmount = 0;
  for (const itemId in invoiceData.billingItemMap) {
    const item = invoiceData.billingItemMap[itemId];
    invoiceAmount += item.amount || 0;
  }

  invoiceAmount = invoiceAmount / 100;

  console.log("Invoice Amount:", invoiceAmount);

  //clear previous content
  // displayAmount.innerHTML = "";
  clearItem(displayAmount);

  //display amount
  const amountSpan = document.createElement("span");
  amountSpan.classList.add("invoice-amount");
  amountSpan.textContent = formatCost(invoiceAmount);
  displayAmount.appendChild(amountSpan);

  // display invoice due date ===================================
  const invoiceDueDate = document.querySelector("#invoice-due-date");
  clearItem(invoiceDueDate);
  invoiceDueDate.textContent = `Due on ${formatDate(
    invoiceData.dueDateTimestamp,
    "LONG"
  )}`;

  // display invoice number =====================================
  const invoiceNumber = document.querySelector("#invoice-number");
  clearItem(invoiceNumber);
  invoiceNumber.textContent = formatInvoiceEntryId(
    invoiceData.invoiceNumber,
    false
  );

  // display invoice bill to ====================================
  const invoiceBillTo = document.querySelector("#invoice-bill-to");
  clearItem(invoiceBillTo);
  invoiceBillTo.textContent = invoiceData.residentName;

  // display invoice from =======================================
  const invoiceFrom = document.querySelector("#invoice-from");
  clearItem(invoiceFrom);
  invoiceFrom.textContent = "Poro Senior Center";

  // display invoice frequency ==================================
  const invoiceFrequency = document.querySelector("#invoice-frequency");
  clearItem(invoiceFrequency);
  invoiceFrequency.textContent = formatFrequency(invoiceData.repeatInterval);

  // display invoice occurence ==================================
  const invoiceOccurence = document.querySelector("#invoice-occurence");
  clearItem(invoiceOccurence);
  invoiceOccurence.textContent = "Ends Never";

  //display invoice details =====================================
  const invoiceDetails = document.querySelector("#invoice-details");
  clearItem(invoiceDetails);
  const billingItemIds = invoiceData.billingItemIds || [];
  const billingItemMap = invoiceData.billingItemMap || {};

  billingItemIds.forEach((itemId) => {
    const item = billingItemMap[itemId];
    if (!item) return;

    // extract name and description
    const name = item.coaName || "Name of Invoice";
    const amount = item.amount / 100 || 0;
    const description = item.notes || "";

    // create container
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("invoice-item");

    // header
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("item-header");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;

    const amountSpan = document.createElement("span");
    amountSpan.textContent = formatCost(amount);

    headerDiv.appendChild(nameSpan);
    headerDiv.appendChild(amountSpan);

    // content
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("item-content");

    const descriptionSpan = document.createElement("span");
    descriptionSpan.textContent = description;

    contentDiv.appendChild(descriptionSpan);

    itemDiv.appendChild(headerDiv);
    itemDiv.appendChild(contentDiv);

    invoiceDetails.appendChild(itemDiv);
  });

  // display subtotal + total ===========================
  const invoiceSubtotal = document.querySelector("#invoice-subtotal");
  const invoiceTotal = document.querySelector("#invoice-total");

  invoiceSubtotal.textContent = formatCost(invoiceAmount);
  invoiceTotal.textContent = formatCost(invoiceAmount);

  if (!invoiceData.isPaid) {
    fetchPaymentMethod();
  }
}

// display payment method if invoice is not paid off
async function fetchPaymentMethod() {
  console.log("fetching customer payment methods");

  const userId = CUSTOMER_ID;

  const user = await fetchUserById(userId, "customers");

  const defaultPaymentMethod = Object.values(user.paymentMethodMap).find(
    (method) => method.isDefault === true
  );

  console.log(defaultPaymentMethod);

  console.log(user);
}

// pay invoice function
window.payInvoice = async function () {
  // event.preventDefault();

  console.log("Paying invoice...");

  const invoiceId = params.get("id");
  if (!invoiceId) {
    console.error("Invoice ID is required.");
    return;
  }

  console.log("Invoice ID:", invoiceId);

  const userId = CUSTOMER_ID;

  const userInfo = await fetchUserById(userId, "customers");
  console.log(userInfo);

  const paymentMethodId = userInfo.paymentMethodIds[0];
  const paymentMethod = userInfo.paymentMethodMap[paymentMethodId];
  const stripeId = paymentMethod?.stripe_id;

  console.log(stripeId);
  // return;
  payInvoiceStripe(invoiceId, userId, stripeId);
};

// toggle details card function
window.toggleDetails = function () {
  console.log("hide");
};

// paymet method :
const toggleBtn = document.getElementById("toggle-extra-payments");
const extraPayments = document.getElementById("extra-payment-methods");
const toggleText = document.getElementById("toggle-text");
const toggleIcon = document.getElementById("toggle-icon");

toggleBtn.addEventListener("click", () => {
  console.log("Toggle button clicked");
  const isHidden = extraPayments.classList.toggle("hidden");

  toggleText.textContent = isHidden ? "Show More" : "Show Less";
  toggleIcon.textContent = isHidden
    ? "keyboard_double_arrow_down"
    : "keyboard_double_arrow_up";
});

fetchInvoiceData();
