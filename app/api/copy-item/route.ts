import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);
    const data = body.data;

    if (!userId || !data) {
      return new Response(
        JSON.stringify({ message: "User ID and data are required" }),
        {
          status: 400,
        }
      );
    }

    // Validate required fields
    if (!data.displayName || !data.description || !data.price) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    // Cache invalidation logic
    const cacheKey = `items:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }
    
    console.log(data);
    // Create the new item
    const newItem = await prisma.item.create({
      data: {
        name: data.displayName, // Assuming name should match displayName
        displayName: data.displayName,
        imageUrl: data.imageUrl,
        description: data.description,
        price: Number(data.price),
        options: data.options ? data.options : "",
        allergens: data.allergens ? data.allergens : "",
        userId: userId,
        // categoryId: "", // Replace with actual category handling
        isAvailable: true,
        availability: {}, // Add proper availability data if needed
      },
    });

    return new Response(JSON.stringify(newItem), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
