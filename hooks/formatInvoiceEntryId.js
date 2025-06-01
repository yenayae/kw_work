export default function formatInvoiceEntryId(entryId, hasHashtag = true) {
  // format invoice entry id
  let invoiceEntryId = entryId.toString().padStart(7, "0");

  if (hasHashtag) {
    invoiceEntryId = `#${invoiceEntryId}`;
  }

  return invoiceEntryId;
}
