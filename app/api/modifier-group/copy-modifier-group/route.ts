import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { Item, Modifier } from "@prisma/client";
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

    // Cache invalidation logic
    const cacheKey = `modifier-groups:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }
    
    console.log(data);
    // Create the new item
  // Create the new category with item connections

  const  arr : Modifier[] = data.modifiers
  const arrayOfModifierIds  =  arr?.map(item => ( item.id )) 
 
  // Create the new category with item connections
  const newModifier = await prisma.modifierGroup.create({
    data: {
      userId: userId,
      name: data.name,        // Required field mapped from displayName 
      minSelect: data. minSelect,
      maxSelect: data.maxSelect,
      modifiers: arrayOfModifierIds.length ? { connect: arrayOfModifierIds?.map((id: string) => ({ id })) }: undefined, 
      isAvailable: true,             // Explicitly set availability
      // minSelect/maxSelect omitted since not in sample data
      // availability omitted since not in sample data
    },
  });


    return new Response(JSON.stringify(newModifier), {
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
