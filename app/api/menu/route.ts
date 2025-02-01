import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log(body);

  // Create a new user

  console.log(body);
  // Return the created user
  return new Response(JSON.stringify(body), { status: 201 });
}
