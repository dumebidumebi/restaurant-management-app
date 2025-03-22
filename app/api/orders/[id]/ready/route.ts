// /app/api/orders/[id]/ready/route.js
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Always update to READY status directly
    const updatedOrder = await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: "READY",
        updatedAt: new Date(),
      },
      include: {
        items: true,
      },
    });

    // Invalidate cache
    await redis.del("store_orders");

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
