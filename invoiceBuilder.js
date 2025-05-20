import { uploadInvoice, fetchData } from "./hooks/firestore.js";
import stripeConfig from "../hooks/stripe-config.js";
import loadIcons from "./hooks/loadIcons.js";

import {
  Timestamp,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import formatDate from "./hooks/formatDate.js";

let selectedCustomer = null;
const TEST_ACCOUNT_ID = "acct_1RFsHoAk76Jp7S9G";

const HEROKU_URL = stripeConfig.serverUrl;

//select specific customer
window.searchCustomers = async function () {
  event.preventDefault();
  console.log("Searching customers...");
  const customers = await fetchData("customers");

  //display customers
  displayCustomers(customers);
};

function displayCustomers(customers) {
  console.log("Customers:", customers);

  const customersContainer = document.getElementById("customer-list");
  customersContainer.innerHTML = ""; // Clear previous content

  const customerList = document.getElementById("customer-list");

  for (const customer of customers) {
    const customerElement = document.createElement("div");
    customerElement.classList.add("customer-entry");
    customerElement.onclick = function () {
      // clear customer list
      customerList.innerHTML = "";

      console.log("Selected customer:", customer);
      const customerSelected = document.getElementById("customer-selected");
      customerSelected.textContent = `${customer.name}`;
      customerSelected.dataset.value = customer.id;
      selectedCustomer = customer;

      const removeCustomer = document.createElement("button");
      removeCustomer.classList.add("remove-customer-button");

      const removeCustomerIcon = document.createElement("span");
      removeCustomerIcon.classList.add(
        "material-symbols-outlined",
        "close-icon"
      );
      removeCustomerIcon.textContent = "close";
      removeCustomer.appendChild(removeCustomerIcon);

      //clear selected customer
      removeCustomer.onclick = function () {
        customerSelected.textContent = "";
        customerList.innerHTML = "";
        customerSelected.dataset.value = null;
        selectedCustomer = null;
      };

      customerSelected.appendChild(removeCustomer);
      loadIcons();
    };

    const customerName = document.createElement("span");
    customerName.textContent = `${customer.name}`;
    customerElement.appendChild(customerName);

    const customerEmail = document.createElement("span");
    customerEmail.textContent = customer.email;
    customerElement.appendChild(customerEmail);

    customersContainer.appendChild(customerElement);
  }
}

window.addInvoice = async function (event) {
  event.preventDefault();

  //get invoice amount
  const invoiceSubtotal = Math.floor(
    parseFloat(document.getElementById("invoice-amount").value) * 100
  );

  console.log("Invoice subtotal:", invoiceSubtotal);

  const billingItems = [
    {
      amount: invoiceSubtotal,
      quantity: 1,
      coaId: "coa_001",
      coaName: "Example Fee",
      roomFacilityId: "room_123",
      isRecurring: true,
      startDate: "2025-05-01",
      notes: "",
    },
  ];

  let invoiceData = createInvoiceObject(selectedCustomer, billingItems);

  //upload records to firestore
  uploadInvoice(invoiceData)
    .then(() => {
      console.log("Invoice uploaded successfully!");

      // return;

      //redirect back to inovices page
      window.location.href = "/invoices.html";
    })
    .catch((error) => {
      console.error("Error uploading invoice:", error);
    });
};

function calculateTotalAmount(itemMap) {
  return Object.values(itemMap).reduce(
    (total, item) => total + item.amount * item.quantity,
    0
  );
}

function createInvoiceObject(selectedCustomer, billingItems) {
  const notifyDate = new Date("2025-05-07T00:00:00");
  const issueDate = new Date("2025-05-07T00:00:00");
  const dueDate = new Date("2025-05-10T00:00:00");

  const toTimestamp = (date) => Timestamp.fromDate(date);

  const billingItemMap = {};
  const billingItemIds = [];

  billingItems.forEach((item, index) => {
    const itemId = `item${index + 1}`;
    billingItemIds.push(itemId);

    billingItemMap[itemId] = {
      id: itemId,
      amount: item.amount,
      quantity: item.quantity,
      coaId: item.coaId,
      coaName: item.coaName,
      residentId: selectedCustomer.id,
      residentName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      roomFacilityId: item.roomFacilityId,
      isRecurring: item.isRecurring,
      startDate: toTimestamp(new Date(item.startDate)),
      createdAt: toTimestamp(new Date()),
      notes: item.notes || "",
    };
  });

  const invoiceData = {
    billTo: {
      fName: selectedCustomer.firstName || "N/A",
      lName: selectedCustomer.lastName || "N/A",
      email: selectedCustomer.email || "",
      phoneNum: selectedCustomer.phoneNum || "",
      contactId: selectedCustomer.id,
    },
    invoiceMessage: "",
    notifyDateTimestamp: toTimestamp(notifyDate),
    notifyDateVal: "2025-05-07",
    issueDateTimestamp: toTimestamp(issueDate),
    issueDateVal: "2025-05-07",
    dueDateTimestamp: toTimestamp(dueDate),
    residentId: selectedCustomer.id,
    residentName: "Bailey Pong",
    isPaid: false,
    notifyByEmail: true,
    byStaffName: "Scheduled",
    invoiceNumber: 1000000021,
    repeatInterval: "1",
    repeatFrequency: "byMonth",
    billingItemIds,
    billingItemMap,
  };

  return invoiceData;
}
