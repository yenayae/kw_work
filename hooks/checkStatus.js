export default function checkStatus(dueDate, payStatus) {
  if (!dueDate || !payStatus) {
    return "n/a";
  }

  const currentTime = Date.now(); // Convert Firestore timestamp to milliseconds
  const dueTime = dueDate.seconds * 1000; // Convert Firestore timestamp to milliseconds

  if (payStatus === true) {
    return "paid";
  } else if (currentTime < dueTime) {
    return "scheduled";
  } else {
    return "past due";
  }
}
