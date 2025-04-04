import { fetchInvoices } from "./hooks/firestore.js";
import createTable from "./hooks/createTable.js";
import loadIcons from "./hooks/loadIcons.js";
import formatCost from "./hooks/formatCost.js";
import formatDate from "./hooks/formatDate.js";
import formatInvoiceEntryId from "./hooks/formatInvoiceEntryId.js";

const FILTER_OPTIONS = [
  "Invoice Status",
  "Amount",
  "Issue Date",
  "Due Date",
  "Invoice Date(s)",
  "Payment Status",
];

async function loadInvoices() {
  console.log("Loading invoices...");
  const invoices = await fetchInvoices();

  // Display information
  displayInvoices(invoices);
}

function displayInvoices(invoices) {
  console.log("Invoices:", invoices);

  // set filters
  const filterContainer = document.querySelector("#filter-container");
  const filterBar = createFilterBar(FILTER_OPTIONS);
  filterContainer.appendChild(filterBar);

  displayTable(invoices);
}

function displayTable(invoices) {
  // fill in table
  const invoicesContainer = document.getElementById("table-container");

  //clear previous table content
  //   invoicesContainer.innerHTML = "";
  invoicesContainer.removeChild(invoicesContainer.firstChild);

  const headers = [
    "Invoice #",
    "Customer",
    "Status",
    "Invoice Amount",
    "Frequency",
    "Due Date",
    "Issue Date",
    "Last Event",
    "Actions",
  ];

  //format invoices for the table
  const content = invoices.map((invoice) => {
    return [
      formatInvoiceEntryId(invoice.entryId ?? 0), // default to 0 if undefined
      invoice.customerName ?? "N/A", // fallback name
      invoice.paidStatus ?? "Unknown", // fallback status
      formatCost(invoice.invoiceAmount ?? 0), // default to 0 if missing
      invoice.frequency ?? "N/A",
      formatDate(invoice.dueDate) ?? "N/A",
      formatDate(invoice.issueDate) ?? "N/A",
      invoice.lastEvent ?? "None",
      true,
    ];
  });

  const table = createTable(headers, content);
  invoicesContainer.appendChild(table);
}

function createFilterBar(filters) {
  // create filter bar container if it doesn't already exist
  const filterBar = document.createElement("div");
  filterBar.classList.add("filter-bar");

  // iterate over filters and create buttons
  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.classList.add("filter-button");

    const icon = document.createElement("span");
    icon.classList.add("material-symbols-outlined", "plus-icon");
    icon.textContent = "add";

    const label = document.createElement("span");
    label.textContent = filter;

    // append icon and label to the button
    button.appendChild(icon);
    button.appendChild(label);

    // append the button to the filter bar
    filterBar.appendChild(button);
  });

  return filterBar;
}

//call function
loadIcons(); // load icons
loadInvoices();
