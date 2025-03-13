import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { DeliveryStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const data = await req.json();

  try {
    // Find the order by external delivery ID
    const existingOrder = await prisma.order.findFirst({
      where: { deliveryId: data.external_delivery_id }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
console.log(data)
    // Map DoorDash status to our DeliveryStatus enum
    const statusMap: { [key] } = {
      DASHER_CONFIRMED: "Courier assigned",
      DASHER_CONFIRMED_PICKUP_ARRIVAL: "Courier arriving",
      DASHER_PICKED_UP: "Order picked up",
      DELIVERED: "Delivered",
      FAILED: "FAILED",
      COURIER_ARRIVED: "COURIER_ARRIVED",
      DASHER_DROPPED_OFF: "Order dropped off",
      DASHER_CONFIRMED_DROPOFF_ARRIVAL: "Courier arrived at dropoff"
    };

    // Update the order with webhook data
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        doordashStatus: statusMap[data.event_name],
        deliveryStatus:  "PENDING",
        doordashTrackingUrl: data.tracking_url,
        deliveryFee: data.fee ? data.fee / 100 : null,
        dasherName: data.dasher_name,
        dasherPhone: data.dasher_phone_number,
        estimatedPickupTime: data.pickup_time_estimated ? new Date(data.pickup_time_estimated) : null,
        estimatedDropoffTime: data.dropoff_time_estimated ? new Date(data.dropoff_time_estimated) : null,
        supportReference: data.support_reference
      }
    });

    // Update Redis store
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });
    await redis.set("store_orders", JSON.stringify(orders));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DoorDash webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}