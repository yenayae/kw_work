import { fetchPastDueInvoices } from "./hooks/firestore.js";
import formatCost from "./hooks/formatCost.js";
import formatTimePassed from "./hooks/formatTimePassed.js";

export default async function loadPastDueInvoices() {
  const pastDueInvoices = await fetchPastDueInvoices();
  console.log("Past Due Invoices:", pastDueInvoices);

  //display information
  displayPastDueInvoices(pastDueInvoices);
}

/* 
FORMAT OF PAST DUE INVOICES
    <div class="generic-entry">
        <div class="past-due-balance-list">
            <span>2 weeks ago</span>
            <span class="primary">#0000421</span>
            <span class="primary">Estella, Banks c/o Salome Banks</span>
        </div>
        <div class="pdb-arrow">
            <span>$5,311.09</span>
            <i class="fa-solid fa-chevron-right entry-arrow"></i>
        </div>
    </div>
*/

function displayPastDueInvoices(pastDueInvoices) {
  //conditional render: set amount of past invoices on title span
  if (pastDueInvoices.length !== 0) {
    const pastDueInvoicesTitle = document.querySelector("#past-due-invoice");
    pastDueInvoicesTitle.textContent = `Past Due Invoices (${pastDueInvoices.length})`;
  }

  //display total balance
  const totalBalance = pastDueInvoices.reduce((acc, invoice) => {
    return acc + invoice.amount;
  }, 0);
  const totalBalanceSpan = document.querySelector("#past-due-balance-amount");
  totalBalanceSpan.textContent = formatCost(totalBalance);

  //display invoices
  const pastDueInvoicesContainer = document.getElementById(
    "past-due-invoices-container"
  );
  for (const invoice of pastDueInvoices) {
    let invoiceElement = createInvoiceElement(invoice);
    pastDueInvoicesContainer.appendChild(invoiceElement);
  }
}

function createInvoiceElement(invoice) {
  //create elements
  const invoiceElement = document.createElement("div");
  const invoiceBalanceList = document.createElement("div");
  const invoiceDate = document.createElement("span");
  const invoiceEntryId = document.createElement("span");
  const invoiceName = document.createElement("span");
  const invoiceArrowWrapper = document.createElement("div");
  const invoiceAmount = document.createElement("span");
  const invoiceArrow = document.createElement("i");

  //add classes
  invoiceElement.classList.add("generic-entry");
  invoiceBalanceList.classList.add("past-due-balance-list");
  invoiceEntryId.classList.add("primary");
  invoiceName.classList.add("primary");
  invoiceArrowWrapper.classList.add("pdb-arrow");
  invoiceArrow.classList.add("fa-solid", "fa-chevron-right", "entry-arrow");

  //add text content
  invoiceDate.textContent = formatTimePassed(invoice.dueDate);
  invoiceEntryId.textContent = `#${invoice.entryId
    .toString()
    .padStart(7, "0")}`;
  invoiceName.textContent = invoice.clientName;
  invoiceAmount.textContent = formatCost(invoice.amount);

  //append items
  invoiceBalanceList.appendChild(invoiceDate);
  invoiceBalanceList.appendChild(invoiceEntryId);
  invoiceBalanceList.appendChild(invoiceName);
  invoiceArrowWrapper.appendChild(invoiceAmount);
  invoiceArrowWrapper.appendChild(invoiceArrow);
  invoiceElement.appendChild(invoiceBalanceList);
  invoiceElement.appendChild(invoiceArrowWrapper);

  return invoiceElement;
}
