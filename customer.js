import loadIcons from "./hooks/loadIcons";

const params = new URLSearchParams(window.location.search);
const customerId = params.get("customerId");

if (!customerId) {
  alert("No customer ID provided in the URL.");
}

console.log("cid", customerId);

document.querySelector("#header-label").textContent = customerId;

loadIcons();
