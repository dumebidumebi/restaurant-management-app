import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe";
import { getAuth } from "@clerk/nextjs/server";
import { Item, Modifier } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);
    const data: Modifier = body.data;

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
    const cacheKey = `modifiers:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    // Get existing modifier
    const existingModifier = await prisma.modifier.findUnique({
      where: { id: data.id, userId },
    });

    if (!existingModifier) {
      return new Response(JSON.stringify({ message: "Modifier not found" }), {
        status: 404,
      });
    }

    let stripePriceId = existingModifier.stripePriceId;

    // Handle price changes
    if (data.price !== existingModifier.price) {
      const newPrice = await stripe.prices.create({
        product: existingModifier.stripeProductId!,
        unit_amount: Math.round(data.price * 100),
        currency: "usd",
      });
      stripePriceId = newPrice.id;
    }
    // Create the new item
    // Create the new category with item connections
    await prisma.modifier.update({
      where: {
        id: data.id,
        userId: userId, // Ensures user owns the modifier
      },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl !== "" ? data.imageUrl : null,
        isAvailable: data.isAvailable,
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
