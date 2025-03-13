// app/api/create-checkout-session/route.ts
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lineItems, dropoff_address } = body;

    // Create properly formatted line items for Stripe
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Add cart items
    for (const item of lineItems) {
      // Main item - either use existing price ID or create price data
      if (item.price) {
        // Use existing Stripe price
        line_items.push({
          price: item.price,
          quantity: item.quantity,
        });
      } else {
        // Create price on-the-fly
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              description: item.description || undefined,
              // You can add images here if needed
              // images: item.image ? [item.image] : undefined,
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        });
      }

      // Modifiers (if they exist)
      if (item.modifiers && item.modifiers.length > 0) {
        for (const modifier of item.modifiers) {
          if (modifier.stripePriceId) {
            // Use existing Stripe price for modifier
            line_items.push({
              price: modifier.stripePriceId,
              quantity: modifier.quantity * item.quantity,
            });
          } else {
            // Create price on-the-fly for modifier
            line_items.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${item.name} - ${modifier.name || 'Modifier'}`,
                  description: modifier.description || undefined,
                },
                unit_amount: Math.round(modifier.price * 100), // Convert to cents
              },
              quantity: modifier.quantity * item.quantity,
            });
          }
        }
      }
    }

    // Check if we have valid line items
    if (line_items.length === 0) {
      throw new Error("No valid line items provided");
    }

    // Debugging - log the line items to see what's being sent to Stripe
    console.log("Sending to Stripe:", JSON.stringify(line_items, null, 2));

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded", 
      line_items: line_items, // Use the formatted line_items array
      mode: "payment",
      automatic_tax: { enabled: true },
      return_url: "http://dumebi.localhost:3000",
      metadata: { dropoff_address: dropoff_address },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error}` },
      { status: 500 }
    );
  }
}
