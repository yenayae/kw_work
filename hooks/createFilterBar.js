export default function createFilterBar(filters) {
  // create filter bar container if it doesn't already exist
  const filterBar = document.createElement("div");
  filterBar.classList.add("filter-bar");
  filterBar.id = "filter-bar";

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
