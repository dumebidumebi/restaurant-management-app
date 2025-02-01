import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse the request body
    const userId = body.userId; // Extract userId from the body

    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), {
        status: 400,
      });
    }

    // Fetch only the settings for the store associated with the user
    const settings = await prisma.store.findUnique({
      where: {
        ownerId: userId, // Find the store using the ownerId
      },
      select: {
        settings: true, // Select only the settings field
      },
    });

    console.log(settings);
    if (!settings) {
      return new Response(
        JSON.stringify({ message: "Settings not found for this user" }),
        { status: 404 }
      );
    }

    // Return the settings directly
    console.log(settings.settings);
    return new Response(JSON.stringify(settings.settings), { status: 200 });
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
