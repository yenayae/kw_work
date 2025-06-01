import formatCost from "../formatCost.js";
import formatDate from "../formatDate.js";
import formatInvoiceEntryId from "../formatInvoiceEntryId.js";

export const PAYMENTS_HEADERS = [
  "Invoice #",
  "Payment Date",
  "Amount",
  // "Customer",
  "Payment Status",
  "Source",
  "Payment Method",
  "Actions",
];

export const PAYMENT_SORT_FIELDS = {
  "Invoice #": "invoiceNumber",
  "Payment Date": "invoiceNumber",
  Amount: "total",
  // Customer: "residentName",
  "Payment Status": "dueDateTimestamp",
  Source: "source",
  "Payment Method": "paymentMethod",
  Actions: "actions",
};

export const PAYMENTS_FILTER_OPTIONS = [
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
  { name: "Paid Date", options: ["Today", "Not Today"] },
];

export function formatPaymentsContent(payments) {
  const formatted = payments.map((payment) => {
    console.log("payment object:", payment);

    //calculate amount
    let invoiceAmount = 0;
    const billingMap = payment.invoiceData.billingItemMap;
    for (const itemId in billingMap) {
      const item = billingMap[itemId];
      invoiceAmount += item.amount || 0;
    }
    invoiceAmount /= 100;

    //figure out status
    let paymentStatus = "";

    console.log(payment.invoiceData.isPaid);
    if (payment.invoiceData.isPaid) {
      paymentStatus = "paid";
    } else {
      paymentStatus = "error";
    }

    return [
      // invoice number
      {
        entryId: formatInvoiceEntryId(payment.invoiceData.invoiceNumber ?? 0),
        id: payment.invoiceData.id,
      },

      // payment date
      formatDate(payment.paidOn) ?? "N/A",

      // amount
      formatCost(invoiceAmount ?? 0),

      // customer
      // payment.customer ?? "N/A",

      // payment status
      paymentStatus ?? "N/A",

      // source
      payment.source ?? "N/A",

      //payment method
      payment.paymentMethod ?? "N/A",

      //actions
      [
        // {
        //   label: "Refund",
        //   icon: "attach_money",
        //   action: () => {
        //     console.log("View invoice clicked ID: ", payment.id);
        //   },
        // },
        // {
        //   label: "Send Receipt",
        //   icon: "send",
        //   action: () => {
        //     console.log("Edit invoice clicked ID: ", payment.id);
        //   },
        // },
        {
          label: "View Receipt",
          icon: "visibility",
          action: () => {
            console.log("View payment clicked ID: ", payment.id);
          },
        },

        {
          label: "Download Receipt",
          icon: "download",
          action: () => {
            console.log("Download payment clicked ID: ", payment.id);
          },
        },
      ],
    ];
  });

  console.log("Formatted payments:", formatted);
  return formatted;
}
