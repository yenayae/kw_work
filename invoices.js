import {
  fetchInvoices,
  fetchInvoicesByFrequency,
  fetchSortedInvoices,
} from "./hooks/firestore.js";
import {
  createTable,
  createTableContent,
  updateTable,
} from "./hooks/createTable.js";
import createFilterBar from "./hooks/createFilterBar.js";
import loadIcons from "./hooks/loadIcons.js";
import formatCost from "./hooks/formatCost.js";
import formatDate from "./hooks/formatDate.js";
import formatInvoiceEntryId from "./hooks/formatInvoiceEntryId.js";
import checkStatus from "./hooks/checkStatus.js";
import setSearchBarPlaceholder from "./hooks/setSearchBarPlaceholder.js";
import { clearTable, clearFilter, clearOptions } from "./hooks/clearTable.js";
import createOptionsButton from "./hooks/createOptionsButton.js";

function formatCustomerName(resident, payer) {
  if (resident.id === payer.id) {
    return resident.name;
  }

  return `${resident.name} c/o ${payer.name}`;
}

function addOptionButton(label, isBlue = false) {
  document
    .querySelector("#options-buttons")
    .appendChild(createOptionsButton(label, isBlue));
}

//change tabs
let pageTab = "all"; // default tab

window.setPageTab = function (tab) {
  pageTab = tab;

  console.log(pageTab);

  // Remove 'selected' class from all tabs
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tabEl) => tabEl.classList.remove("selected"));

  const selectedTab = document.querySelector(
    `.tab-bar .tab[onclick*="${tab}"]`
  );
  if (selectedTab) {
    selectedTab.classList.add("selected");
  }

  loadIcons();

  //load corresponding data based on the selected tab
  if (pageTab === "one-time") {
    //clear previous options
    clearOptions();

    //set specific option button
    addOptionButton("Export");
    addOptionButton("Invoice", true);

    loadOneTimeInvoices();
  } else if (pageTab === "recurring") {
    //clear previous options
    clearOptions();

    //set specific option button
    addOptionButton("Export");
    addOptionButton("Recurring Invoice", true);

    loadRecurringInvoices();
  } else if (pageTab === "all") {
    //clear previous options
    clearOptions();

    //set specific option button
    addOptionButton("Export");
    addOptionButton("Invoice", true);
    addOptionButton("Recurring Invoice", true);

    loadInvoices();
  }

  //set search bar placeholder
  setSearchBarPlaceholder(tab);
};

/* display invoices start */
const FILTER_OPTIONS = [
  "Invoice Status",
  "Amount",
  "Issue Date",
  "Due Date",
  "Invoice Date(s)",
  "Payment Status",
];

async function loadOneTimeInvoices() {
  const invoices = await fetchInvoicesByFrequency(0); // 0 for one-time invoices

  displayInvoices(invoices);
}

async function loadRecurringInvoices() {
  const invoices = await fetchInvoicesByFrequency(1); // 1 for recurring invoices

  displayInvoices(invoices);
}

async function loadInvoices() {
  const invoices = await fetchInvoices();

  // Display information
  displayInvoices(invoices);
}

function displayInvoices(invoices) {
  console.log("Invoices:", invoices);

  //clear previous filters
  clearFilter();

  // set filters
  const filterContainer = document.querySelector("#filter-container");
  const filterBar = createFilterBar(FILTER_OPTIONS);
  filterContainer.appendChild(filterBar);

  displayTable(invoices);
}

function formatContent(content) {
  return content.map((invoice) => {
    return [
      formatInvoiceEntryId(invoice.invoiceNumber ?? 0), // default to 0 if undefined
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

function displayTable(invoices) {
  //clear previous content
  clearTable();

  // fill in table
  const invoicesContainer = document.getElementById("table-container");

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
  const content = formatContent(invoices);

  const sortFieldsMap = {
    "Invoice #": "invoiceNumber",
    Customer: "residentName",
    Status: "dueDateTimestamp", // more meaningful sort than isPaid
    "Invoice Amount": "total",
    Frequency: "frequencyInterval",
    "Due Date": "dueDateTimestamp",
    "Issue Date": "issueDateTimestamp",
    "Last Event": "lastEvent",
  };

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
} // load icons
/* display invoices end */

/* uploading to database start */
async function addOneTimeInvoice() {
  console.log("add one time invoice clicked");
}

async function addRecurringInvoice() {
  console.log("add recurring invoice clicked");
}

/* uploading to database end */

//call function
loadIcons();
loadInvoices();
