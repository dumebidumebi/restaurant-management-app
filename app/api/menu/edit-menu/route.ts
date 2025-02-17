import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { Category } from "@prisma/client";
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
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Cache invalidation logic
    const cacheKey = `menus:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    // Extract category IDs from the incoming data
    const arr: Category[] = data.categories;
    const categoryIds = arr?.map((category) => category.id);

    // Update the menu
    const updatedMenu = await prisma.menu.update({
      where: {
        id: data.id,
        userId: userId, // Ensures user owns the menu
      },
      data: {
        name: data.name, // Update the menu name
        categories: {
          set: categoryIds.map((id) => ({ id })) || [],
        },

        isAvailable: data.isAvailable, // Update availability
        // Add any other fields you want to update here
      },
      include: {
        categories: true, // Include the categories in the response
      },
    });

    console.log("just updated", updatedMenu);
    return new Response(JSON.stringify(updatedMenu), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
