import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { Category, Item } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);
    const data = body.data;

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ message: "Request body is required" }),
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.displayName || !data.description) {
      return new Response(
        JSON.stringify({
          message: "Display name and description are required",
        }),
        { status: 400 }
      );
    }
    console.log(data);
    const arr: Item[] = data.items;
    const arrayOfItemIds = arr?.map((item) => item.id);

    // Create the new category with item connections
    const newCategory = await prisma.category.create({
      data: {
        userId: userId,
        name: data.displayName,
        description: data.description,
        isAvailable: true,
        items: arrayOfItemIds?.length
          ? {
              connect: arrayOfItemIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        items: true, // Include connected items in the response
      },
    });

    console.log("i just created this category ", newCategory);
    // Cache invalidation logic
    const cacheKey = `categories:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    return new Response(JSON.stringify(newCategory), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
