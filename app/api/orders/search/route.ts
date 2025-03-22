// app/api/orders/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const authResult = getAuth(request);
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { timeFilter, searchQuery } = body;
    
    // Create cache key based on request params
    const cacheKey = `orders:${userId}:${timeFilter}:${searchQuery || "none"}`;
    
    // Try to get from cache first
    // const cachedData = await redis.get(cacheKey);
    // if (cachedData) {
    //   console.log("Cache hit for orders");
    //   // Parse the JSON string back to an array before returning
    //   let parsedOrders;
    //   try {
    //     parsedOrders = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    //   } catch (e) {
    //     console.error("Error parsing cached orders:", e);
    //     parsedOrders = [];
    //   }
    //   return NextResponse.json({ orders: parsedOrders });
    // }
    
    // Set up date filters based on timeFilter
    let dateFilter: Prisma.OrderWhereInput = {};
    const now = new Date();
    
    if (timeFilter === "today") {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      dateFilter = {
        createdAt: {
          gte: startOfDay,
        },
      };
    } else if (timeFilter === "yesterday") {
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      
      const endOfYesterday = new Date(now);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
      };
    } else if (timeFilter === "thisWeek") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      dateFilter = {
        createdAt: {
          gte: startOfWeek,
        },
      };
    } else if (timeFilter === "lastWeek") {
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
      startOfLastWeek.setHours(0, 0, 0, 0);
      
      const endOfLastWeek = new Date(now);
      endOfLastWeek.setDate(now.getDate() - now.getDay() - 1);
      endOfLastWeek.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          gte: startOfLastWeek,
          lte: endOfLastWeek,
        },
      };
    } else if (timeFilter === "thisMonth") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      dateFilter = {
        createdAt: {
          gte: startOfMonth,
        },
      };
    } else if (timeFilter === "lastMonth") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      };
    }
    
    // Set up search filter if searchQuery exists
    let searchFilter: Prisma.OrderWhereInput = {};
    if (searchQuery) {
      searchFilter = {
        OR: [
          { customerName: { contains: searchQuery, mode: "insensitive" as Prisma.QueryMode } },
          { customerPhone: { contains: searchQuery, mode: "insensitive" as Prisma.QueryMode } },
          { orderNumber: { contains: searchQuery, mode: "insensitive" as Prisma.QueryMode } },
        ],
      };
    }
    
    // Get user's store
    const userStore = await prisma.store.findFirst({
      where: { ownerId: userId },
    });
    
    if (!userStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    
    // Get orders with filters
    const orders = await prisma.order.findMany({
      where: {
        storeId: userStore.id,
        ...dateFilter,
        ...searchFilter,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Cache the results with a 5-minute TTL (5 * 60 seconds)
    // await redis.set(cacheKey, JSON.stringify(orders),);
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
