
import { useCartStore } from "@/stores/cartStore";
import React from "react";
import { Button } from "./ui/button";

interface OrderSummaryProps {
  tipAmount: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ tipAmount }) => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart } =
    useCartStore();
  const subtotal = totalPrice();
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes + tipAmount;

  return (
    <div
      className="my-4 h-fit w-fit max-w-lg rounded-md border p-4
"
    >
      <h3 className="mb-4 text-lg font-semibold">Order summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Taxes & fees</span>
          <span className="font-medium">${taxes.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tip</span>
          <span className="font-medium">{tipAmount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 underline">
            Add coupon or gift card
          </span>
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {cartItems.map((item) => (
        <div
          key={item.id}
          className="my-4 flex flex-row items-center justify-between
          rounded-lg border p-4"
        >
          <div className="flex w-64 items-center gap-4 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-16 w-16 rounded object-cover"
            />
            <div>
              <p className="text-sm">{item.name}</p>
              <p>\${item.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="w-16 rounded border px-2 py-1"
            />
            <Button
              variant="outline"
              className="mx-2 font-normal"
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummary;
