import { fetchProducts } from "./hooks/firestore.js";
import createTable from "./hooks/createTable.js";
import createFilterBar from "./hooks/createFilterBar.js";
import loadIcons from "./hooks/loadIcons.js";
import formatCost from "./hooks/formatCost.js";
import formatDate from "./hooks/formatDate.js";

let pageTab = "products"; // default tab

//change tabs function
window.setPageTab = function (tab) {
  pageTab = tab;

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

  //clear filter bar content
  const filterBar = document.querySelector("#filter-bar");
  if (filterBar.firstChild) {
    console.log("clearing filter bar");
    filterBar.innerHTML = ""; // Clear the filter bar
  }

  //clear previous table content
  const tableContainer = document.getElementById("table-container");
  if (tableContainer.firstChild) {
    console.log("clearing");
    tableContainer.innerHTML = ""; // Clear the table container
  }

  //load corresponding data based on the selected tab
  if (pageTab === "products") {
    loadProducts();
  } else if (pageTab === "discounts") {
    loadDiscounts();
  } else if (pageTab === "taxes") {
    loadTaxes();
  }
};

/* display invoices start */
const FILTER_OPTIONS = [
  "Price",
  "Category",
  "Qty on Hand",
  "Last Inventory Update",
  "Date Added",
  "Taxable",
];

//load products function
async function loadProducts() {
  console.log("Loading products...");
  const products = await fetchProducts();

  // Display information
  displayData(products);
}

//load discounts
async function loadDiscounts() {
  console.log("Loading discounts...");
  // Fetch discounts from the database or API
}

function loadTaxes() {
  console.log("Loading taxes...");
  // Fetch taxes from the database or API
}

function displayData(products) {
  console.log("products:", products);

  // set filters
  const filterContainer = document.querySelector("#filter-container");
  const filterBar = createFilterBar(FILTER_OPTIONS);
  filterContainer.appendChild(filterBar);

  displayTable(products);
  loadIcons();
}

function displayTable(products) {
  // fill in table
  const tableContainer = document.getElementById("table-container");

  const headers = [
    "Name",
    "Price",
    "Category",
    "Description",
    "Qty on Hand",
    "Last inventory Update",
    "Date Added",
    "Taxable",
    "Actions",
  ];

  //format products for the table
  const content = products.map((product) => {
    return [
      product.name ?? "N/A",
      formatCost(product.price ?? 0),
      product.category ?? "N/A",
      product.description ?? "N/A",
      (product.quantityOnHand == 0 ? "-" : product.quantityOnHand) ?? "N/A",
      product.lastInventoryUpdate ?? "N/A",
      formatDate(product.dateAdded) ?? "N/A",
      (product.taxable ? "Yes" : "No") ?? "N/A",
      true,
    ];
  });

  const table = createTable(headers, content);
  tableContainer.appendChild(table);
} // load icons
/* display invoices end */

/* uploading to database end */

//call function
loadIcons();
loadProducts();
