import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";


const CACHE_TTL = 3600; // 1 hour in seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return new Response(JSON.stringify({ message: 'User ID is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cacheKey = `items:${userId}`;

    // Try to get cached data first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log('Serving from cache');
        return new Response(cachedData, { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (redisError) {
      console.error('Redis error:', redisError);
      // Continue to database query if Redis fails
    }

    // If not in cache, query database
    const items = await prisma.item.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include:{modifierGroups: true }
    });

    // Cache the result with TTL
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(items));
    } catch (redisError) {
      console.error('Failed to cache data:', redisError);
    }

    console.log(items)
    
    return new Response(JSON.stringify(items), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error fetching items:", error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}