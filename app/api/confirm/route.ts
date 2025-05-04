// app/api/confirm/route.ts
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientSecret, paymentMethodId, returnUrl } = body;

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Client secret is required" },
        { status: 400 }
      );
    }

    // Extract the Payment Intent ID from the client secret
    const paymentIntentId = clientSecret.split("_secret_")[0];

    let paymentIntent;

    if (paymentMethodId) {
      // Confirm with explicit payment method ID
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: returnUrl || `${req.headers.get("origin") || ""}`
      });
    } else {
      // Retrieve the payment intent to check its status
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    }

    // Return the updated payment intent
    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        next_action: paymentIntent.next_action
      }
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
