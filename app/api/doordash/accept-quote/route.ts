import { doordash } from '@/lib/doordash';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { externalDeliveryId, customerPhone } = reqBody;

    if (!externalDeliveryId) {
      return NextResponse.json({ error: 'External delivery ID is required' }, { status: 400 });
    }

    // Accept the quote
    const acceptPayload = {
      tip: 0, // Optional tip in cents
      dropoff_phone_number: customerPhone || "+15855551234", // Use provided number or fallback
    };

    try {
      const response = await doordash.deliveryQuoteAccept(externalDeliveryId);
      console.log("DoorDash quote response:", response.data);
      
      return NextResponse.json(response.data, { status: 200 });
    } catch (doordashError: any) {
      console.error("DoorDash API error details:", JSON.stringify(doordashError?.response?.data || doordashError, null, 2));
    }
  

    

  } catch (error: any) {
    console.error("Error accepting DoorDash quote:", error);
    return NextResponse.json({
      error: "Internal server error accepting quote",
      message: error.message,
    }, { status: 500 });
  }
}
