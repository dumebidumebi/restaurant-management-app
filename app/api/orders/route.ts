// /app/api/orders/route.js
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Check if we have cached orders
    const cachedOrders = await redis.get("store_orders");

    if (cachedOrders) {
      return NextResponse.json(JSON.parse(cachedOrders));
    }

    // If no cache, fetch from database
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

    // Cache the result for 1 minute
    await redis.set("store_orders", JSON.stringify(orders));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
