import { fetchResidents, fetchPayers } from "./hooks/firestore.js";
import createTable from "./hooks/createTable.js";
import createFilterBar from "./hooks/createFilterBar.js";
import loadIcons from "./hooks/loadIcons.js";
import formatCost from "./hooks/formatCost.js";
import formatDate from "./hooks/formatDate.js";
import { clearTable } from "./hooks/clearTable.js";
import setSearchBarPlaceholder from "./hooks/setSearchBarPlaceholder.js";

let pageTab = "residents"; // default tab

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
  if (pageTab === "residents") {
    //set specific option button
    document.querySelector("#add-item-button").textContent = "Customer";

    loadResidents();
  } else if ((pageTab = "payers")) {
    //set specific option button
    document.querySelector("#add-item-button").textContent = "Customer";

    loadPayers();
  }

  //set search bar placeholder
  setSearchBarPlaceholder(tab);
};

/* display table start */
const FILTER_OPTIONS = {
  residents: ["Name", "Contact Info"],
  payers: ["Name"],
};

async function loadResidents() {
  const customers = await fetchResidents();

  // Display information
  displayData(customers);
}

async function loadPayers() {
  const payers = await fetchPayers();

  displayData(payers);
}

function displayData(customers) {
  console.log("customers:", customers);
  console.log("pagetabe:", pageTab);

  // set filters
  const filterContainer = document.querySelector("#filter-container");
  const filterBar = createFilterBar(FILTER_OPTIONS[pageTab]);
  filterContainer.appendChild(filterBar);

  displayTable(customers);
  loadIcons();
}

function displayTable(customers) {
  // fill in table
  const tableContainer = document.getElementById("table-container");

  const headers = ["Name", "Contact Info"];

  //format products for the table
  const content = customers.map((customer) => {
    return [
      customer.name ?? "N/A",
      `${customer.email}, ${customer.phoneNumber}` ?? "N/A",
    ];
  });

  const table = createTable(headers, content);
  tableContainer.appendChild(table);
} // load icons
/* display table end */

//call function
loadIcons();
setSearchBarPlaceholder(pageTab);
loadResidents();
