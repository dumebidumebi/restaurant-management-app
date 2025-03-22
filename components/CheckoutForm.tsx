import React, { useState } from "react";
import {
  AddressElement,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ChevronRight, ChevronRightCircle } from "lucide-react";
import TipComponent from "./Tips";
import EmailInput from "./EmailInput";

interface FormData {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  getEmails: boolean;
  getTexts: boolean;
}

interface CheckoutError {
  message: string;
  code?: string;
}

export const CheckoutForm = () => {
  const checkout = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);
  const [formData, setFormData] = useState<FormData>({
    mobileNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    getEmails: true,
    getTexts: false,
  });
  const [tipAmount, setTipAmount] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEmailBlur = () => {
    checkout.updateEmail(formData.email).then((result) => {
      if (result.type === "error") {
        setError({ message: result.error.message });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    checkout.confirm().then((result) => {
      if (result.type === "error") {
        setError({ message: result.error.message });
      }
      setLoading(false);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-screen">
      {/* Your Information Section */}
      <div>
        <h2 className="text-2xl font-medium mb-1">Your information</h2>
        <p className="mb-4 text-gray-600">
          <span className="underline">Sign in</span> to use your saved
          information.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="mobileNumber" className="block mb-1 font-medium">
              Mobile number
            </label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="(555) 555-5555"
              className="w-full p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block mb-1 font-medium">
                First name
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                className="w-full p-3"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block mb-1 font-medium">
                Last name
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                className="w-full p-3"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email address
            </label>
            <EmailInput />
          </div>
          <div>
            <AddressElement options={{ mode: "billing" }} />
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="getEmails"
                name="getEmails"
                checked={formData.getEmails}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, getEmails: checked })
                }
                className="rounded-full h-4 w-4"
              />
              <label htmlFor="getEmails" className="text-sm font-light">
                Get promotional emails from us
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="getTexts"
                name="getTexts"
                checked={formData.getTexts}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, getTexts: checked })
                }
                className="rounded-full h-4 w-4"
              />
              <label htmlFor="getTexts" className="text-sm font-light">
                Get promotional texts from us
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div>
        <h2 className="text-2xl font-medium my-4">Payment</h2>

        <div className="space-y-4">
          <PaymentElement options={{ layout: "accordion" }} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-base  text-white rounded-md mt-4 flex items-center justify-center"
      >
        Place Order {loading ? "..." : <ChevronRight />}
      </Button>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error.message}
        </div>
      )}
    </form>
  );
};
