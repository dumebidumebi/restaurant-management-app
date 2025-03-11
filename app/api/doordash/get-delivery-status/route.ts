import { doordash } from '@/lib/doordash';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const externalDeliveryId = searchParams.get('externalDeliveryId');

    if (!externalDeliveryId || typeof externalDeliveryId !== "string") {
      return NextResponse.json({ error: 'External delivery ID is required' }, { status: 400 });
    }

    const response  = await doordash.getDelivery(externalDeliveryId)

    // console.log(response.data)
    return NextResponse.json( JSON.stringify(response.data));
  } catch (error: any) {
    console.error("Error getting DoorDash delivery status:", error);
    return NextResponse.json({
      error: "Internal server error getting delivery status",
      message: error.message,
    }, { status: 500 });
  }
}
