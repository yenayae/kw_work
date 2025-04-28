import stripeConfig from "../hooks/stripe-config.js";
import { addCustomer } from "../hooks/firestore.js";

const TEST_ACCOUNT_ID = "acct_1RFsHoAk76Jp7S9G"; // Replace with your connected account ID

const stripe = Stripe(stripeConfig.publishableKey, {
  stripeAccount: TEST_ACCOUNT_ID,
});
const HEROKU_URL = stripeConfig.serverUrl;

const elements = stripe.elements();
const cardElement = elements.create("card");
cardElement.mount("#card-element");

const form = document.getElementById("add-customer-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Submitting form...");

  // extract values from form
  const formData = new FormData(form);
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");

  // Step 1: Create a payment method from card input
  const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
    type: "card",
    card: cardElement,
    billing_details: {
      name: name,
      email: email,
      phone: phone,
      address: {
        line1: "123 Music Ave",
        city: "Los Angeles",
        state: "CA",
        postal_code: "90001",
        country: "US",
      },
    },
  });

  if (pmError) {
    alert(pmError.message);
    return;
  }

  console.log("Payment method created:", paymentMethod.id);

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
    paymentMethodId: paymentMethod.id,
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
      stripeId: data.customerId,
    };

    addCustomer(addCustomerId);
  } else {
    console.error("Customer creation failed:", data.error);
    alert("Error: " + data.error);
  }
});
