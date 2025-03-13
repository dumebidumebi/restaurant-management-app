"use client";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import TipComponent from "@/components/Tips";
import OrderSummary from "@/components/OrderSummary";

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
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [deliveryQuote, setDeliveryQuote] = useState<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Check if Stripe is properly initialized
  useEffect(() => {
    if (!stripePromise) {
      setError(
        "Stripe payment system is not properly configured. Please contact support."
      );
    }
  }, []);

  // Poll for fresh DoorDash quotes
  const startQuotePolling = () => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set new polling interval (5 minutes = 300000ms)
    pollingIntervalRef.current = setInterval(refreshQuote, 300000);
  };

  const stopQuotePolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const refreshQuote = async () => {
    try {
      const existingQuote = sessionStorage.getItem("deliveryQuote");
      if (!existingQuote) return;

      const parsedQuote = JSON.parse(existingQuote);
      
      console.log("Refreshing DoorDash quote...");
      
      // Create a new quote with the same parameters
      const response = await fetch("/api/doordash/create-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          dropoff_address:   "1000 E Henrietta Rd, Rochester, NY, 14623",
        }),
      });

      if (response.ok) {
        const newQuoteData = await response.json();
        setDeliveryQuote(newQuoteData);
        sessionStorage.setItem("deliveryQuote", JSON.stringify({
          ...newQuoteData,
          customerAddress: customerAddress || parsedQuote.customerAddress
        }));
        console.log("DoorDash quote refreshed successfully", newQuoteData);
      } else {
        console.error("Failed to refresh quote:", await response.text());
      }
    } catch (error) {
      console.error("Failed to refresh delivery quote:", error);
    }
  };

  // Calculate the subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const modifiersTotal =
      item.modifiers?.reduce(
        (modSum, mod) => modSum + mod.price * mod.quantity,
        0
      ) || 0;
    return sum + itemTotal + modifiersTotal;
  }, 0);

  // Calculate the total
  const total = subtotal + (tipAmount || 0);

  // Create initial DoorDash quote
  useEffect(() => {
    const createInitialQuote = async () => {
      if (!cartItems.length) return;
      
      try {
        console.log("Creating initial DoorDash quote...");
        
        const response = await fetch("/api/doordash/create-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems,
            dropoff_address:   "1000 E Henrietta Rd, Rochester, NY, 14623",
          }),
        }); 

        if (response.ok) {
          const quoteData = await response.json();
          setDeliveryQuote(quoteData);
          sessionStorage.setItem("deliveryQuote", JSON.stringify({
            ...quoteData,
            customerAddress
          }));
          console.log("Initial DoorDash quote created:", quoteData);
          
          // Start polling to keep quote alive
          startQuotePolling();
        } else {
          console.error("Failed to create quote:", await response.text());
        }
      } catch (error) {
        console.error("Failed to create delivery quote:", error);
      }
    };

    createInitialQuote();

    return () => {
      // Clean up polling when component unmounts
      stopQuotePolling();
    };
  }, [cartItems, customerAddress]);

  // Initialize Stripe checkout session
  useEffect(() => {
    const initializeCheckout = async () => {
      if (!stripePromise || !cartItems.length) return;

      setIsLoading(true);
      setError(null);

      try {
        // Prepare line items
        const lineItems = [];

        // Add cart items
        for (const item of cartItems) {
          if (!item.stripePriceId) {
            throw new Error(`Missing Stripe Price ID for item: ${item.name}`);
          }

          lineItems.push({
            price: item.stripePriceId,
            quantity: item.quantity,
          });
        }

        // Add tip
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

        // Include the delivery quote information
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            lineItems,
            deliveryQuote: deliveryQuote,
            dropoff_address : "1000 E Henrietta Rd, Rochester, NY, 14623" ,
          }),
        });

        console.log(response);


        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(
        //     errorData.error || "Failed to create checkout session"
        //   );
        // }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err) {
        console.error("Checkout error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, [cartItems, tipAmount, deliveryQuote]);

  // Component appearance
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

        {/* Address input for delivery */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address
          </label>
          <input
            type="text"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your delivery address"
          />
        </div>

        <div className="my-10">
          <TipComponent onTipChange={setTipAmount} />
        </div>

        {/* Display delivery quote information if available */}
        {deliveryQuote && (
          <div className="bg-blue-50 p-3 rounded mb-4">
            <h3 className="font-medium">Delivery Quote</h3>
            <p>Fee: ${(deliveryQuote.fee / 100).toFixed(2)}</p>
            <p className="text-xs text-gray-500">ID: {deliveryQuote.id}</p>
          </div>
        )}

        {/* Checkout Section */}
        {isLoading && <div>Preparing checkout...</div>}
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
          <div>Loading checkout...</div>
        ) : null}
      </div>
      <OrderSummary 
        tipAmount={tipAmount ? tipAmount : 0} 
        deliveryFee={deliveryQuote ? deliveryQuote.fee / 100 : 0}
      />
    </div>
  );
}
