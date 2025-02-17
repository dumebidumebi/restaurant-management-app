import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { Category, Menu, Store } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);
    const data = body.data;

    console.log(data);

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

    // Fetch the store associated with the user
    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      return new Response(
        JSON.stringify({ message: "Store not found for this user" }),
        { status: 404 }
      );
    }

    const arr: Category[] = data.categories;
    const arrayOfCategoryIds = arr?.map((item) => item.id);

    // Create the new menu with category connections
    const newMenu = await prisma.menu.create({
      data: {
        userId: userId, // Use the authenticated user's ID
        storeId: store.id, // Use the fetched storeId
        name: data.name,
        isAvailable: true, // Explicitly set availability
        availability: {},
        categories: {
          connect: arrayOfCategoryIds.length
            ? arrayOfCategoryIds.map((id: string) => ({ id }))
            : undefined,
        },
      },
    });

    console.log("just made", newMenu);

    // Cache invalidation logic
    const cacheKey = `menus:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    return new Response(JSON.stringify(newMenu), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating menu:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
