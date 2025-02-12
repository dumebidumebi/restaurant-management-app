import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const body = await req.json();
    const itemId = body.itemId;
    console.log("deleting", itemId)

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!itemId) {
      return new Response(JSON.stringify({ message: "Item ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Cache invalidation logic
    const cacheKey = `modifier-groups:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }
    // Delete only if item belongs to the authenticated user
    const deleteResult = await prisma.modifierGroup.deleteMany({
      where: {
        id: itemId,
        userId: userId,
      },
    });

    if (deleteResult.count === 0) {
      return new Response(
        JSON.stringify({
          message: "Item not found or unauthorized",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Item deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting item:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
