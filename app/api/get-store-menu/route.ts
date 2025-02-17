import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

const CACHE_TTL = 3600; // 1 hour in seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const storeId = body.storeId; // Changed to storeId
    console.log("store id", storeId);

    if (!storeId) {
      return new Response(JSON.stringify({ message: "store ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cacheKey = `menus:${storeId}`; // Changed cache key

    // Try to get cached data first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Serving from cache");
        return new Response(cachedData, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (redisError) {
      console.error("Redis error:", redisError);
      // Continue to database query if Redis fails
    }

    // If not in cache, query database
    const menus = await prisma.menu.findMany({
      where: { storeId: storeId },
      orderBy: { createdAt: "desc" },
      include: {
        categories: {
          include: {
            items: {
              include: {
                modifierGroups: {
                  include: {
                    modifiers: true, // Include modifiers in the modifier groups
                  },
                },
              },
            },
          },
        },
      },
    });

    // Cache the result with TTL
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(menus));
    } catch (redisError) {
      console.error("Failed to cache data:", redisError);
    }

    console.log("Menus fetched successfully", menus);

    return new Response(JSON.stringify(menus), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching menus:", error); // Changed error message
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
