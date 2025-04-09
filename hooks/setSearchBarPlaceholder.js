export default function setSearchBarPlaceholder(category) {
  const searchBar = document.querySelector("#table-search-bar");
  searchBar.placeholder = `Search by ${category}...`;
}
