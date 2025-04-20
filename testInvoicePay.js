import stripeConfig from "./hooks/stripe-config.js";

const stripe = window.Stripe(stripeConfig.publishableKey);

const HEROKU_URL = stripeConfig.serverUrl;

const elements = stripe.elements();
const cardElement = elements.create("card");
cardElement.mount("#card-element");

const form = document.getElementById("payment-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Submitting payment form...");

  // Call your backend to create the payment intent
  const response = await fetch(`${HEROKU_URL}create-payment-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 5000, // TODO: dynamic amount
      connectedAccountId: "acct_1RFsHoAk76Jp7S9G", // TODO: dynamic connected account ID
    }),
  });

  const { clientSecret } = await response.json();

  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card: cardElement,
      },
    }
  );

  if (error) {
    alert(error.message);
  } else if (paymentIntent.status === "succeeded") {
    alert("Payment successful!");
  }
});
