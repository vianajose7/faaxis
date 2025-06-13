
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function StripeTest() {
  const [clientSecret, setClientSecret] = useState("");
  
  useEffect(() => {
    async function createIntent() {
      console.log("Creating payment intent...");
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount: 199 });
      const data = await response.json();
      console.log("Got client secret:", data.clientSecret);
      setClientSecret(data.clientSecret);
    }
    createIntent();
  }, []);

  console.log("Rendering with clientSecret:", clientSecret);

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <h1>Stripe Test</h1>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <div style={{ padding: "20px", background: "#fff" }}>
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </Elements>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
