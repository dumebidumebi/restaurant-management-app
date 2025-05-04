// /app/api/orders/[id]/accept/route.ts
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe"; // Import stripe
import { getAccessToken } from "uber-direct/auth"; // Import Uber auth
import { createDeliveriesClient } from "uber-direct/deliveries"; // Import Uber client
import { updateOrdersCache } from "@/app/api/webhooks/stripe-webhook/route"; // Import cache helper
import { Order } from "@prisma/client";

// Keep your parseAddressString function if needed
function parseAddressString(addressString: string | null): { streetAddress: string; city: string; state: string; zipCode: string; country: string; } {
    const defaultAddress = { streetAddress: "", city: "", state: "", zipCode: "", country: "US" };
    if (!addressString) return defaultAddress;
    try {
        const parts = addressString.split(",").map((part) => part.trim());
        const streetAddress = parts[0] || "";
        const city = parts[1] || "";
        const stateZipCodeAndCountry = parts[2] ? parts[2].split(" ") : [];
        const state = stateZipCodeAndCountry[0] || "";
        const zipCode = stateZipCodeAndCountry[1] || "";
        const country = parts[3] || "US";
        return { streetAddress, city, state, zipCode, country };
    } catch (e) {
        console.error("Failed to parse address string:", addressString, e);
        return defaultAddress;
    }
}


export async function POST(
  request: NextRequest// Destructure params directly
) {
  const { searchParams } = new URL(request.url);
  
  // const { id } = await params; // Get id from resolved params
  console.log(request)
  const body = await request.json();
  const id = body.id
  console.log("body", body )
  console.log("id" , id)
  try {
    
    const { prepTime } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }
    if (prepTime === undefined || prepTime === null) {
      return NextResponse.json({ error: "Prep time missing" }, { status: 400 });
    }

    // 1. Find the Order
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: { items: true }, // Include items for delivery manifest
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Check Order Status and Payment Intent ID
    if (order.status !== "NEW") {
      return NextResponse.json(
        { error: `Order status is ${order.status}, cannot accept again.` },
        { status: 400 }
      );
    }
    if (!order.paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID missing for this order." },
        { status: 500 }
      );
    }

    // 3. Capture the Payment Intent
    let capturedPaymentIntent;
    try {
      console.log(`Attempting to capture Payment Intent: ${order.paymentIntentId} for order ${order.id}`);
      capturedPaymentIntent = await stripe.paymentIntents.capture(
        order.paymentIntentId
      );
      console.log(`Payment Intent ${capturedPaymentIntent.id} captured successfully. Status: ${capturedPaymentIntent.status}`);
      // Check if capture was successful (status should ideally be 'succeeded' after capture)
      if (capturedPaymentIntent.status !== 'succeeded') {
         // This might happen if it was already captured or failed during capture
         console.warn(`Payment Intent ${capturedPaymentIntent.id} status after capture attempt: ${capturedPaymentIntent.status}`);
         // You might want to retrieve the PI again to double-check the status if needed
         // const refreshedPI = await stripe.paymentIntents.retrieve(order.paymentIntentId);
         // if (refreshedPI.status !== 'succeeded') {
         //    throw new Error(`Payment capture failed or PI not in succeeded state. Status: ${refreshedPI.status}`);
         // }
      }
    } catch (stripeError: any) {
      console.error(
        `Failed to capture Payment Intent ${order.paymentIntentId}:`,
        stripeError
      );
      // Optionally update order status to reflect payment failure
      await prisma.order.update({
         where: { id: order.id },
         data: { status: 'CANCELED', notes: `Payment capture failed: ${stripeError.message}` }
      });
      await updateOrdersCache();
      return NextResponse.json(
        { error: `Payment capture failed: ${stripeError.message}` },
        { status: 402 } // Payment Required or Bad Gateway depending on error
      );
    }

    // 4. Initiate Delivery (if applicable)
    let deliveryDetails: Partial<Order> = {}; // Use Prisma Order type
    if (order.customerAddress) { // Assuming delivery if address exists
      try {
        const token = await getAccessToken();
        if (!token?.access_token) throw new Error("Failed to get Uber token");
        const deliveriesClient = createDeliveriesClient(token);

        const pickupAddress = { // Use your actual store pickup address
          street_address: ["376 Jefferson Rd", ""],
          state: "NY", city: "Rochester", zip_code: "14623", country: "US",
        };
        const dropoffAddressParsed = parseAddressString(order.customerAddress);
        const dropoffAddress = {
            street_address: [dropoffAddressParsed.streetAddress, ""], // Add apt/suite if available on order
            state: dropoffAddressParsed.state, city: dropoffAddressParsed.city,
            zip_code: dropoffAddressParsed.zipCode, country: dropoffAddressParsed.country,
        };

        const deliveryRequest = {
          pickup_name: "Just Chik'n", // Use your store name
          pickup_address: JSON.stringify(pickupAddress),
          pickup_phone_number: "+15555555555", // Use store phone
          dropoff_name: order.customerName,
          dropoff_address: JSON.stringify(dropoffAddress),
          dropoff_phone_number: order.customerPhone || "+10000000000", // Uber requires a phone number
          manifest_items: order.items.map((item) => ({
            name: item.name, quantity: item.quantity, size: "small", // Adjust size as needed
            price: Math.round(item.price * 100), // Price in cents
          })),
          // Add pickup/dropoff ready times if needed based on prepTime
          // pickup_ready_dt: new Date(Date.now() + prepTime * 60000).toISOString(),
        };

        console.log("Creating Uber delivery for order:", order.id);
        const delivery = await deliveriesClient.createDelivery(deliveryRequest);
        console.log("Uber delivery created:", delivery.id, "Status:", delivery.delivery_status);

        deliveryDetails = {
          deliveryId: delivery.id,
          uberStatus: delivery.delivery_status,
          uberTrackingUrl: delivery.tracking_url,
          estimatedPickupTime: delivery.pickup_eta ? new Date(delivery.pickup_eta) : null,
          estimatedDropoffTime: delivery.dropoff_eta ? new Date(delivery.dropoff_eta) : null,
          deliveryFee: delivery.fee ? delivery.fee / 100 : order.deliveryFee, // Update fee if needed
        };

      } catch (deliveryError: any) {
        console.error(`Failed to create Uber delivery for order ${order.id}:`, deliveryError);
        // Decide how to handle: proceed with order acceptance but flag delivery issue?
        deliveryDetails.notes = (order.notes || "") + `\nDELIVERY CREATION FAILED: ${deliveryError.message}`;
      }
    }

    // 5. Update Order Status in DB
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status: "ACCEPTED",
        prepTime: parseInt(prepTime as string, 10),
        paymentStatus: capturedPaymentIntent.status, // Update payment status
        updatedAt: new Date(),
        ...deliveryDetails, // Spread the delivery details
      },
      include: { items: true },
    });

    // 6. Invalidate cache
    await updateOrdersCache();

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error(`Failed to accept order ${id}:`, error);
    return NextResponse.json(
      { error: `Failed to accept order: ${error.message}` },
      { status: 500 }
    );
  }
}
