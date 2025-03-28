import loadSettlements from "./settlements.js";
import loadProcessingPayments from "./processingPayments.js";
import loadPastDueInvoices from "./pastDueInvoices.js";
import loadRecentActivities from "./recentActivities.js";

//wait for fonts to load
document.fonts.ready.then(() => {
  document.querySelectorAll(".material-symbols-outlined").forEach((el) => {
    el.style.visibility = "visible";
  });
});

loadProcessingPayments();
loadSettlements();
loadPastDueInvoices();
loadRecentActivities();
