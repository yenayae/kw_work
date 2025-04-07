import { fetchPayments } from "./hooks/firestore.js";
import loadIcons from "./hooks/loadIcons.js";
import createTable from "./hooks/createTable.js";
import createFilterBar from "./hooks/createFilterBar.js";
import formatDate from "./hooks/formatDate.js";
import formatCost from "./hooks/formatCost.js";

const FILTER_OPTIONS = [
  "Payment Amount",
  "Status",
  "Source",
  "Date Paid",
  "Deposit Sent Date",
];

async function loadPayments() {
  const payments = await fetchPayments();
  displayPayments(payments);
}

function displayPayments(payments) {
  console.log("Payments:", payments);

  const filterContainer = document.querySelector("#filter-container");
  const filterBar = createFilterBar(FILTER_OPTIONS);
  filterContainer.appendChild(filterBar);

  displayTable(payments);
}

function displayTable(payments) {
  const tableContainer = document.getElementById("table-container");

  const headers = [
    "Payment Date",
    "Amount",
    "Customer",
    "Payment Status",
    "Source",
    "Payment Method",
    "Actions",
  ];

  const content = payments.map((payment) => {
    return [
      formatDate(payment.paymentDate) ?? "N/A",
      formatCost(payment.amount ?? 0),
      payment.customer ?? "N/A",
      payment.paymentStatus ?? "N/A",
      payment.source ?? "N/A",
      payment.paymentMethod ?? "N/A",
      false,
    ];
  });

  const table = createTable(headers, content, "payments-table");
  tableContainer.appendChild(table);
}

loadPayments();
loadIcons();
