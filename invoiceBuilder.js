import { uploadInvoice, fetchData } from "./hooks/firestore.js";
import stripeConfig from "../hooks/stripe-config.js";
import loadIcons from "./hooks/loadIcons.js";

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

  let invoiceData = createInvoiceObject(selectedCustomer);

  const invoiceStripePayload = {
    connectedAccountId: TEST_ACCOUNT_ID,
    customerId: selectedCustomer.stripeId,
    amount: invoiceData.total,
    currency: "usd",
  };

  console.log(invoiceData);
  console.log(invoiceStripePayload.amount);

  //send invoice through stripe
  const response = await fetch(`${HEROKU_URL}create-invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoiceStripePayload),
  });

  const data = await response.json();

  if (response.ok) {
    alert("Invoice created successfully!");

    invoiceData = {
      ...invoiceData,
      stripeId: data.invoiceId,
    };

    console.log(data);
  } else {
    console.error("invoice creation failed:", data.error);
    alert("Error: " + data.error);
  }

  //upload records to firestore
  uploadInvoice(invoiceData)
    .then(() => {
      console.log("Invoice uploaded successfully!");

      //redirect back to inovices page
      window.location.href = "/invoices.html";
    })
    .catch((error) => {
      console.error("Error uploading invoice:", error);
    });
};

function createInvoiceObject(data) {
  console.log(data);

  const invoiceSubtotal = Math.floor(
    parseFloat(document.getElementById("invoice-amount").value) * 100
  );

  const invoiceDiscount = 0;
  const invoiceCredits = 0;
  const invoiceTotal = invoiceSubtotal - invoiceDiscount - invoiceCredits;

  const invoiceData = {
    billingData: [
      // you can replace this with dynamic data
      {
        description: "Rent for May",
        amount: 1000,
      },
    ],
    residentId: "TEST_USER_ID",
    residentName: "John Doe",
    payerId: data.id,
    payerName: data.name,
    payerEmail: data.email ?? null,
    payerPhoneNum: data.phoneNum ?? null,
    isPaid: false,
    dueDateIndex: 0,
    dueDateVal: "05/14/2024",
    dueDateTimestamp: new Date("2024-05-14"),
    issueDateVal: "05/14/2024",
    issueDateTimestamp: new Date("2024-05-14"),
    notifyDateVal: "05/14/2024",
    notifyDateTimestamp: new Date("2024-05-14"),
    subtotal: invoiceSubtotal,
    discounts: invoiceDiscount,
    credits: invoiceCredits,
    total: invoiceTotal,
    status: "Scheduled",
    statusIndex: 0,
    frequencyType: 0,
    frequencyIntervalIndex: 1,
    frequencyInterval: "Monthly",
    recurringPaymentId: "",
    pdfLink: "https://example.com/invoice/0001.pdf",
    byStaffId: "staff_001",
    byStaffName: "Admin User",
  };
  return invoiceData;
}
