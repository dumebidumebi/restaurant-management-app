import { doordash } from '@/lib/doordash';
import { redis } from '@/lib/redis';
import { DeliveryResponse, DoorDashResponse } from '@doordash/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json()
  const dropoff_address = body.dropoff_address
  try {
    // Generate a unique ID for this delivery
    const externalDeliveryId = uuidv4();

    // Hardcoded addresses as specified
    const payload = {
      external_delivery_id: externalDeliveryId,
      pickup_address: "376 Jefferson Rd, Rochester, NY, 14623",
      pickup_business_name: "Your Restaurant Name",
      pickup_phone_number: "+15855551234",
      dropoff_address: dropoff_address,
      dropoff_phone_number: "+16179592773",
      order_value: 2000,
      locale: "en-US",
      pickup_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    console.log("Sending payload to DoorDash:", JSON.stringify(payload, null, 2));

    try {
      const response = await doordash.deliveryQuote(payload);
      console.log("DoorDash quote response:", response.data);
      redis.set("quote", JSON.stringify(response.data))
      return NextResponse.json(response.data, { status: 200 });
    } catch (doordashError: any) {
      console.error("DoorDash API error details:", JSON.stringify(doordashError?.response?.data || doordashError, null, 2));
      
      // Check if it's a validation error with field details
      if (doordashError?.response?.data?.fieldErrors) {
        return NextResponse.json({
          error: "DoorDash validation error",
          message: "One or more fields failed validation",
          fieldErrors: doordashError.response.data.fieldErrors
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: "DoorDash API error",
        message: doordashError.message || "Unknown DoorDash error",
        details: doordashError.response?.data || doordashError
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error creating DoorDash quote:", error);
    return NextResponse.json({
      error: "Internal server error creating quote",
      message: error.message,
    }, { status: 500 });
  }
}
