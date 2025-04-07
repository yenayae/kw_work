import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FIRESTORE FUNCTIONS USED IN DASHBORD.HTML
const DEV_USER_ID = 1;

//iniiialize firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/* DASHBOARD FUNCTIONS 
- fetchSettlements
- fetchProcessingPayments
- fetchPastDueInvoices
- fetchRecentActivities
*/
//fetch settlemnts data
export async function fetchSettlements(userId = DEV_USER_ID) {
  const settlementsRef = collection(db, "settlements");

  // filter settlements by userId
  const settlementsQuery = query(settlementsRef, where("userId", "==", userId));
  const settlementsSnapshot = await getDocs(settlementsQuery);

  let data = [];
  for (const docSnapshot of settlementsSnapshot.docs) {
    const settlementData = docSnapshot.data();

    // fetch payments subcollection
    const paymentsRef = collection(docSnapshot.ref, "payments");
    const paymentsSnapshot = await getDocs(paymentsRef);

    // store payments in an array
    const paymentsData = paymentsSnapshot.docs.map((paymentDoc) =>
      paymentDoc.data()
    );

    // add payments data to the settlement object
    data.push({
      id: docSnapshot.id,
      ...settlementData,
      payments: paymentsData,
    });
  }

  return data;
}

//fetch processing payments data
export async function fetchProcessingPayments() {
  const paymentsRef = collection(db, "processingPayments");
  const paymentsSnapshot = await getDocs(paymentsRef);

  let data = [];
  paymentsSnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  return data;
}

//fetch past due invoices data
export async function fetchPastDueInvoices(userId = DEV_USER_ID) {
  const invoicesRef = collection(db, "invoices");
  const today = new Date();

  const pastDueQuery = query(
    invoicesRef,
    where("dueDate", "<", today),
    where("paidStatus", "==", false)
  );

  const pastDueSnapshot = await getDocs(pastDueQuery);
  const pastDueInvoices = pastDueSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return pastDueInvoices;
}

//fetch recent activities data
export async function fetchRecentActivities(userId = DEV_USER_ID) {
  try {
    const activitiesRef = collection(db, "activities");
    const activitiesQuery = query(activitiesRef, where("userId", "==", userId));
    const activitiesSnapshot = await getDocs(activitiesQuery);

    if (activitiesSnapshot.empty) {
      return [];
    }

    let activities = [];
    activitiesSnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    // fetch profile data
    const userRef = doc(db, "users", userId.toString());
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      console.warn("User not found:", userId);
      return activities;
    }

    const userData = userSnapshot.data();
    const { name, profileUrl } = userData;

    // add user details
    activities = activities.map((activity) => ({
      ...activity,
      hostName: name,
      hostProfileUrl: profileUrl,
    }));

    // sort by date
    const groupedActivities = activities.reduce((acc, activity) => {
      const dateKey = activity.date.seconds;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: activity.date, activities: [] };
      }
      acc[dateKey].activities.push(activity);
      return acc;
    }, {});

    // convert grouped object to sorted array
    return Object.values(groupedActivities).sort(
      (a, b) => a.date.seconds - b.date.seconds
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

/* INVOICES FUNCTIONS
- fetchInvoices
- addInvoice
*/

//fetch invoices data
export async function fetchInvoices(userId = DEV_USER_ID) {
  const invoicesRef = collection(db, "invoices");
  const invoicesSnapshot = await getDocs(invoicesRef);

  let data = [];

  invoicesSnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}

export async function addInvoice(invoiceData) {
  try {
    const invoicesRef = collection(db, "invoices");
    await addDoc(invoicesRef, invoiceData);
    console.log("Invoice added successfully:", invoiceData);
  } catch (error) {
    console.error("Error adding invoice:", error);
  }
}

/* PAYMENTS FUNCTIONS
- fetchPayments
*/

//fetch payments data
export async function fetchPayments(userId = DEV_USER_ID) {
  const paymentsRef = collection(db, "payments");
  const paymentsSnapshot = await getDocs(paymentsRef);

  let data = [];

  paymentsSnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}

/* PRICING FUNCTIONS 
- fetchProducts
*/

//fetch products data
export async function fetchProducts() {
  const productsRef = collection(db, "products");
  const productsSnapshot = await getDocs(productsRef);

  let data = [];

  productsSnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}
