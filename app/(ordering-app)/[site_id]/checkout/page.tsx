"use client";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import TipComponent from "@/components/Tips";
import OrderSummary from "@/components/OrderSummary";
import { useLocationStore } from "@/stores/useLocationStore";

// Safe initialization
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
      betas: ["custom_checkout_beta_5"],
    })
  : null;

export default function CheckoutPage() {
  const { cartItems } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocationStore();

  useEffect(() => {
    if (!stripePromise || !cartItems.length) return;

    const createCheckout = async () => {
      setIsLoading(true);
      try {
        // In your CheckoutPage component, ensure all recipient fields are included in checkoutData
        const checkoutData = {
          lineItems: cartItems.map((item) => ({
            price: item.stripePriceId,
            quantity: item.quantity,
            modifiers: item.modifiers || [],
          })),
          // Include other location fields...
          ...location,
        };
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create checkout session"
          );
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err) {
        console.error("Checkout error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    createCheckout();
  }, [cartItems]);

  // Simple appearance
  const appearance = {
    theme: "stripe",
  };

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">Preparing checkout...</div>
      )}

      {!isLoading && clientSecret && stripePromise ? (
        <div className="w-full min-h-[600px]">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : !isLoading && !error ? (
        <div className="text-center py-4">Loading checkout...</div>
      ) : null}
    </div>
  );
}
