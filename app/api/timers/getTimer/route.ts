// app/api/timers/[orderId]/route.ts  (Rename to app/api/timers/getTimer/route.ts)
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { OrderTimers } from '@/types/index';
import { redis } from '@/lib/redis';

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required in body" }, { status: 400 });
    }

    const timerData = await redis.get(`timer:${orderId}`);
    return NextResponse.json(timerData || {});
  } catch (error) {
    console.error('Failed to fetch timer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer data' },
      { status: 500 }
    );
  }
}
