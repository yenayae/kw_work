export default function formatInvoiceEntryId(entryId) {
  //format invoice entry id
  const invoiceEntryId = `#${entryId.toString().padStart(7, "0")}`;
  return invoiceEntryId;
}
