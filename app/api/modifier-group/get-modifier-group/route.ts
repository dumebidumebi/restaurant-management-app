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

    const cacheKey = `modifier-groups:${userId}`;

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
    const modifiers = await prisma.modifierGroup.findMany({
      where: {
        userId: userId, // Filter by user ID
      },
      orderBy: {
        createdAt: "desc", // Optional: sort by creation date (newest first)
      },
      include: { modifiers: true }, // Include mods related to the mod grp
    });

    console.log("Modifier groups", modifiers);
    // Cache the result with TTL
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(modifiers));
      console.log("modifiers cached successfully");
    } catch (redisError) {
      console.error("Failed to cache categories:", redisError);
    }

    return new Response(JSON.stringify(modifiers), {
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
