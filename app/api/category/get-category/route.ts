import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const CACHE_TTL = 60 * 5; // 5 minutes in seconds
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 }
      );
    }

    const cacheKey = `categories:${userId}`;

    // Try to get cached data first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Serving categories from cache");
        return new Response(cachedData, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, s-maxage=300", // 5 minutes
          },
        });
      }
    } catch (redisError) {
      console.error("Redis error:", redisError);
      // Continue to database query if Redis fails
    }

    // Get all categories with their items
    const categories = await prisma.category.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include: { items: true }, // Include items related to the category
    });
    
    console.log("Categories fetched successfully", categories);
    // Cache the result with TTL
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(categories));
      console.log("Categories cached successfully");
    } catch (redisError) {
      console.error("Failed to cache categories:", redisError);
    }
  

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60", // Optional caching
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
