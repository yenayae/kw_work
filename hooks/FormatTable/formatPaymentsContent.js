import formatCost from "../formatCost.js";
import formatDate from "../formatDate.js";

export const PAYMENTS_HEADERS = [
  "Payment Date",
  "Amount",
  "Customer",
  "Payment Status",
  "Source",
  "Payment Method",
  "Actions",
];

export const PAYMENT_SORT_FIELDS = {
  "Payment Date": "invoiceNumber",
  Amount: "total",
  Customer: "residentName",
  "Payment Status": "dueDateTimestamp",
  Source: "source",
  "Payment Method": "paymentMethod",
  Actions: "actions",
};

export const PAYMENTS_FILTER_OPTIONS = [
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

export function formatPaymentsContent(payments) {
  const formatted = payments.map((payment) => {
    return [
      formatDate(payment.paymentDate) ?? "N/A",
      formatCost(payment.amount ?? 0),
      payment.customer ?? "N/A",
      payment.paymentStatus ?? "N/A",
      payment.source ?? "N/A",
      payment.paymentMethod ?? "N/A",
      [
        {
          label: "Refund",
          icon: "attach_money",
          action: () => {
            console.log("View invoice clicked ID: ", payment.id);
          },
        },
        {
          label: "Send Receipt",
          icon: "send",
          action: () => {
            console.log("Edit invoice clicked ID: ", payment.id);
          },
        },
        {
          label: "Download Receipt",
          icon: "download",
          action: () => {
            console.log("Delete invoice clicked ID: ", payment.id);
          },
        },
      ],
    ];
  });

  console.log("Formatted payments:", formatted);
  return formatted;
}
