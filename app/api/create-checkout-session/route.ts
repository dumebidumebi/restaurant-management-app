// app/api/create-checkout-session/route.ts
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { lineItems } = await req.json();
    console.log("line items:", lineItems);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Add cart items
    for (const item of lineItems) {
      // Main item
      line_items.push({
        price: item.stripePriceId,
        quantity: item.quantity,
      });

      // Modifiers (if they exist)
      if (item.modifiers && item.modifiers.length > 0) {
        for (const modifier of item.modifiers) {
          line_items.push({
            price: modifier.stripePriceId,
            quantity: modifier.quantity * item.quantity,
          });
        }
      }
    }

    console.log("line_items:", line_items);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded", //custom for sutom pages
      line_items: lineItems, // Pass lineItems directly
      mode: "payment",
      automatic_tax: { enabled: true },
      return_url: "http://dumebi.localhost:3000",
    });

    console.log("Created Checkout Session:", session);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
