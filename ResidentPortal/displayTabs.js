import loadIcons from "../hooks/loadIcons.js";
import formatCost from "../hooks/formatCost.js";
import formatDate from "../hooks/formatDate.js";

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
  scheduledPaymentsDueDate.textContent = `Due on ${formatDate(
    scheduledPayments.dueDate
  )}`;
  moneyAndDate.appendChild(scheduledPaymentsDueDate);

  const invoiceDescription = document.createElement("span");
  invoiceDescription.textContent = scheduledPayments.description;
  scheduledPaymentsHeader.appendChild(invoiceDescription);

  const autoPayAndEdit = document.createElement("div");
  autoPayAndEdit.classList.add("space-between-section");
  scheduledPaymentsHeader.appendChild(autoPayAndEdit);

  const autopayCreatedBy = document.createElement("span");
  autopayCreatedBy.textContent = `Autopay created by ${scheduledPayments.createdBy}`;
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
  confirmationNumber.textContent = `Confirmation #${lastPayment.confirmationNumber}`;
  lastPaymentContent.appendChild(confirmationNumber);

  const paidByCustomer = document.createElement("span");
  paidByCustomer.textContent = `Paid by ${lastPayment.paidBy}`;
  lastPaymentContent.appendChild(paidByCustomer);

  loadIcons();
}

// Details & Settings tab ==========================================

function displayAddCard() {
  console.log("Add Card button clicked");
}

function displayAddBank() {
  console.log("Add Bank button clicked");
}

export function displaySettings() {
  const displayContainer = document.querySelector("#tab-display");
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
      displayAddCard
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
