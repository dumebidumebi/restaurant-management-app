import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { Modifier, ModifierGroup } from "@prisma/client";
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
    const cacheKey = `modifier-groups:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    const  arr : Modifier[] = data.modifiers
    const arrayOfModifierIds  =  arr?.map(item => ( item.id )) 
    // Create the new item
    // Create the new category with item connections
    await prisma.modifierGroup.update({
      where: {
        id: data.id,
        userId: userId, // Ensures user owns the modifier
      },
      data: {
        userId: userId,
        name: data.name,        // Required field mapped from displayName 
        minSelect: data. minSelect,
        maxSelect: data.maxSelect,
        modifiers: { set: arrayOfModifierIds?.map((id: string) => ({ id }))  || []},
        isAvailable: data.isAvailable,             // Explicitly set availability
        // minSelect/maxSelect omitted since not in sample data
        // availability omitted since not in sample data
      },
    });


    // const newModifier = await prisma.modifier.create({
    //   data: {
    //     userId: userId,
    //     name: data.displayName,        // Required field mapped from displayName
    //     displayName: data.displayName, // Optional display name
    //     description: data.description,
    //     price: data.price,
    //     imageUrl: data.imageUrl,
    //     isAvailable: true,             // Explicitly set availability
    //     // minSelect/maxSelect omitted since not in sample data
    //     // availability omitted since not in sample data
    //   },
    // });


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
