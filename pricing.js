import { fetchProducts } from "./hooks/firestore.js";
import createTable from "./hooks/createTable.js";
import createFilterBar from "./hooks/createFilterBar.js";
import loadIcons from "./hooks/loadIcons.js";
import formatCost from "./hooks/formatCost.js";
import formatDate from "./hooks/formatDate.js";
import clearTable from "./hooks/clearTable.js";
import setSearchBarPlaceholder from "./hooks/setSearchBarPlaceholder.js";

let pageTab = "products"; // default tab

//change tabs function
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

  //clear previous content
  clearTable();

  //load corresponding data based on the selected tab
  if (pageTab === "products") {
    //set specific option button
    document.querySelector("#add-item-button").textContent = "Product";

    loadProducts();
  } else if (pageTab === "discounts") {
    //set specific option button
    document.querySelector("#add-item-button").textContent =
      "Discount / Surcharge";

    loadDiscounts();
  } else if (pageTab === "taxes") {
    //set specific option button
    document.querySelector("#add-item-button").textContent = "Tax";

    loadTaxes();
  }

  //set search bar placeholder
  setSearchBarPlaceholder(tab);
};

/* display invoices start */
const FILTER_OPTIONS = {
  products: [
    "Price",
    "Category",
    "Qty on Hand",
    "Last Inventory Update",
    "Date Added",
    "Taxable",
  ],
  discounts: ["Type", "Calculation", "Date Added"],
  taxes: ["Region", "Tax Rate", "Effective Date"],
};

async function loadProducts() {
  console.log("Loading products...");
  const products = await fetchProducts();

  // Display information
  displayData(products);
}

async function loadDiscounts() {
  console.log("Loading discounts...");

  // TODO: Fetch discounts from the database or API
  const discounts = await fetchProducts();
  displayData(discounts);
}

async function loadTaxes() {
  console.log("Loading taxes...");
  // TODO: Fetch taxes from the database or API
  const taxes = await fetchProducts();
  displayData(taxes);
}

function displayData(products) {
  console.log("products:", products);
  console.log("pagetabe:", pageTab);

  // set filters
  const filterContainer = document.querySelector("#filter-container");
  const filterBar = createFilterBar(FILTER_OPTIONS[pageTab]);
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
setSearchBarPlaceholder(pageTab);
loadProducts();
