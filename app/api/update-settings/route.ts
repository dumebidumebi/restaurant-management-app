import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse the request body
    const userId = body.userId; // Extract userId from the body
    const data = body.data; // Extract the new settings data

    if (!userId || !data) {
      return new Response(
        JSON.stringify({ message: "User ID and data are required" }),
        { status: 400 }
      );
    }

    // Fetch the existing store to ensure it exists
    const store = await prisma.store.findUnique({
      where: {
        ownerId: userId, // Find the store using the ownerId
      },
    });

    if (!store) {
      return new Response(
        JSON.stringify({ message: "Store not found for this user" }),
        { status: 404 }
      );
    }

    // Update the settings object in the store
    const updatedStore = await prisma.store.update({
      where: {
        ownerId: userId, // Match the store by the ownerId
      },
      data: {
        settings: {
          //...store.settings, // Retain existing settings
          ...data, // Merge with new data
        },
      },
      select: {
        settings: true, // Return only the updated settings
      },
    });

    // Return the updated settings
    return new Response(JSON.stringify(updatedStore.settings), { status: 200 });
  } catch (error) {
    console.error("Error updating store settings:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
