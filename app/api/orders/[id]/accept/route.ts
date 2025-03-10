// /app/api/orders/[id]/accept/route.js
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }) {
  const { id } = params;
  
  try {
    const body = await request.json();
    const { prepTime } = body;
    
    const updatedOrder = await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: 'ACCEPTED',
        prepTime: parseInt(prepTime),
        updatedAt: new Date(),
      },
      include: {
        items: true,
      },
    });
    
    // Invalidate cache
    await redis.del('store_orders');
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to accept order:', error);
    return NextResponse.json(
      { error: 'Failed to accept order' },
      { status: 500 }
    );
  }
}
