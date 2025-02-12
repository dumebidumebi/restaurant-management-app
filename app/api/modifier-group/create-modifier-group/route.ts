import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { Item } from "@prisma/client";
import { NextRequest } from "next/server";
import { Modifier } from "@prisma/client";

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

    const  arr : Modifier[] = data.modifiers
    const arrayOfModifierIds  =  arr?.map(item => ( item.id )) 
   
    // Create the new category with item connections
    const newModifier = await prisma.modifierGroup.create({
      data: {
        userId: userId,
        name: data.name,        // Required field mapped from displayName 
        minSelect: data.minSelect,
        maxSelect: data.maxSelect,
        modifiers: arrayOfModifierIds.length ? { connect: arrayOfModifierIds?.map((id: string) => ({ id })) }: undefined, 
        isAvailable: true,             // Explicitly set availability
        // minSelect/maxSelect omitted since not in sample data
        // availability omitted since not in sample data
      },
    });

    console.log("just made", newModifier);
    // Cache invalidation logic
    const cacheKey = `modifier-groups:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    return new Response(JSON.stringify(newModifier), {
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
