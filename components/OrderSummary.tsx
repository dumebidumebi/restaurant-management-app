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
  const taxes = subtotal * 0.12; // Assuming 12% tax rate
  const total = subtotal + taxes + tipAmount;

  return (
    <div className="p-4 border my-10 mx-10 min-h-3.5 rounded-md max-w-lg h-fit w-fit md:block ">
      <h3 className="text-lg font-semibold mb-4">Order summary</h3>
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
          <span className="font-medium">${tipAmount}</span>
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
          className="flex  items-center flex-row  justify-between border p-4 rounded-lg my-4  md:block "
        >
          <div className="flex  overflow-hidden w-64 items-center gap-4">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="text-sm">{item.name}</p>
              <p>${item.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center flex-col gap-4">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="w-16 border rounded px-2 py-1"
            />
            <Button
              variant="outline"
              className="font-normal mx-2"
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
