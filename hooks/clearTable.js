export function clearTable() {
  //clear previous table content
  const tableContainer = document.getElementById("table-container");
  if (tableContainer.firstChild) {
    tableContainer.innerHTML = ""; // Clear the table container
  }
}

export function clearFilter() {
  //clear filter bar content
  const filterBar = document.querySelector("#filter-bar");
  if (filterBar) {
    filterBar.remove();
  }
}

export function clearOptions() {
  //clear options bar content
  const optionsBar = document.querySelector("#options-buttons");
  if (optionsBar) {
    optionsBar.innerHTML = ""; // Clear the options bar content
  }
}
