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
  serverTimestamp,
  addDoc,
  runTransaction,
  increment,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FIRESTORE FUNCTIONS USED IN DASHBORD.HTML
const DEV_USER_ID = 1;

//iniiialize firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

//generic function to fetch data from firestore
export async function fetchData(collectionName) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  let data = [];

  snapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}

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
- uploadInvoice
*/

//fetch invoices data
export async function fetchInvoices(
  customerId = undefined,
  paidStatus = undefined
) {
  const invoicesRef = collection(db, "invoices");

  let constraints = [];

  if (customerId !== undefined) {
    constraints.push(where("payerId", "==", customerId));
  }

  if (paidStatus !== undefined) {
    constraints.push(where("statusIndex", "==", paidStatus));
  }

  const q =
    constraints.length > 0 ? query(invoicesRef, ...constraints) : invoicesRef;

  const invoicesSnapshot = await getDocs(q);

  let data = [];

  invoicesSnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}

//fetch and sort invoices by category
export async function fetchSortedInvoices({
  sortField = "invoiceNumber",
  sortDirection = "asc",
} = {}) {
  const invoicesRef = collection(db, "invoices");
  const invoicesQuery = query(invoicesRef, orderBy(sortField, sortDirection));
  const snapshot = await getDocs(invoicesQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

//fetch by frequency: 0 = one time 1 = recurring
export async function fetchInvoicesByFrequency(frequency) {
  const invoicesRef = collection(db, "invoices");
  const invoicesQuery = query(
    invoicesRef,
    where("frequencyType", "==", frequency)
  );
  const invoicesSnapshot = await getDocs(invoicesQuery);

  let data = [];

  invoicesSnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}

export async function uploadInvoice(invoiceData) {
  try {
    const counterRef = doc(db, "counters", "invoiceNumber");

    // run transaction to safely increment invoice number
    const invoiceNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists()) {
        throw new Error("Invoice counter document does not exist!");
      }

      const current = counterDoc.data().current || 0;
      const nextInvoiceNumber = current + 1;

      // update the counter
      transaction.update(counterRef, {
        current: increment(1),
      });

      // return the new invoice number as a string (with zero-padding)
      return nextInvoiceNumber.toString().padStart(4, "0"); // e.g. "0002"
    });

    const invoicesRef = collection(db, "invoices");

    const invoiceWithExtras = {
      ...invoiceData,
      invoiceNumber,
      ...(invoiceData.createdAt ? {} : { createdAt: serverTimestamp() }),
    };

    await addDoc(invoicesRef, invoiceWithExtras);
    console.log("Invoice added successfully:", invoiceWithExtras);
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

/* CUSTOMER FUNCTIONS
- fetchResidents
- fetchPayers
- addCustomer
 */

//fetch customers
export async function fetchResidents() {
  const residentsRef = collection(db, "residents");
  const residentsSnapshot = await getDocs(residentsRef);

  let data = [];

  residentsSnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}

export async function fetchPayers() {
  const payersRef = collection(db, "payers");
  const payersSnapshot = await getDocs(payersRef);

  let data = [];

  payersSnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}

export async function addCustomer(customerData) {
  try {
    const customersRef = collection(db, "customers");

    const customerWithExtras = {
      ...customerData,
      ...(customerData.createdAt ? {} : { createdAt: serverTimestamp() }),
    };

    const docRef = await addDoc(customersRef, customerWithExtras);
  } catch (error) {
    console.error("Error adding customer:", error);
  }
}
