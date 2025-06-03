import loadIcons from "../hooks/loadIcons.js";
import formatCost from "../hooks/formatCost.js";
import formatDate from "../hooks/formatDate.js";
import createModal from "../hooks/createModal.js";
import { mountBankPayment } from "../hooks/mountPaymentMethods.js";

import { fetchInvoices, fetchPayments } from "../hooks/firestore.js";

import { createTable } from "../hooks/createTable.js";

import {
  INVOICE_HEADERS,
  INVOICE_SORT_FIELDS,
  formatInvoiceContent,
  INVOICE_FILTER_OPTIONS,
} from "../hooks/FormatTable/formatInvoiceContent.js";

import {
  PAYMENTS_HEADERS,
  PAYMENT_SORT_FIELDS,
  formatPaymentsContent,
  PAYMENTS_FILTER_OPTIONS,
} from "../hooks/FormatTable/formatPaymentsContent.js";

import createFilterBar from "../hooks/createFilterBar.js";

/* this function will need three objects:
{ current balance object,
schedule payments object,
last payment object 
}

missing objects will default to fallback values
*/
export function displayOverview(content = {}) {
  const currentBalance = content.currentBalance ?? {
    amount: -1,
    dueDate: new Date(),
    notifications: [],
  };

  const scheduledPayments = content.scheduledPayments ?? {
    amount: -1,
    dueDate: new Date(),
    description: "No scheduled payments",
    createdBy: "N/A",
  };

  const lastPayment = content.lastPayment ?? {
    amount: -1,
    date: new Date(),
    confirmationNumber: "N/A",
    paidBy: "N/A",
  };

  console.log("currentBalance", currentBalance);

  const displayContainer = document.querySelector("#tab-display");
  displayContainer.classList.remove("table");
  displayContainer.innerHTML = ""; // clear previous content

  const cardSection1 = document.createElement("div");
  cardSection1.classList.add("card-section");
  displayContainer.appendChild(cardSection1);

  // current balance card =====================================
  const currentBalanceCard = document.createElement("div");
  currentBalanceCard.classList.add("card");
  cardSection1.appendChild(currentBalanceCard);

  const topWrapper = document.createElement("div");
  topWrapper.classList.add("top-wrapper");
  currentBalanceCard.appendChild(topWrapper);

  const currentBalanceHeader = document.createElement("div");
  currentBalanceHeader.classList.add("card-header");
  topWrapper.appendChild(currentBalanceHeader);

  const currentBalanceTitle = document.createElement("span");
  currentBalanceTitle.textContent = "Your Current Balance";
  currentBalanceHeader.appendChild(currentBalanceTitle);

  const currentBalanceValue = document.createElement("span");
  currentBalanceValue.id = "current-balance";
  currentBalanceValue.textContent = formatCost(currentBalance.amount);
  currentBalanceHeader.appendChild(currentBalanceValue);

  const currentBalanceDueDate = document.createElement("span");
  currentBalanceDueDate.id = "next-bill";
  currentBalanceDueDate.textContent = `Next bill due on ${formatDate(
    currentBalance.dueDate
  )}`;
  currentBalanceHeader.appendChild(currentBalanceDueDate);

  const cardNotifications = document.createElement("div");
  cardNotifications.classList.add("card-notifications");
  topWrapper.appendChild(cardNotifications);

  if (currentBalance.notifications.length === 0) {
    const noNotifications = document.createElement("div");
    noNotifications.classList.add("no-notification");
    cardNotifications.appendChild(noNotifications);

    const noNotification = document.createElement("span");
    noNotification.textContent = "No notifications";
    noNotifications.appendChild(noNotification);
  } else {
    for (const notification of currentBalance.notifications) {
      const notificationItem = document.createElement("div");
      notificationItem.classList.add("notification");
      cardNotifications.appendChild(notificationItem);

      const notificationIcon = document.createElement("span");
      notificationIcon.classList.add(
        "material-symbols-outlined",
        notification.type
      );
      notificationIcon.textContent = "fiber_manual_record";
      notificationItem.appendChild(notificationIcon);

      const notificationText = document.createElement("span");
      notificationText.textContent = notification.message;
      notificationItem.appendChild(notificationText);
      if (notification.type === "urgent") {
        notificationItem.classList.add("bold");
      }
    }
  }

  const bottomWrapper = document.createElement("div");
  bottomWrapper.classList.add("bottom-wrapper");
  currentBalanceCard.appendChild(bottomWrapper);

  const cardButtons = document.createElement("div");
  cardButtons.classList.add("card-buttons");
  bottomWrapper.appendChild(cardButtons);

  const payNowButton = document.createElement("button");
  payNowButton.classList.add("pay-button", "blue");
  payNowButton.textContent = "Pay Now";
  payNowButton.onclick = currentBalance.payNowFunction;
  cardButtons.appendChild(payNowButton);

  // conditional if no payments to be made:
  if (currentBalance.amount === 0) {
    // Clear notifications and show "All up to date!"
    cardNotifications.innerHTML = "";
    const upToDate = document.createElement("div");
    upToDate.classList.add("no-notification", "positive");
    const upToDateText = document.createElement("span");
    upToDateText.textContent = "All up to date!";
    upToDate.appendChild(upToDateText);
    cardNotifications.appendChild(upToDate);

    // Hide the Pay Now button
    payNowButton.style.display = "none";

    // Update due date message
    currentBalanceDueDate.textContent = "No upcoming payments due.";
  }

  const setUpAutoPayButton = document.createElement("button");
  setUpAutoPayButton.classList.add("pay-button", "grey");
  setUpAutoPayButton.textContent = "Set Up Auto Pay";
  setUpAutoPayButton.onclick = function () {
    alert("Set Up Auto Pay button clicked");
  };
  cardButtons.appendChild(setUpAutoPayButton);

  const dateMonth = document.createElement("div");
  dateMonth.classList.add("month");
  bottomWrapper.appendChild(dateMonth);

  const monthSpan = document.createElement("span");
  monthSpan.textContent = "Current Month";
  dateMonth.appendChild(monthSpan);

  //scheduled payments card =====================================
  const cardSection2 = document.createElement("div");
  cardSection2.classList.add("card-section");
  displayContainer.appendChild(cardSection2);

  const scheduledPaymentsCard = document.createElement("div");
  scheduledPaymentsCard.classList.add("card");
  cardSection2.appendChild(scheduledPaymentsCard);

  const scheduledPaymentsHeader = document.createElement("div");
  scheduledPaymentsHeader.classList.add("card-header");
  scheduledPaymentsCard.appendChild(scheduledPaymentsHeader);

  const scheduledPaymentsTitle = document.createElement("span");
  scheduledPaymentsTitle.textContent = "Scheduled Payments";
  scheduledPaymentsHeader.appendChild(scheduledPaymentsTitle);

  const moneyAndDate = document.createElement("div");
  moneyAndDate.classList.add("space-between-section");
  scheduledPaymentsHeader.appendChild(moneyAndDate);

  const scheduledPaymentsValue = document.createElement("span");
  scheduledPaymentsValue.id = "scheduled-payments";
  scheduledPaymentsValue.textContent = formatCost(scheduledPayments.amount);
  moneyAndDate.appendChild(scheduledPaymentsValue);

  const scheduledPaymentsDueDate = document.createElement("span");
  scheduledPaymentsDueDate.id = "scheduled-payments-due-date";
  scheduledPaymentsDueDate.textContent = ``;
  moneyAndDate.appendChild(scheduledPaymentsDueDate);

  const invoiceDescription = document.createElement("span");
  invoiceDescription.textContent = scheduledPayments.description;
  scheduledPaymentsHeader.appendChild(invoiceDescription);

  const autoPayAndEdit = document.createElement("div");
  autoPayAndEdit.classList.add("space-between-section");
  scheduledPaymentsHeader.appendChild(autoPayAndEdit);

  const autopayCreatedBy = document.createElement("span");
  autopayCreatedBy.textContent =
    scheduledPayments.createdBy === "N/A"
      ? ""
      : `Autopay created by ${scheduledPayments.createdBy}`;
  autoPayAndEdit.appendChild(autopayCreatedBy);

  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.onclick = function () {
    alert("Edit button clicked");
  };
  autoPayAndEdit.appendChild(editButton);

  // last payment card =====================================
  const lastPaymentCard = document.createElement("div");
  lastPaymentCard.classList.add("card");
  cardSection2.appendChild(lastPaymentCard);

  const lastPaymentHeader = document.createElement("div");
  lastPaymentHeader.classList.add("card-header");
  lastPaymentCard.appendChild(lastPaymentHeader);

  const lastPaymentTitle = document.createElement("span");
  lastPaymentTitle.textContent = "Last Payment";
  lastPaymentHeader.appendChild(lastPaymentTitle);

  const cardContent = document.createElement("div");
  cardContent.classList.add("card-content");
  lastPaymentCard.appendChild(cardContent);

  const lastPaymentContent = document.createElement("div");
  lastPaymentContent.classList.add("last-payment-content");
  cardContent.appendChild(lastPaymentContent);

  const paidOnDateAndAmount = document.createElement("div");
  paidOnDateAndAmount.classList.add("space-between-section");
  lastPaymentContent.appendChild(paidOnDateAndAmount);

  const lastPaymentDate = document.createElement("span");
  lastPaymentDate.id = "last-payment-date";
  lastPaymentDate.textContent = `Paid on ${formatDate(lastPayment.date)}`;
  paidOnDateAndAmount.appendChild(lastPaymentDate);

  const lastPaymentValue = document.createElement("span");
  lastPaymentValue.id = "last-payment";
  lastPaymentValue.textContent = formatCost(lastPayment.amount);
  paidOnDateAndAmount.appendChild(lastPaymentValue);

  const confirmationNumber = document.createElement("span");
  confirmationNumber.textContent = `Confirmation ${lastPayment.confirmationNumber}`;
  lastPaymentContent.appendChild(confirmationNumber);

  const paidByCustomer = document.createElement("span");
  paidByCustomer.textContent = `Paid by ${lastPayment.paidBy}`;
  lastPaymentContent.appendChild(paidByCustomer);

  loadIcons();
}

// Invoices tab ==========================================
function formatContent(content) {
  return content.map((invoice) => {
    return [
      {
        entryId: formatInvoiceEntryId(invoice.invoiceNumber ?? 0),
        id: invoice.id,
      }, // default to 0 if undefined
      formatCustomerName(
        { name: invoice.residentName, id: invoice.residentId },
        { name: invoice.payerName, id: invoice.payerId }
      ) ?? "N/A", // fallback name
      checkStatus(invoice.dueDateTimestamp, invoice.isPaid) ?? "Unknown", // fallback status
      formatCost(parseFloat(invoice.total) / 100 ?? 0), // default to 0 if missing
      invoice.frequencyInterval ?? "N/A",
      formatDate(invoice.dueDateTimestamp) ?? "N/A",
      formatDate(invoice.issueDateTimestamp) ?? "N/A",
      invoice.lastEvent ? `Invoice ${invoice.lastEvent}.` : "None",
      [
        {
          label: "View",
          icon: "visibility",
          action: () => {
            console.log("View invoice clicked: #", invoice.invoiceNumber);
          },
        },
        {
          label: "Edit Invoice",
          icon: "edit",
          action: () => {
            console.log("Edit invoice clicked: #", invoice.invoiceNumber);
          },
        },
        {
          label: "Delete Invoice",
          icon: "delete",
          action: () => {
            console.log("Delete invoice clicked: #", invoice.invoiceNumber);
          },
        },
      ],
    ];
  });
}

function displayInvoiceTable(invoices, containerDiv) {
  // fill in table
  const invoicesContainer =
    containerDiv ?? document.getElementById("table-container");

  // if there is a table, remove the old table
  const oldTable = invoicesContainer.querySelector(".generic-table");
  if (oldTable) {
    oldTable.remove();
  }

  const headers = INVOICE_HEADERS;

  //format invoices for the table
  const content = formatInvoiceContent(invoices);

  const sortFieldsMap = INVOICE_SORT_FIELDS;

  const table = createTable(
    headers,
    content,
    async (header, direction) => {
      const sortField = sortFieldsMap[header];
      if (!sortField) return;

      const sortedInvoices = await fetchSortedInvoices({
        sortField,
        sortDirection: direction,
      });

      console.log("Sorted Invoices:", sortedInvoices);

      const tableContainer = document.querySelector(".generic-table");

      updateTable(headers, formatContent(sortedInvoices), tableContainer);
      loadIcons();
    },
    true
  );
  invoicesContainer.appendChild(table);

  loadIcons();

  return invoicesContainer;
}

export async function displayInvoices(customerId) {
  console.log("Invoices button clicked");
  let activeFilters = {}; // Keep track of active filters

  const displayContainer = document.querySelector("#tab-display");
  displayContainer.classList.add("table");
  displayContainer.innerHTML = "";

  // Function to handle filter updates
  const handleFilterUpdate = async (filterName, selectedOptions) => {
    // Update the active filters
    if (selectedOptions.length === 0) {
      delete activeFilters[filterName];
    } else {
      activeFilters[filterName] = selectedOptions;
    }

    // Fetch new data with current filters
    const invoices = await fetchInvoices(
      customerId,
      undefined,
      undefined,
      activeFilters
    );
    console.log("Filtered Invoices:", invoices);

    // clear the table

    // display the new data
    displayInvoiceTable(invoices, displayContainer);
  };

  const filterBar = createFilterBar(INVOICE_FILTER_OPTIONS, handleFilterUpdate);
  displayContainer.appendChild(filterBar);

  // Initial fetch without filters
  const initialInvoices = await fetchInvoices(customerId);
  console.log("Initial Invoices:", initialInvoices);
  displayInvoiceTable(initialInvoices, displayContainer);
}

// Payments tab ==========================================
function displayPaymentsTable(payments, containerDiv) {
  // fill in table
  const paymentsContainer =
    containerDiv ?? document.getElementById("table-container");

  const headers = PAYMENTS_HEADERS;

  //format invoices for the table
  const content = formatPaymentsContent(payments);

  const table = createTable(headers, content, "payments-table");
  paymentsContainer.appendChild(table);

  loadIcons();

  return paymentsContainer;
}

export async function displayPayments(customerId) {
  console.log("Payments button clicked", customerId);

  const payments = await fetchPayments(customerId);
  console.log("Payments:", payments);

  const displayContainer = document.querySelector("#tab-display");
  displayContainer.classList.add("table");
  displayContainer.innerHTML = "";

  const filterBar = createFilterBar(PAYMENTS_FILTER_OPTIONS);
  displayContainer.appendChild(filterBar);

  displayPaymentsTable(payments, displayContainer);
}

// Details & Settings tab ==========================================
function buildCardFormContent(stripe) {
  // const container = document.createElement("div");
  // container.classList.add("card-container");

  // const cardTitle = document.createElement("span");
  // cardTitle.classList.add("bold", "modal-card-title");
  // cardTitle.textContent = "Add Credit or Debit Card";
  // container.appendChild(cardTitle);

  // const cardContent = document.createElement("div");
  // cardContent.classList.add("modal-card-content");
  // cardContent.id = "card-element";
  // container.appendChild(cardContent);

  // return container;
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card-container");

  const title = document.createElement("span");
  title.classList.add("bold", "modal-card-title");
  title.textContent = "Add Credit or Debit Card";
  cardContainer.appendChild(title);

  cardContainer.appendChild(document.createElement("hr"));

  const cardInput = document.createElement("div");
  cardInput.classList.add("card-input");
  cardContainer.appendChild(cardInput);

  const inputGroup = document.createElement("div");
  cardInput.appendChild(inputGroup);

  // Name on Card
  inputGroup.appendChild(
    createInput("Name on Card", "name-on-card", "Full Name")
  );

  // Card Number and CVV
  const row1 = document.createElement("div");
  row1.classList.add("input-row");
  row1.appendChild(
    createInput("Card Number", "card-number", "XXXX XXXX XXXX XXXX")
  );
  row1.appendChild(createInput("CVV", "CVV", "XXX", "cvv-wrapper"));
  inputGroup.appendChild(row1);

  // Exp Month, Exp Year, Zip Code
  const row2 = document.createElement("div");
  row2.classList.add("input-row");

  row2.appendChild(createMonthDropdown());
  row2.appendChild(createYearDropdown());
  row2.appendChild(createInput("Zip Code", "zip-code", "XXXXXX"));

  inputGroup.appendChild(row2);

  return cardContainer;
}

function buildBankFormContent() {
  const container = document.createElement("div");
  container.classList.add("card-container");

  const bankTitle = document.createElement("span");
  bankTitle.classList.add("bold", "modal-card-title");
  bankTitle.textContent = "Add Bank Account";
  container.appendChild(bankTitle);

  const bankContent = document.createElement("div");
  bankContent.classList.add("modal-card-content");
  bankContent.id = "bank-element";
  container.appendChild(bankContent);

  const bankForm = mountBankPayment();
  bankContent.appendChild(bankForm);

  return container;
}

// Helper to create text input
function createInput(labelText, id, placeholder, extraClass = "") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("input-wrapper");
  if (extraClass) wrapper.classList.add(extraClass);

  const label = document.createElement("label");
  label.classList.add("input-label");
  label.setAttribute("for", id);
  label.textContent = labelText;

  const input = document.createElement("input");
  input.classList.add("input-field");
  input.type = "text";
  input.id = id;
  input.placeholder = placeholder;

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

// Helper to create month dropdown
function createMonthDropdown() {
  const months = [
    "01 - Jan",
    "02 - Feb",
    "03 - Mar",
    "04 - Apr",
    "05 - May",
    "06 - Jun",
    "07 - Jul",
    "08 - Aug",
    "09 - Sep",
    "10 - Oct",
    "11 - Nov",
    "12 - Dec",
  ];

  const wrapper = document.createElement("div");
  wrapper.classList.add("input-wrapper");

  const label = document.createElement("label");
  label.classList.add("input-label");
  label.setAttribute("for", "exp-month");
  label.textContent = "Exp Month";

  const select = document.createElement("select");
  select.classList.add("input-field");
  select.id = "exp-month";

  const defaultOption = new Option("MM", "");
  select.appendChild(defaultOption);

  months.forEach((month, i) => {
    const option = new Option(month, String(i + 1).padStart(2, "0"));
    select.appendChild(option);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return wrapper;
}

// Helper to create year dropdown
function createYearDropdown() {
  const wrapper = document.createElement("div");
  wrapper.classList.add("input-wrapper");

  const label = document.createElement("label");
  label.classList.add("input-label");
  label.setAttribute("for", "exp-year");
  label.textContent = "Exp Year";

  const select = document.createElement("select");
  select.classList.add("input-field");
  select.id = "exp-year";

  const defaultOption = new Option("YY", "");
  select.appendChild(defaultOption);

  const currentYear = new Date().getFullYear();
  for (let i = 0; i <= 10; i++) {
    const year = currentYear + i;
    const option = new Option(year, year);
    select.appendChild(option);
  }

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return wrapper;
}

function displayAddCard(stripe) {
  console.log("Add Card button clicked");
  const container = buildCardFormContent(stripe);
  createModal(() => container);
}

function displayAddBank() {
  console.log("Add Bank button clicked");
  createModal(buildBankFormContent);
}

export function displaySettings(stripe) {
  const displayContainer = document.querySelector("#tab-display");
  displayContainer.classList.remove("table");
  displayContainer.innerHTML = ""; // Clear previous content

  const cardSection = document.createElement("div");
  cardSection.classList.add("card-section");
  displayContainer.appendChild(cardSection);

  const card = document.createElement("div");
  card.classList.add("card");
  cardSection.appendChild(card);

  const cardHeader = document.createElement("div");
  cardHeader.classList.add("card-header", "payments");
  card.appendChild(cardHeader);

  const cardLeft = document.createElement("div");
  cardLeft.classList.add("card-left");
  cardHeader.appendChild(cardLeft);

  const cardTitle = document.createElement("span");
  cardTitle.classList.add("bold");
  cardTitle.textContent = "Payment Methods";
  cardLeft.appendChild(cardTitle);

  const verticalDivider = document.createElement("hr");
  verticalDivider.classList.add("payments-divider", "light-grey");
  cardHeader.appendChild(verticalDivider);

  const cardRight = document.createElement("div");
  cardRight.classList.add("card-right");
  cardHeader.appendChild(cardRight);

  cardRight.appendChild(
    createPaymentMethodInput(
      "Credit Card",
      "credit_card",
      "Add credit or debit card",
      () => displayAddCard(stripe)
    )
  );

  const cardRightDivider = document.createElement("hr");
  cardRightDivider.classList.add("light-grey");
  cardRight.appendChild(cardRightDivider);

  cardRight.appendChild(
    createPaymentMethodInput(
      "Bank Account",
      "account_balance",
      "Add bank account",
      displayAddBank
    )
  );
}

function createPaymentMethodInput(title, icon, text, onclick) {
  const paymentMethodContainer = document.createElement("div");

  const paymentMethodTitle = document.createElement("span");
  paymentMethodTitle.classList.add("bold");
  paymentMethodTitle.textContent = title;
  paymentMethodContainer.appendChild(paymentMethodTitle);

  const paymentMethodWrapper = document.createElement("div");
  paymentMethodWrapper.classList.add("payment-method-wrapper");
  paymentMethodWrapper.onclick = onclick;
  paymentMethodContainer.appendChild(paymentMethodWrapper);

  const paymentMethodDiv = document.createElement("div");
  paymentMethodDiv.classList.add("payment-method");
  paymentMethodWrapper.appendChild(paymentMethodDiv);

  const paymentMethodIcon = document.createElement("span");
  paymentMethodIcon.classList.add("material-symbols-outlined", "card-icon");
  paymentMethodIcon.textContent = icon;
  paymentMethodDiv.appendChild(paymentMethodIcon);

  const paymentMethodText = document.createElement("span");
  paymentMethodText.textContent = text;
  paymentMethodDiv.appendChild(paymentMethodText);

  const addDiv = document.createElement("div");
  paymentMethodWrapper.appendChild(addDiv);

  const addIcon = document.createElement("span");
  addIcon.classList.add("material-symbols-outlined");
  addIcon.textContent = "add";
  addDiv.appendChild(addIcon);

  return paymentMethodContainer;
}
