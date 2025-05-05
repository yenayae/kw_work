import stripeConfig from "../hooks/stripe-config.js";
import { addCustomer } from "../hooks/firestore.js";

const TEST_ACCOUNT_ID = "acct_1RFsHoAk76Jp7S9G";

const stripe = Stripe(stripeConfig.publishableKey, {
  stripeAccount: TEST_ACCOUNT_ID,
});
const HEROKU_URL = stripeConfig.serverUrl;

const elements = stripe.elements();

const form = document.getElementById("add-customer-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Submitting form...");

  // extract values from form
  const formData = new FormData(form);
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");

  //check what type of payment method: card / bank account
  // note: little archaic, maybe think of more foolproof way of figuting out
  const useCard = document
    .querySelector("#card-payment-method")
    .classList.contains("open");
  let paymentMethodId = null;

  //create payment method
  if (useCard) {
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { name, email, phone },
    });
    if (pmError) {
      alert(pmError.message);
      return;
    }
    paymentMethodId = paymentMethod.id;
  } else {
    // create token from manual bank inputs
    const { token, error: tokenError } = await stripe.createToken(
      "bank_account",
      {
        country: "US",
        currency: "usd",
        routing_number: document.getElementById("bank-routing").value,
        account_number: document.getElementById("bank-account").value,
        account_holder_name: document.getElementById("bank-name").value,
        account_holder_type: "individual", // or 'company'
      }
    );

    if (tokenError) {
      alert(tokenError.message);
      return;
    }

    console.log("Created bank account token:", token.id);
    paymentMethodId = token.id; // this is a bank account token, not a payment method
  }

  console.log("Payment method created:", paymentMethodId);

  const customer = {
    connectedAccountId: TEST_ACCOUNT_ID,
    name: name,
    email: email,
    description: "test person stuff",
    billing: {
      phone: phone,
      address: {
        line1: "123 Music Ave",
        city: "Los Angeles",
        state: "CA",
        postal_code: "90001",
        country: "US",
      },
    },
    shipping: {
      phone: "+1234567890",
      address: {
        line1: "123 Music Ave",
        city: "Los Angeles",
        state: "CA",
        postal_code: "90001",
        country: "US",
      },
    },
    currency: "usd",
    tax: {
      taxExempt: "none",
      taxId: "12-3456789",
    },
    paymentMethodId: paymentMethodId,
  };

  // send customer to your backend
  const response = await fetch(`${HEROKU_URL}create-customer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  const data = await response.json();

  if (response.ok) {
    console.log("Created customer ID:", data.customerId);
    alert("Customer created successfully!");

    // upload customer to Firestore
    const addCustomerId = {
      ...customer,
      stripeCustomerId: data.customerId,
    };

    addCustomer(addCustomerId);
  } else {
    console.error("Customer creation failed:", data.error);
    alert("Error: " + data.error);
  }
});

//front end stuff

//mount card elements:
const cardElement = elements.create("card");
cardElement.mount("#card-payment-method");

//mount bank account elements:
// const usBankAccount = elements.create("usBankAccount", {
//   // Optionally prefill billing details
//   defaultValues: {
//     billingDetails: {
//       name: "Jane Doe",
//       email: "jane@example.com",
//     },
//   },
// });
// usBankAccount.mount("#bank-payment-method");

window.selectPaymentMethod = function (clickedElement) {
  // Find the associated payment-method div
  const paymentDiv = clickedElement.nextElementSibling;

  if (!paymentDiv || !paymentDiv.classList.contains("payment-method")) return;

  const isOpen = paymentDiv.classList.contains("open");

  // First, close all others
  document.querySelectorAll(".payment-method").forEach((el) => {
    el.classList.remove("open", "remove");
    el.classList.add("closed");
  });

  if (!isOpen) {
    // If it wasn't open, open it now
    paymentDiv.classList.remove("closed");
    paymentDiv.classList.add("remove", "open");
  }
  // If it was open, do nothing extra (it's already been closed above)
};
