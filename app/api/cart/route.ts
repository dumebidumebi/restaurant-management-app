// app/api/cart/route.ts
import { redis } from '@/lib/redis';
import { getOrCreateSessionId } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const data = await redis.get(`cart:${sessionId}`);
    return NextResponse.json(data ? JSON.parse(data) : []);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// app/api/cart/route.ts
export async function POST(request: Request) {
    const { sessionId, cartItems } = await request.json();
    
    if (!sessionId || !cartItems) {
      return NextResponse.json(
        { error: 'Session ID and cart items required' },
        { status: 400 }
      );
    }
  
    try {
      await redis.set(`cart:${sessionId}`, JSON.stringify(cartItems));
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      );
    }
  }