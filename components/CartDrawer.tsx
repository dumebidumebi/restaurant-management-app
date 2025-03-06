// components/CartDrawer.tsx
"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart } from "lucide-react";
import { Separator } from "./ui/separator";

export function CartDrawer() {
  const { cartItems, totalItems, totalPrice, removeFromCart, updateQuantity } =
    useCartStore();

  return (
    <Drawer>
      <DrawerTrigger className="relative">
        <ShoppingCart className="h-6 w-6" />
        {totalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {totalItems()}
          </span>
        )}
      </DrawerTrigger>

      <DrawerContent className="max-h-[80vh] h-5/6">
        <div className="mx-auto w-full max-w-2xl h-full flex flex-col">
          {/* Header section */}
          <DrawerHeader className="px-4 pt-4 pb-2">
            <DrawerTitle className="text-lg">Cart</DrawerTitle>
            <Separator className="mt-2" />
          </DrawerHeader>

          {/* Cart items section - make this scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {cartItems.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-center text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p>${item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                        className="w-16 border rounded px-2 py-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer section */}
          <DrawerFooter className="border-t px-4 py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-medium">Subtotal</h2>
              <p className="text-md font-medium">
                ${totalPrice().toFixed(2)}
              </p>
            </div>

            {cartItems.length > 0 && (
              <DrawerClose asChild>
                <Link href="/checkout" className="w-full">
                  <Button className="w-full py-6 text-lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </DrawerClose>
            )}

            <DrawerClose>
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
