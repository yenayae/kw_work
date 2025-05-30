import { fetchPayments } from "./hooks/firestore.js";
import loadIcons from "./hooks/loadIcons.js";
import { createTable } from "./hooks/createTable.js";
import createFilterBar from "./hooks/createFilterBar.js";
import formatDate from "./hooks/formatDate.js";
import formatCost from "./hooks/formatCost.js";

const FILTER_OPTIONS = [
  { name: "Invoice Status", options: ["Paid", "Scheduled", "Past Due"] },
  {
    name: "Amount",
    options: [
      "All",
      "0 - 100",
      "100 - 200",
      "200 - 500",
      "500 - 1000",
      "1000+",
    ],
  },
  { name: "Issue Date", options: ["Today", "Not Today"] },
  { name: "Due Date", options: ["Today", "Not Today"] },
  { name: "Invoice Date(s)", options: ["Today", "Not Today"] },
  { name: "Payment Status", options: ["Paid", "Unpaid", "Past Due"] },
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
  loadIcons();
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
      [
        {
          label: "Refund",
          icon: "attach_money",
          action: () => {
            console.log("View invoice clicked ID: ", payment.id);
          },
        },
        {
          label: "Send Receipt",
          icon: "send",
          action: () => {
            console.log("Edit invoice clicked ID: ", payment.id);
          },
        },
        {
          label: "Download Receipt",
          icon: "download",
          action: () => {
            console.log("Delete invoice clicked ID: ", payment.id);
          },
        },
      ],
    ];
  });

  const table = createTable(headers, content, "payments-table");
  tableContainer.appendChild(table);
}

loadPayments();
loadIcons();
