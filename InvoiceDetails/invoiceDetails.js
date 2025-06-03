import loadIcons from "../hooks/loadIcons.js";
import formatCost from "../hooks/formatCost.js";
import { payInvoiceStripe } from "../hooks/PayInvoice/payInvoice.js";
import { fetchInvoiceById, fetchUserById } from "../hooks/firestore.js";
import { createStatusComponent } from "../hooks/createTable.js";

import formatDate from "../hooks/formatDate.js";
import formatInvoiceEntryId from "../hooks/formatInvoiceEntryId.js";

loadIcons();

console.log("Loading icons...");

const CUSTOMER_ID = "vwutkwHs1tJfLbXvplFW";

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

  console.log(invoiceData.isPaid);

  if (!invoiceData.isPaid) {
    console.log("Invoice is not paid, fetching payment method...");
    fetchPaymentMethod();
  } else {
    // Remove payment sections if they exist
    const container = document.getElementById("payment-sections-container");
    container.innerHTML = "";
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

  // Create and append payment sections
  createPaymentSections(user, defaultPaymentMethod);
}

function createPaymentSections(user, defaultPaymentMethod) {
  const container = document.getElementById("payment-sections-container");
  container.innerHTML = ""; // Clear existing content

  // Create payment method section
  const paymentWrapper = document.createElement("div");
  paymentWrapper.id = "payment-wrapper";
  paymentWrapper.className = "payment-wrapper";

  // Payment method header
  const header = document.createElement("div");
  header.className = "details-header";

  const headerContent = document.createElement("div");
  const headerLabel = document.createElement("span");
  headerLabel.className = "details-label";
  headerLabel.textContent = "Payment Method";
  headerContent.appendChild(headerLabel);
  header.appendChild(headerContent);

  // Create container for chosen method
  const chosenMethodContainer = document.createElement("div");
  chosenMethodContainer.id = "chosen-method-container";

  // Function to create and display chosen payment method
  function displayChosenMethod(method) {
    const chosenMethodWrapper = document.createElement("div");
    chosenMethodWrapper.className = "chosen-payment-method-wrapper";

    const chosenMethod = document.createElement("div");
    chosenMethod.className = "chosen-payment-method card-payment";

    const isBank = method.type === "bank_account";
    const icon = isBank ? "account_balance" : "credit_card";
    const type = isBank ? "Checking Bank Account" : "Credit Card";
    const number = method.last4 || "1234";

    // Left content
    const chosenContentLeft = document.createElement("div");
    chosenContentLeft.className = "chosen-content";

    // Icon
    const centerIcon = document.createElement("div");
    centerIcon.className = "center-icon";
    const iconSpan = document.createElement("span");
    iconSpan.className = "material-symbols-outlined";
    iconSpan.textContent = icon;
    centerIcon.appendChild(iconSpan);

    // Payment content
    const paymentContent = document.createElement("div");
    paymentContent.className = "payment-content";

    const paymentHeader = document.createElement("div");
    paymentHeader.className = "payment-header";

    const paymentInfo = document.createElement("div");
    paymentInfo.className = "payment-info";

    const issuerSpan = document.createElement("span");
    issuerSpan.className = "issuer chosen";
    issuerSpan.textContent =
      method.bank_name || method.brand || "TEST BANK NAME";

    const numberSpan = document.createElement("span");
    numberSpan.className = "number";
    numberSpan.textContent = `**** ${number}`;

    paymentInfo.appendChild(issuerSpan);
    paymentInfo.appendChild(numberSpan);
    paymentHeader.appendChild(paymentInfo);

    const details = document.createElement("div");
    details.className = "details";
    const typeSpan = document.createElement("span");
    typeSpan.className = "payment-type";
    typeSpan.textContent = type;
    details.appendChild(typeSpan);

    paymentContent.appendChild(paymentHeader);
    paymentContent.appendChild(details);

    chosenContentLeft.appendChild(centerIcon);
    chosenContentLeft.appendChild(paymentContent);

    // Right content
    const chosenContentRight = document.createElement("div");
    chosenContentRight.className = "chosen-content";

    const defaultTag = document.createElement("div");
    defaultTag.className = "default-tag";
    const defaultSpan = document.createElement("span");
    defaultSpan.textContent = "default";
    defaultTag.appendChild(defaultSpan);

    const radioIcon = document.createElement("span");
    radioIcon.className = "material-symbols-outlined radio-icon selected";
    radioIcon.textContent = "radio_button_checked";

    chosenContentRight.appendChild(defaultTag);
    chosenContentRight.appendChild(radioIcon);

    chosenMethod.appendChild(chosenContentLeft);
    chosenMethod.appendChild(chosenContentRight);
    chosenMethodWrapper.appendChild(chosenMethod);

    // Clear and append new chosen method
    chosenMethodContainer.innerHTML = "";
    chosenMethodContainer.appendChild(chosenMethodWrapper);
  }

  // Initial display of chosen method
  displayChosenMethod(defaultPaymentMethod);
  paymentWrapper.appendChild(header);
  paymentWrapper.appendChild(chosenMethodContainer);

  // Create other payment methods section if there are any
  if (user.paymentMethodIds && user.paymentMethodIds.length > 1) {
    const toggleExtra = document.createElement("div");
    toggleExtra.className = "hide-icon chosen";
    toggleExtra.id = "toggle-extra-payments";

    const toggleText = document.createElement("span");
    toggleText.id = "toggle-text";
    toggleText.textContent = "Show More";

    const toggleIcon = document.createElement("span");
    toggleIcon.id = "toggle-icon";
    toggleIcon.className = "material-symbols-outlined";
    toggleIcon.textContent = "keyboard_double_arrow_down";

    toggleExtra.appendChild(toggleText);
    toggleExtra.appendChild(toggleIcon);

    const extraMethods = document.createElement("div");
    extraMethods.className = "payment-methods hidden";
    extraMethods.id = "extra-payment-methods";

    // Keep track of current chosen method
    let currentChosenMethod = defaultPaymentMethod;

    // Function to update the list of payment methods
    function updatePaymentMethodsList() {
      extraMethods.innerHTML = "";
      user.paymentMethodIds.forEach((methodId) => {
        const method = user.paymentMethodMap[methodId];

        console.log("check method: ", method);
        console.log("check currentChosenMethod: ", currentChosenMethod);

        if (method && method !== currentChosenMethod) {
          const methodElement = createPaymentMethodElement(method);

          console.log("methodlment: ", methodElement);

          // Add click handler for payment method switching
          methodElement.addEventListener("click", () => {
            const previousMethod = currentChosenMethod;
            currentChosenMethod = method;
            displayChosenMethod(method);

            // Hide the list after selection
            extraMethods.classList.add("hidden");
            toggleText.textContent = "Show More";
            toggleIcon.textContent = "keyboard_double_arrow_down";
          });

          extraMethods.appendChild(methodElement);
        }
      });
    }

    // Initial population of the list
    updatePaymentMethodsList();

    paymentWrapper.appendChild(toggleExtra);
    paymentWrapper.appendChild(extraMethods);

    // Add toggle functionality
    toggleExtra.addEventListener("click", () => {
      const isHidden = extraMethods.classList.toggle("hidden");
      toggleText.textContent = isHidden ? "Show More" : "Show Less";
      toggleIcon.textContent = isHidden
        ? "keyboard_double_arrow_down"
        : "keyboard_double_arrow_up";

      // Update the list when showing it
      if (!isHidden) {
        updatePaymentMethodsList();
      }
    });
  }

  // Create pay button section
  const payWrapper = document.createElement("div");
  payWrapper.className = "pay-wrapper";

  const payButton = document.createElement("button");
  payButton.className = "pay-button";
  payButton.onclick = payInvoice;
  payButton.textContent = "Pay Now";

  payWrapper.appendChild(payButton);

  // Append everything to container
  container.appendChild(paymentWrapper);
  container.appendChild(payWrapper);

  loadIcons();
}

function createPaymentMethodElement(method) {
  const isBank = method.type === "bank_account";
  const icon = isBank ? "account_balance" : "credit_card";

  const wrapper = document.createElement("div");
  wrapper.className = "payment-method-wrapper card-payment";

  const paymentMethod = document.createElement("div");
  paymentMethod.className = "payment-method";

  // Icon container
  const iconContainer = document.createElement("div");
  const iconSpan = document.createElement("span");
  iconSpan.className = "material-symbols-outlined";
  iconSpan.textContent = icon;
  iconContainer.appendChild(iconSpan);

  // Payment content
  const paymentContent = document.createElement("div");
  paymentContent.className = "payment-content";

  const paymentHeader = document.createElement("div");
  paymentHeader.className = "payment-header";

  const paymentInfo = document.createElement("div");
  paymentInfo.className = "payment-info";

  const issuerSpan = document.createElement("span");
  issuerSpan.className = "issuer";
  issuerSpan.textContent = method.bank_name || method.brand || "Bank Name";

  const numberSpan = document.createElement("span");
  numberSpan.className = "number";
  numberSpan.textContent = `**** ${method.last4 || "1234"}`;

  paymentInfo.appendChild(issuerSpan);
  paymentInfo.appendChild(numberSpan);
  paymentHeader.appendChild(paymentInfo);

  const details = document.createElement("div");
  details.className = "details";

  if (method.exp_month) {
    const expiresSpan = document.createElement("span");
    expiresSpan.className = "expires";
    expiresSpan.textContent = `Expires ${String(method.exp_month).padStart(
      2,
      "0"
    )}/${method.exp_year}`;
    details.appendChild(expiresSpan);
  }

  paymentContent.appendChild(paymentHeader);
  paymentContent.appendChild(details);

  paymentMethod.appendChild(iconContainer);
  paymentMethod.appendChild(paymentContent);

  // Right section
  const methodRight = document.createElement("div");
  methodRight.className = "payment-method-right";

  const radioIcon = document.createElement("span");
  radioIcon.className = "material-symbols-outlined radio-icon";
  radioIcon.textContent = "radio_button_unchecked";
  methodRight.appendChild(radioIcon);

  wrapper.appendChild(paymentMethod);
  wrapper.appendChild(methodRight);

  return wrapper;
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

fetchInvoiceData();
