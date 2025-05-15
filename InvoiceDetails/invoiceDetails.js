import loadIcons from "../hooks/loadIcons.js";
import formatCost from "../hooks/formatCost.js";
import { fetchInvoiceById } from "../hooks/firestore.js";

loadIcons();

console.log("Loading icons...");

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
  const invoiceAmount = document.querySelector("#invoice-amount");
  invoiceAmount.textContent = formatCost(invoiceData.total / 100);
}

function displayInvoiceData(invoiceData) {}

fetchInvoiceData();
