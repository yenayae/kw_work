import stripeConfig from "./hooks/stripe-config.js";

const stripe = window.Stripe(stripeConfig.publishableKey);

const elements = stripe.elements();
const cardElement = elements.create("card");
cardElement.mount("#card-element");

const form = document.getElementById("payment-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Call your backend to create the payment intent
  const response = await fetch(
    "https://your-heroku-url.com/create-payment-intent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 5000, // $50 in cents
        connectedAccountId: "acct_1ABCDEF...", // replace with actual connected account
      }),
    }
  );

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
