"use client";
import {
  CheckoutProvider,
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import EmailInput from "@/components/EmailInput";
import TipComponent from "@/components/Tips";
import OrderSummary from "@/components/OrderSummary";

// Debug the environment variable
console.log(
  "Stripe key available:",
  Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
);

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
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [tipType, setTipType] = useState<"percent" | "fixed">("percent");
  const router = useRouter();

  // Check if Stripe is properly initialized
  useEffect(() => {
    if (!stripePromise) {
      setError(
        "Stripe payment system is not properly configured. Please contact support."
      );
    }
  }, []);

  // Calculate the subtotal (total price of items + modifiers)
  const subtotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const modifiersTotal =
      item.modifiers?.reduce(
        (modSum, mod) => modSum + mod.price * mod.quantity,
        0
      ) || 0;
    return sum + itemTotal + modifiersTotal;
  }, 0);

  // Calculate the total (subtotal + tip)
  const total = subtotal + (tipAmount || 0);

  useEffect(() => {
    const initializeCheckout = async () => {
      if (!stripePromise) return;

      setIsLoading(true);
      setError(null);

      try {
        // Prepare line items in a format the backend expects
        const lineItems = [];

        // Add cart items
        for (const item of cartItems) {
          if (!item.stripePriceId) {
            throw new Error(`Missing Stripe Price ID for item: ${item.name}`);
          }

          // Add main item
          lineItems.push({
            price: item.stripePriceId,
            quantity: item.quantity,
          });
        }

        // Add tip as a separate line item if applicable
        if (tipAmount && tipAmount > 0) {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: "Tip",
              },
              unit_amount: Math.round(tipAmount * 100),
            },
            quantity: 1,
          });
        }

        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lineItems }),
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

    if (cartItems.length > 0) {
      initializeCheckout();
    }
  }, [cartItems, tipAmount]);

  // Rest of your component remains the same...
  const appearance = {
    theme: "stripe",

    variables: {
      colorPrimary: "#0570de",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "Inter, system-ui, sans-serif",
      spacingUnit: "2px",
      borderRadius: "4px",
      // See all possible variables below
    },
  };

  return (
    <div className="flex flex-col sm:flex-row justify-normal">
      <div className="mx-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="my-10">
          <TipComponent onTipChange={setTipAmount} />
        </div>

        {/* Checkout Section */}

        {isLoading && <div>Preparing checkout...</div>}
        {!isLoading && clientSecret && stripePromise ? (
          <div className="w-full min-h-[600px]">
            {/* <CheckoutProvider stripe={stripePromise} options={{ clientSecret }}> */}
            {/* <CheckoutForm /> */}

            {/* </CheckoutProvider> */}
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        ) : !isLoading && !error ? (
          <div>Loading checkout...</div>
        ) : null}
      </div>
      <OrderSummary tipAmount={tipAmount ? tipAmount : 0} />
    </div>
  );
}
