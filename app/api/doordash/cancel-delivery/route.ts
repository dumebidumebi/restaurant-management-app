import  { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { externalDeliveryId } = reqBody;

    if (!externalDeliveryId) {
      return NextResponse.json({ error: 'External delivery ID is required' }, { status: 400 });
    }

    const url = `https://openapi.doordash.com/drive/v2/deliveries/${externalDeliveryId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DoorDash cancel error:", response.status, errorText);

      // Special handling for 409 (cannot cancel after dasher assigned)
      if (response.status === 409) {
        return NextResponse.json({
          error: "Cannot cancel delivery - Dasher already assigned",
          details: "Once a Dasher has been assigned, deliveries cannot be cancelled.",
        }, { status: 409 });
      }

      return NextResponse.json({
        error: "Failed to cancel DoorDash delivery",
        details: errorText,
      }, { status: response.status });
    }

    const cancelData = await response.json();
    return NextResponse.json(cancelData, { status: 200 });
  } catch (error: any) {
    console.error("Error canceling DoorDash delivery:", error);
    return NextResponse.json({
      error: "Internal server error canceling delivery",
      message: error.message,
    }, { status: 500 });
  }
}
