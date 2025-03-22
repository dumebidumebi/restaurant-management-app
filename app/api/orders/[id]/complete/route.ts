// /app/api/orders/[id]/complete/route.js
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: "COMPLETED",
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
    console.error("Failed to complete order:", error);
    return NextResponse.json(
      { error: "Failed to complete order" },
      { status: 500 }
    );
  }
}
