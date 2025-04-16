import stripeConfig from "./hooks/stripe-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("pay-invoice-button");

  if (!button) {
    console.error("Pay invoice button not found!");
    return;
  }

  button.addEventListener("click", async () => {
    console.log("paying invoice");

    try {
      const response = await fetch(
        "https://kinnwell-20e1b8a898e0.herokuapp.com/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const session = await response.json();

      // ✅ Use window.Stripe instead of just Stripe
      const stripe = window.Stripe(stripeConfig.publishableKey);

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("There was an error. Check the console.");
    }
  });
});
