import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { Item } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);
    const data = body.data;

    console.log(data);

    if (!userId || !data) {
      return new Response(
        JSON.stringify({ message: "User ID and data are required" }),
        {
          status: 400,
        }
      );
    }

    // Cache invalidation logic
    const cacheKey = `categories:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }


    // Create the new item
    // Create the new category with item connections
    await prisma.category.update({
      where: {
        id: data.id, // You need to get the item ID from somewhere
        userId: userId, // Ensures users can only update their own items
      },
      data: {
        userId: userId,
        name: data.name,
        description: data.description,
        isAvailable: data.isAvailable,
        items: {
          connect: data.items?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        items: true, // Include connected items in the response
      },
    });

    return new Response(JSON.stringify({ response: "ok" }), {
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
