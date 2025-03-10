// app/api/timers/init/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OrderItem, OrderTimers } from '@/types/index';
import { redis } from '@/lib/redis';



interface InitTimerRequest {
  orderId: string;
  items: OrderItem[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { orderId, items }: InitTimerRequest = await request.json();
    
    // Create timer entries for each item in the order
    const timerData: OrderTimers = {};
    
    items.forEach(item => {
      timerData[item.id] = {
        prepTime: item.prepTime || 30, // Default to 30 mins if not specified
        startTime: Date.now(),
      };
    });
    
    await redis.set(`timer:${orderId}`, timerData);
    await redis.expire(`timer:${orderId}`, 60 * 60 * 24); // 24 hour expiry
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to initialize timer data:', error);
    return NextResponse.json(
      { error: 'Failed to initialize timer data' }, 
      { status: 500 }
    );
  }
}
