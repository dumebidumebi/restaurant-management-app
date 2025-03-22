import React from "react";
import { useCheckout } from "@stripe/react-stripe-js";
import { Input } from "./ui/input";

interface CheckoutError {
  message: string;
  code?: string;
}

const EmailInput = () => {
  const checkout = useCheckout();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<CheckoutError | null>(null);

  const handleBlur = () => {
    checkout.updateEmail(email).then((result) => {
      if (result.type === "error") {
        setError({ message: result.error.message });
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setEmail(e.target.value);
  };
  return (
    <div>
      <Input
        type="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && (
        <div className="text-red-500 text-sm mt-1">{error.message}</div>
      )}
    </div>
  );
};

export default EmailInput;
