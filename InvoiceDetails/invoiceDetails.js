import loadIcons from "../hooks/loadIcons.js";
import formatCost from "../hooks/formatCost.js";
import { payInvoiceStripe } from "../hooks/PayInvoice/payInvoice.js";
import { fetchInvoiceById } from "../hooks/firestore.js";

loadIcons();

console.log("Loading icons...");

const CUSTOMER_ID = "rBCPLxqkvhU9bnLN2ttU";

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

function displayInvoiceData(invoiceData) {
  const displayAmount = document.querySelector("#invoice-amount");
  let invoiceAmount = 0;
  for (const itemId in invoiceData.billingItemMap) {
    const item = invoiceData.billingItemMap[itemId];
    invoiceAmount += item.amount || 0;
  }

  console.log("Invoice Amount:", invoiceAmount);
  displayAmount.textContent = formatCost(invoiceAmount / 100);
}

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

  const paymentMethodId = "ba_1RKUKUAk76Jp7S9GNviSXXje";

  payInvoiceStripe(invoiceId, userId, paymentMethodId);
};

fetchInvoiceData();
