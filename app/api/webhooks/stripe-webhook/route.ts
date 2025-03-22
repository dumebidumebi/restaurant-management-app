import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { doordash } from "@/lib/doordash";
import { v4 as uuidv4 } from "uuid";
import { getAccessToken } from "uber-direct/auth";
import { createDeliveriesClient } from "uber-direct/deliveries";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const token = await getAccessToken();
  const deliveriesClient = createDeliveriesClient(token);

  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      endpointSecret
    );
    const object = event.data.object as Stripe.Checkout.Session;

    // Only process checkout.session.completed events
    if (event.type === "checkout.session.completed") {
      console.log("Processing completed checkout:", object.id);

      // Retrieve the Checkout Session to get line items
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        object.id,
        {
          expand: ["line_items"],
        }
      );

      // Extract customer details
      const customerEmail = checkoutSession.customer_details?.email || "";
      const customerName = `${checkoutSession.metadata?.recipientFirstName} ${checkoutSession.metadata?.recipientLastName}`; // From metadata
      const customerPhone = checkoutSession.metadata?.recipientPhone; // From metadata
      const customerAddress = checkoutSession.metadata?.deliveryAddress || ""; // Corrected this
      const subtotal = checkoutSession.amount_subtotal || 0;
      const tax = checkoutSession.total_details?.amount_tax || 0;
      const total = checkoutSession.amount_total || 0;
      const paymentIntentId = checkoutSession.payment_intent as string;

      // Extract delivery-related metadata
      const deliveryType =
        (checkoutSession.metadata?.deliveryType as "pickup" | "delivery") ||
        "pickup";
      const deliveryApt = checkoutSession.metadata?.deliveryApt || "";
      const deliveryInstructions =
        checkoutSession.metadata?.deliveryInstructions || "";
      const recipientFirstName =
        checkoutSession.metadata?.recipientFirstName || "";
      const recipientLastName =
        checkoutSession.metadata?.recipientLastName || "";
      const recipientPhone = checkoutSession.metadata?.recipientPhone || "";
      const scheduledTime = checkoutSession.metadata?.scheduledTime || "";
      const scheduledDate = checkoutSession.metadata?.scheduledDate || "";
      const selectedLocation = checkoutSession.metadata?.selectedLocation || "";

      // Create order items from line items
      const lineItems = checkoutSession.line_items?.data;
      if (!lineItems)
        return NextResponse.json(
          { error: "No line items found" },
          { status: 400 }
        );

      const orderItems = lineItems.map((item) => ({
        name: item.description || "",
        quantity: item.quantity || 1,
        price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0, // Convert from cents to dollars
        notes: "", // Add any notes if needed
        itemId: item.price?.product as string, // Reference to the original item if available
      }));

      // Find the store ID based on an item in the checkout
      let storeId: string | null = null;

      for (const item of lineItems) {
        const stripeProductId = item.price?.product as string;

        // Find the item in the database using the stripeProductId
        const dbItem = await prisma.item.findFirst({
          where: { stripeProductId },
          include: { user: true },
        });

        if (dbItem) {
          // Find the store associated with the user
          const store = await prisma.store.findFirst({
            where: { ownerId: dbItem.userId },
          });

          if (store) {
            storeId = store.id;
            break; // Exit the loop once we find the store
          }
        }
      }

      if (!storeId) {
        return NextResponse.json(
          { error: "No store found for this order" },
          { status: 400 }
        );
      }

      let deliveryFee = 0;
      let deliveryId: string | null = null; // Initialize as null
      let delivery;

      if (deliveryType === "delivery") {
        // Hardcoded addresses as specified
        const pickupAddress = {
          street_address: ["376 Jefferson Rd", ""],
          state: "NY",
          city: "Rochester",
          zip_code: "14623",
          country: "US",
        };

        // Convert customerAddress string to required object
        const customerAddressObject = parseAddressString(customerAddress);
        const dropoffAddress = {
          street_address: [customerAddressObject.streetAddress, deliveryApt],
          state: customerAddressObject.state,
          city: customerAddressObject.city,
          zip_code: customerAddressObject.zipCode,
          country: customerAddressObject.country,
        };

        const deliveryRequest = {
          pickup_name: "Just Chik'n",
          pickup_address: JSON.stringify(pickupAddress),
          pickup_phone_number: "+15555555555",
          dropoff_name: recipientFirstName + " " + recipientLastName,
          dropoff_address: JSON.stringify(dropoffAddress),
          dropoff_phone_number: recipientPhone,
          manifest_items: orderItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            size: "small",
            price: item.price * 100,
          })),
        };

        console.log("DELIVERY REQUEST",(deliveryRequest))

        delivery = await deliveriesClient.createDelivery(deliveryRequest);
        console.log("UBER EATS MADE DELIVERY", delivery);

        // Handle DoorDash delivery (placeholder - you'd need to implement this)
        // const payload = {
        //   external_delivery_id: uuidv4(),
        //   pickup_address: "376 Jefferson Rd, Rochester, NY, 14623",
        //   pickup_business_name: "Just Chik'n",
        //   pickup_phone_number: "+15855551234",
        //   dropoff_address: customerAddress,
        //   dropoff_phone_number: recipientPhone,
        //   order_value: total,
        //   locale: "en-US",
        //   pickup_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        // };
        // const response = await doordash.createDelivery(payload);

        deliveryFee = delivery.fee / 100;
        deliveryId = delivery.id;
      }

      // Create the order with the store information
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          status: "NEW",
          items: {
            create: orderItems,
          },
          subtotal: subtotal / 100,
          tax: tax / 100,
          total: total / 100,
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
          notes: deliveryInstructions, // Use delivery instructions as notes

          paymentIntentId,
          stripeCheckoutSessionId: checkoutSession.id,
          deliveryFee: deliveryFee,
          deliveryId: (deliveryType === 'delivery' ? deliveryId : null),
          storeId: storeId,
          doordashTrackingUrl: delivery?.tracking_url ?? null, // Optional chaining
          doordashFee: delivery?.fee / 100 ?? null, // Optional chaining
          doordashStatus: delivery?.delivery_status ?? null, // Optional chaining
          pickupTimeEstimated: delivery?.pickup_eta ?? null, // Optional chaining
          dropoffTimeEstimated: delivery?.dropoff_eta ?? null, // Optional chaining
        },
        include: {
          items: true,
        },
      });

      // Update orders in Redis cache
      await updateOrdersCache();

      console.log("Order created:", order.orderNumber);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error(`Webhook Error: ${err}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}

// Helper function to parse the address string into required object
function parseAddressString(addressString: string): {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
} {
  // Split the address string by commas and trim each part
  const parts = addressString.split(",").map((part) => part.trim());

  // Assuming the address string is in the format: "Street Address, City, State ZipCode, Country"
  const streetAddress = parts[0] || "";
  const city = parts[1] || "";

  // The last part is State ZipCode and Country, so we split that
  const stateZipCodeAndCountry = parts[2] ? parts[2].split(" ") : [];
  const state = stateZipCodeAndCountry[0] || ""; // E.g., "NY"
  const zipCode = stateZipCodeAndCountry[1] || ""; // E.g., "14623"
  const country = parts[3] || "US"; // Assuming it's US if not provided

  return {
    streetAddress,
    city,
    state,
    zipCode,
    country,
  };
}

// Helper function to update the Redis cache
export async function updateOrdersCache() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    await redis.set("store_orders", JSON.stringify(orders));
  } catch (error) {
    console.error("Failed to update orders cache:", error);
  }
}
