import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe";
import { getAuth } from "@clerk/nextjs/server";
import { Item } from "@prisma/client";
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
    const cacheKey = `modifiers:${userId}`;
    try {
      await redis.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }

    console.log(data);
    // Create the new item
    // Create the new category with item connections

    // Create Stripe product
    const product = await stripe.products.create({
      name: data.displayName,
      description: data.description,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(data.price * 100),
      currency: "usd",
    });

    const newModifier = await prisma.modifier.create({
      data: {
        userId: userId,
        name: data.displayName, // Required field mapped from displayName
        displayName: data.displayName, // Optional display name
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        isAvailable: true, // Explicitly set availability
        stripeProductId: product.id,
        stripePriceId: price.id,
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
