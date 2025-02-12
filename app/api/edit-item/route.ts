import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { ModifierGroup } from "@prisma/client";
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

    console.log("data here", data);

    // Cache invalidation logic
    const cacheKey = `items:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    const  arr : ModifierGroup[] = data.modifierGroups
    const arrayOfModifierGroupIds  =  arr?.map(item => ( item.id )) 
   
    const updatedItem = await prisma.item.update({
      where: {
        id: data.id, // You need to get the item ID from somewhere
        userId: userId, // Ensures users can only update their own items
      },
      data: {
        name: data.displayName,
        displayName: data.displayName,
        imageUrl: data.imageUrl,
        description: data.description,
        price: Number(data.price),
        options: data.options ? data.options : "",
        allergens: data.allergens ? data.allergens : "",
        // Add other fields you want to update
        isAvailable: data.isAvailable,
        updatedAt: new Date(), // Track update timestamp
        modifierGroups: arrayOfModifierGroupIds.length ? { set: arrayOfModifierGroupIds?.map((id: string) => ({ id })) }: undefined, 
      },
    });

    return new Response(JSON.stringify(updatedItem), {
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
