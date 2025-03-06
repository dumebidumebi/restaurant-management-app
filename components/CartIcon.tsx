// components/CartIcon.tsx
'use client';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCart } from 'lucide-react';

export default function CartIcon() {
  const totalItems = useCartStore(state => state.totalItems());
  
  return (
    <Link href="/checkout" className="relative">
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
          {totalItems}
        </span>
      )}
    </Link>
  );
}