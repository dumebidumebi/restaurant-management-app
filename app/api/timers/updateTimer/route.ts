// app/api/timers/[orderId]/route.ts  (Rename to app/api/timers/updateTimer/route.ts)
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { OrderTimers } from '@/types/index';
import { redis } from '@/lib/redis';

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const { orderId, timerData } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required in body" }, { status: 400 });
    }

    if (!timerData) {
      return NextResponse.json({ error: "timerData is required in body" }, { status: 400 });
    }

    await redis.set(`timer:${orderId}`, timerData);
    // Set expiry to 24 hours to avoid cluttering Redis
    await redis.expire(`timer:${orderId}`, 60 * 60 * 24);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update timer data:', error);
    return NextResponse.json(
      { error: 'Failed to update timer data' },
      { status: 500 }
    );
  }
}
