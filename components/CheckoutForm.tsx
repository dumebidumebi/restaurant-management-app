"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
}

function PaymentForm({ clientSecret, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Step 1: Use Elements to create a payment method
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setMessage(submitError.message || "An error occurred");
        onError(submitError);
        setIsLoading(false);
        return;
      }

      // Step 2: Get PaymentMethod ID
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      });

      if (error) {
        setMessage(error.message || "An error occurred");
        onError(error);
        setIsLoading(false);
        return;
      }

      // Step 3: Call our backend API to confirm the payment
      const response = await fetch("/api/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientSecret,
          paymentMethodId: paymentMethod?.id,
          returnUrl: `${window.location.origin}/payment-success`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Payment confirmation failed");
        onError(result.error);
        setIsLoading(false);
        return;
      }

      // Step 4: Handle next actions if needed (3D Secure, etc.)
      if (result.paymentIntent.next_action) {
        const { error: actionError } = await stripe.handleNextAction({
          clientSecret,
        });

        if (actionError) {
          setMessage(actionError.message || "Payment authentication failed");
          onError(actionError);
          setIsLoading(false);
          return;
        }

        // After handling the action, check payment status again
        const statusResponse = await fetch("/api/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientSecret }),
        });

        const statusResult = await statusResponse.json();
        
        if (statusResult.paymentIntent.status === "succeeded" ||
            statusResult.paymentIntent.status === "requires_capture") {
          setMessage("Payment successful!");
          onSuccess(statusResult.paymentIntent);
        } else {
          setMessage(`Payment status: ${statusResult.paymentIntent.status}`);
        }
      } else if (result.paymentIntent.status === "succeeded" || 
                result.paymentIntent.status === "requires_capture") {
        // Payment succeeded without additional actions
        setMessage("Payment successful!");
        onSuccess(result.paymentIntent);
      } else {
        setMessage(`Payment status: ${result.paymentIntent.status}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("An unexpected error occurred. Please try again.");
      onError(error);
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "accordion" as const,
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        id="submit"
      >
        <span id="button-text">{isLoading ? "Processing..." : "Pay Now"}</span>
      </button>

      {message && (
        <div className="text-center text-sm mt-4" id="payment-message">
          {message}
        </div>
      )}
    </form>
  );
}

interface CheckoutFormProps {
  clientSecret: string | null;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
}

export default function CheckoutForm({
  clientSecret,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const appearance = {
    theme: "stripe" as const,
  };

  if (!clientSecret) {
    return <div>Loading...</div>; // Or display an error message
  }
  const options = {
    appearance,
    clientSecret,
    paymentMethodCreation: 'manual' as const,
  };


  return (
    <Elements
      stripe={stripePromise}
      options={options}
    >
      <PaymentForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
