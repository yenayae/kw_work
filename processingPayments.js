import { fetchProcessingPayments } from "./hooks/firestore.js";

export default async function loadProcessingPayments() {
  const payments = await fetchProcessingPayments();

  //display information
  displayPayments(payments);
}

function displayPayments(payments) {
  const paymentsContainer = document.getElementById(
    "processing-payments-container"
  );

  //if empty
  if (payments.length === 0) {
    for (let i = 0; i < 6; i++) {
      let emptyPayment = createEmptyPayment();
      paymentsContainer.appendChild(emptyPayment);

      //add divider if not last
      if (i !== 5) {
        const hr = document.createElement("hr");
        hr.classList.add("entry");
        paymentsContainer.appendChild(hr);
      }
    }

    //add no payments span
    const noPayments = document.createElement("span");
    noPayments.classList.add("no-payments-span");
    noPayments.textContent = "No Payments.";
    paymentsContainer.appendChild(noPayments);

    return;
  }

  //else display all payments
  for (const payment of payments) {
    let paymentElement = createPayment(payment);
    paymentsContainer.appendChild(paymentElement);
  }
}

//TODO: create payment stuff
function createPayment(payment) {
  const paymentElement = document.createElement("div");
  paymentElement.classList.add("genetic-entry");

  return paymentElement;
}

function createEmptyPayment() {
  //create elements
  const paymentElement = document.createElement("div");
  const emptyShort = document.createElement("div");
  const emptyLong = document.createElement("div");
  const emptyArrowWrapper = document.createElement("div");
  const emptyArrow = document.createElement("div");
  const emptyArrowIcon = document.createElement("i");

  //add classes
  paymentElement.classList.add("generic-entry");
  emptyShort.classList.add("empty");
  emptyLong.classList.add("empty", "long");
  emptyArrowWrapper.classList.add("empty-w-arrow");
  emptyArrow.classList.add("empty");
  emptyArrowIcon.classList.add("fa-solid", "fa-chevron-right");

  //append elements
  emptyArrowWrapper.appendChild(emptyArrow);
  emptyArrowWrapper.appendChild(emptyArrowIcon);
  paymentElement.appendChild(emptyShort);
  paymentElement.appendChild(emptyLong);
  paymentElement.appendChild(emptyArrowWrapper);

  return paymentElement;
}
