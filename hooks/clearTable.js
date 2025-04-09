export default function clearTable() {
  //clear filter bar content
  const filterBar = document.querySelector("#filter-bar");
  if (filterBar) {
    filterBar.remove();
  }

  //clear previous table content
  const tableContainer = document.getElementById("table-container");
  if (tableContainer.firstChild) {
    tableContainer.innerHTML = ""; // Clear the table container
  }
}
