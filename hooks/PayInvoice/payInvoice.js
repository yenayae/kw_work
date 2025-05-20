import stripeConfig from "../stripe-config.js";
import { fetchInvoiceById } from "../firestore.js";
import {
  Timestamp,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const HEROKU_URL = stripeConfig.serverUrl;

export async function payInvoiceStripe(invoiceId, userId, paymentMethodId) {
  console.log("Pay Now button clicked");

  const invoice = await fetchInvoiceById(invoiceId);
  if (!invoice) {
    alert("Invoice not found.");
    return;
  }

  console.log("Invoice:", invoice);

  //calcaulte total amount (in cents)
  const billingItems = invoice.billingItemMap;
  let totalAmount = 0;

  for (const itemId in billingItems) {
    const item = billingItems[itemId];
    const quantity = item.quantity || 0;
    const amount = item.amount || 0;
    totalAmount += quantity * amount;
  }

  console.log("Total Amount:", totalAmount);

  const response = await fetch(`${HEROKU_URL}pay-invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: totalAmount,
      invoiceId: invoiceId,
      userId: userId,
      paymentMethodId: paymentMethodId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    alert(`Payment failed: ${data.error}`);
    return;
  }

  alert("Payment successful!");

  await markInvoicesAsPaid([invoice]);
}

async function markInvoicesAsPaid(invoices) {
  if (!Array.isArray(invoices) || invoices.length === 0) {
    console.warn("No invoices provided to mark as paid.");
    return;
  }

  try {
    const response = await fetch(`${HEROKU_URL}mark-invoices-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceIds: invoices.map((inv) => inv.id) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to mark invoices as paid:", errorData.error);
      console.error(errorData);
    } else {
      console.log("Invoices marked as paid successfully.");

      //update the UI to reflect the paid status
      //   loadCustomerInvoices();
    }
  } catch (err) {
    console.error("Error marking invoices as paid:", err.message);
  }
}

// requires customer object
function createInvoiceObject(selectedCustomer) {
  const notifyDate = new Date("2025-05-07T00:00:00");
  const issueDate = new Date("2025-05-07T00:00:00");
  const dueDate = new Date("2025-05-10T00:00:00");

  const toTimestamp = (date) => Timestamp.fromDate(date);

  const invoiceData = {
    billTo: {
      fName: selectedCustomer.firstName || "N/A",
      lName: selectedCustomer.lastName || "N/A",
      email: selectedCustomer.email || "",
      phoneNum: selectedCustomer.phoneNum || "",
      contactId: selectedCustomer.id,
    },
    invoiceMessage: "",
    notifyDateTimestamp: toTimestamp(notifyDate),
    notifyDateVal: "2025-05-07",
    issueDateTimestamp: toTimestamp(issueDate),
    issueDateVal: "2025-05-07",
    dueDateTimestamp: toTimestamp(dueDate),
    residentId: "DIhmta0jc8WrMFO4TX4u",
    residentName: "Bailey Pong",
    isPaid: false,
    notifyByEmail: true,
    byStaffName: "Scheduled",
    invoiceNumber: 1000000021,
    repeatInterval: "1",
    repeatFrequency: "byMonth",

    billingItemIds: ["item1", "item2"],
    billingItemMap: {
      item1: {
        id: "item1",
        amount: 1000,
        quantity: 1,
        coaId: "coa_001",
        coaName: "Example Fee",
        residentId: "DIhmta0jc8WrMFO4TX4u",
        residentName: "Bailey Pong",
        roomFacilityId: "room_123",
        isRecurring: true,
        startDate: toTimestamp(new Date("2025-05-01")),
        createdAt: toTimestamp(new Date()),
        notes: "",
      },
      item2: {
        id: "item2",
        amount: 500,
        quantity: 1,
        coaId: "coa_002",
        coaName: "Another Fee",
        residentId: "DIhmta0jc8WrMFO4TX4u",
        residentName: "Bailey Pong",
        roomFacilityId: "room_456",
        isRecurring: false,
        startDate: toTimestamp(new Date("2025-05-01")),
        createdAt: toTimestamp(new Date()),
        notes: "",
      },
    },
  };

  return invoiceData;
}
