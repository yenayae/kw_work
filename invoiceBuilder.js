import { uploadInvoice } from "./hooks/firestore.js";

console.log("ughhhh");

window.addInvoice = function (event) {
  event.preventDefault();
  const invoiceSubtotal = document.getElementById("invoice-amount").value;
  const invoiceDiscount = 0;
  const invoiceCredits = 0;
  const invoiceTotal = invoiceSubtotal - invoiceDiscount - invoiceCredits;

  console.log(invoiceTotal);

  console.log("Adding invoice...");

  // dummy values for now
  const invoiceData = {
    billingData: [
      // you can replace this with dynamic data
      {
        description: "Rent for May",
        amount: 1000.0,
      },
    ],
    residentId: "TEST_USER_ID",
    residentName: "John Doe",
    payerId: "TEST_USER_ID",
    payerName: "John Doe",
    payerEmail: "john@example.com",
    payerPhoneNum: "123-456-7890",
    isPaid: false,
    invoiceNumber: "0001",
    dueDateIndex: 0,
    dueDateVal: "05/14/2024",
    dueDateTimestamp: new Date("2024-05-14"),
    issueDateVal: "05/14/2024",
    issueDateTimestamp: new Date("2024-05-14"),
    notifyDateVal: "05/14/2024",
    notifyDateTimestamp: new Date("2024-05-14"),
    subtotal: invoiceSubtotal,
    discounts: invoiceDiscount,
    credits: invoiceCredits,
    total: invoiceTotal,
    status: "Scheduled",
    statusIndex: 0,
    frequencyType: 0,
    frequencyIntervalIndex: 1,
    frequencyInterval: "Monthly",
    recurringPaymentId: "",
    pdfLink: "https://example.com/invoice/0001.pdf",
    byStaffId: "staff_001",
    byStaffName: "Admin User",
  };

  //upload to firestore
  uploadInvoice(invoiceData)
    .then(() => {
      console.log("Invoice uploaded successfully!");

      //redirect back to inovices page
      window.location.href = "/invoices.html";
    })
    .catch((error) => {
      console.error("Error uploading invoice:", error);
    });
};
