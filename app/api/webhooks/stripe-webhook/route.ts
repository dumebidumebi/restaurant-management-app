import { NextResponse } from "next/server";
import { buffer } from "micro";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma for JsonNull
import { redis } from "@/lib/redis";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const buf = await request.text();
  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);

    // Handle the event
    console.log("Stripe Webhook Event:", event.data.object.id);

    // Retrieve the Checkout Session from the API with line_items expanded
    const checkoutSession = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ["line_items"],
    });

    console.log("Checkout Session Line Items:", checkoutSession);

    // Extract necessary information from the checkout session
    const lineItems = checkoutSession.line_items?.data || [];
    const customerEmail = checkoutSession.customer_details?.email || "";
    const customerName = checkoutSession.customer_details?.name || "";
    const customerPhone = checkoutSession.customer_details?.phone || "";
    const customerAddress = checkoutSession.customer_details?.address?.line1 || "";
    const subtotal = checkoutSession.amount_subtotal || 0;
    const tax = checkoutSession.total_details?.amount_tax || 0;
    const total = checkoutSession.amount_total || 0;
    const paymentIntentId = checkoutSession.payment_intent as string;
    const stripeCheckoutSessionId = checkoutSession.id;

    // Find the store ID based on the items in the checkout session
    let storeId: string | null = null;

    // Loop through the line items to find the store ID
    for (const item of lineItems) {
      const stripeProductId = item.price?.product as string;

      // Find the item in the database using the stripeProductId
      const dbItem = await prisma.item.findFirst({
        where: {
          stripeProductId,
        },
        include: {
          user: true, // Include the user to get the userId
        },
      });

      if (dbItem) {
        // Find the store associated with the user
        const store = await prisma.store.findFirst({
          where: {
            ownerId: dbItem.userId,
          },
        });

        if (store) {
          storeId = store.id;
          break; // Exit the loop once we find the store
        }
      }
    }

    if (!storeId) {
      throw new Error("Store not found for the items in the checkout session.");
    }

    // Create order items from line items
    const orderItems = lineItems.map((item) => ({
      name: item.description || "",
      quantity: item.quantity || 1,
      price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0, // Convert from cents to dollars
      modifiers: Prisma.JsonNull, // Use Prisma.JsonNull for JSON fields
      notes: "", // Add any notes if needed
      itemId: item.price?.product as string, // Reference to the original item if available
    }));

    // Create the order in the database
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`, // Generate a unique order number
        status: "NEW",
        items: {
          create: orderItems,
        },
        subtotal: subtotal / 100, // Convert from cents to dollars
        tax: tax / 100, // Convert from cents to dollars
        total: total / 100, // Convert from cents to dollars
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        paymentIntentId,
        stripeCheckoutSessionId,
        store: {
          connect: {
            id: storeId, // Connect the order to the store
          },
        },
      },
      include: {
        items: true,
      },
    });

   
// adding the orders to redis
    const orders = await prisma.order.findMany({
      where: {
        // You may want to add store filtering based on user session
        // storeId: 'current-store-id'
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    await redis.set("store_orders", JSON.stringify(orders));

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: Record<string, any>;
  notes?: string;
  itemId?: string;
}

interface CartData {
  id: string;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryFee?: number;
  storeId: string;
  store: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

/**
 * Handle a successful payment intent
 */
async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log("Payment succeeded:", paymentIntent.id);

  // Retrieve metadata from the payment intent or the related session
  const { metadata } = paymentIntent;

  if (!metadata || !metadata.cart_id) {
    console.log("No cart ID found in payment intent metadata");
    return;
  }

  // Fetch cart data from your database or session storage
  const cartData = await retrieveCartData(metadata.cart_id);

  if (!cartData) {
    console.log(`Cart not found for ID: ${metadata.cart_id}`);
    return;
  }

  // Create the order
  await createOrder(paymentIntent, cartData);
}

/**
 * Handle a completed checkout session
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log("Checkout completed:", session.id);

  // For checkout sessions, the metadata might be on the session directly
  const { metadata } = session;

  if (!metadata || !metadata.cart_id) {
    console.log("No cart ID found in session metadata");
    return;
  }

  // For Checkout, we need to retrieve the payment intent first
  if (!session.payment_intent || typeof session.payment_intent !== "string") {
    console.log("No payment intent found in session");
    return;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.payment_intent
  );

  // Fetch cart data from your database or session storage
  const cartData = await retrieveCartData(metadata.cart_id);

  if (!cartData) {
    console.log(`Cart not found for ID: ${metadata.cart_id}`);
    return;
  }

  // Create the order
  await createOrder(paymentIntent, cartData);
}

/**
 * Retrieve cart data from database or session storage
 */
async function retrieveCartData(cartId: string): Promise<CartData | null> {
  try {
    // Implement according to your data storage approach
    const cart = await prisma.category.findUnique({
      where: { id: cartId },
      include: {
        items: true,
        store: true,
      },
    });

    return cart as unknown as CartData;
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return null;
  }
}

/**
 * Create a new order in the database
 */
async function createOrder(
  paymentIntent: Stripe.PaymentIntent,
  cartData: CartData
) {
  try {
    // Generate a unique order number (format: date + random digits)
    const orderNumber = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}${Math.floor(1000 + Math.random() * 9000)}`;

    // Calculate order totals
    const subtotal = cartData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.07; // Example tax rate (7%)
    const total = subtotal + tax + (cartData.deliveryFee || 0);

    // Create delivery quote with DoorDash if delivery is requested
    let deliveryQuoteId: string | null = null;
    // Commented out DoorDash integration
    /*
    if (cartData.deliveryAddress) {
      const quoteResult = await createDeliveryQuote({
        external_delivery_id: orderNumber,
        pickup_address: cartData.store.address,
        pickup_business_name: cartData.store.name,
        pickup_phone_number: cartData.store.phone,
        dropoff_address: cartData.deliveryAddress,
        dropoff_business_name: cartData.customerName || '',
        dropoff_phone_number: cartData.customerPhone || '',
      });
      
      deliveryQuoteId = quoteResult.quote_id;
    }
    */

    // Create new order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "NEW",
        customerName: cartData.customerName || "Anonymous",
        customerPhone: cartData.customerPhone,
        customerEmail: cartData.customerEmail,
        customerAddress: cartData.deliveryAddress,
        storeId: cartData.storeId,
        deliveryQuoteId,
        subtotal,
        tax,
        deliveryFee: cartData.deliveryFee || 0,
        total,
        paymentIntentId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
        items: {
          create: cartData.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            modifiers: item.modifiers || {},
            itemId: item.itemId,
          })),
        },
      },
    });

    console.log(`Order created: #${orderNumber}`);

    // Clear the cart after successful order creation
    await prisma.cart.delete({
      where: { id: cartData.id },
    });

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
