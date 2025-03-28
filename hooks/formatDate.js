//input firestore timestamp object
export default function formatDate(timestamp) {
  const date = new Date(timestamp.seconds * 1000);
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;

  return formattedDate;
}
