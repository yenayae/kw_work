export default function formatDate(timestamp, formatType = "MDY") {
  if (!timestamp || !timestamp.seconds) return "N/A";

  const date = new Date(timestamp.seconds * 1000);

  const year = date.getFullYear();
  const numericMonth = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthShort = monthNamesShort[date.getMonth()];

  // day of year for JUL format
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date -
    start +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    .toString()
    .padStart(3, "0");

  switch (formatType.toUpperCase()) {
    case "MDY":
      return `${numericMonth}-${day}-${year}`;
    case "DMY":
      return `${day}-${numericMonth}-${year}`;
    case "YMD":
      return `${year}-${numericMonth}-${day}`;
    case "JUL":
      return `${year.toString().slice(-2)}/${dayOfYear}`;
    case "ISO":
    case "JIS":
      return `${year}-${numericMonth}-${day}`;
    case "USA":
      return `${numericMonth}/${day}/${year}`;
    case "EUR":
      return `${day}. ${numericMonth}. ${year}`;
    case "LONG":
      return `${monthShort} ${day}, ${year}`;
    default:
      return `${numericMonth}-${day}-${year}`; // fallback to MDY style
  }
}
