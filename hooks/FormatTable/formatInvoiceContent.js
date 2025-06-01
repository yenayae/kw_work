import { formatCustomerName } from "../formatFunctions.js";
import formatInvoiceEntryId from "../formatInvoiceEntryId.js";
import checkStatus from "../checkStatus.js";
import formatCost from "../formatCost.js";
import formatDate from "../formatDate.js";

export const INVOICE_HEADERS = [
  "Invoice #",
  "Customer",
  "Status",
  "Invoice Amount",
  // "Frequency",
  "Due Date",
  "Issue Date",
  // "Last Event",
  "Actions",
];

export const INVOICE_SORT_FIELDS = {
  "Invoice #": "invoiceNumber",
  Customer: "residentName",
  Status: "dueDateTimestamp", // more meaningful sort than isPaid
  "Invoice Amount": "total",
  // Frequency: "frequencyInterval",
  "Due Date": "dueDateTimestamp",
  "Issue Date": "issueDateTimestamp",
  // "Last Event": "lastEvent",
};

export const INVOICE_FILTER_OPTIONS = [
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

export function formatInvoiceContent(content) {
  return content.map((invoice) => {
    console.log("Formatting invoice:", invoice);

    let invoiceAmount = 0;
    for (const itemId in invoice.billingItemMap) {
      const item = invoice.billingItemMap[itemId];
      invoiceAmount += item.amount || 0;
    }

    return [
      //invoice entry id
      {
        entryId: formatInvoiceEntryId(invoice.invoiceNumber ?? 0),
        id: invoice.id,
      },

      //customer name
      formatCustomerName(
        { name: invoice.residentName, id: invoice.residentId },
        { name: invoice.payerName, id: invoice.payerId }
      ) ?? "N/A",

      //status
      checkStatus(invoice.dueDateTimestamp, invoice.isPaid) ?? "Unknown",

      //invoice amount
      formatCost(parseFloat(invoiceAmount) / 100 ?? 0), // default to -1 if missing

      //frequency
      // invoice.frequencyInterval ?? "N/A",

      //due date
      formatDate(invoice.dueDateTimestamp) ?? "N/A",

      //issue date
      formatDate(invoice.issueDateTimestamp) ?? "N/A",

      //last event
      // invoice.lastEvent ? `Invoice ${invoice.lastEvent}.` : "None",

      //actions
      [
        {
          label: "View Invoice",
          icon: "visibility",
          action: () => {
            console.log("View invoice clicked: #", invoice.invoiceNumber);
          },
        },

        {
          label: "Download Invoice",
          icon: "download",
          action: () => {
            console.log("Download invoice clicked ID: ", invoice.id);
          },
        },
        // {
        //   label: "Edit Invoice",
        //   icon: "edit",
        //   action: () => {
        //     console.log("Edit invoice clicked: #", invoice.invoiceNumber);
        //   },
        // },
        // {
        //   label: "Delete Invoice",
        //   icon: "delete",
        //   action: () => {
        //     console.log("Delete invoice clicked: #", invoice.invoiceNumber);
        //   },
        // },
      ],
    ];
  });
}
