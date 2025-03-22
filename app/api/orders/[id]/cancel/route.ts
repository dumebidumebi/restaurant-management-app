// app/api/orders/[orderId]/cancel/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { updateOrdersCache } from "@/app/api/webhooks/stripe-webhook/route";
import { redis } from "@/lib/redis";

export async function POST(
  request: Request
) {
  const body = await request.json();
  const orderId = body.orderId;
  console.log(orderId);
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be canceled
    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELED
    ) {
      return NextResponse.json(
        {
          error: `Cannot cancel an order that is already ${order.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // If order has a delivery in progress, cancel with delivery provider
    if (order.deliveryId && order.deliveryStatus !== "FAILED") {
      // Placeholder for delivery cancellation
      // await cancelDoorDashDelivery(order.deliveryId);
    }

    // Update order status to canceled
    const canceledOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "CANCELED",
      },
    });

    // Update orders in Redis cache
    await redis.del("store_orders");

    await updateOrdersCache()

    return new Response(JSON.stringify(canceledOrder));
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to cancel order" }),

      { status: 500 }
    );
  }
}
