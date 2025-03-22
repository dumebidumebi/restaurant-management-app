import React from "react";
import { useCheckout } from "@stripe/react-stripe-js";
import { Button } from "./ui/button";

interface CheckoutError {
  message: string;
  code?: string;
}

const PayButton = () => {
  const { confirm } = useCheckout();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<CheckoutError | null>(null);

  const handleClick = () => {
    setLoading(true);
    confirm().then((result) => {
      if (result.type === "error") {
        setError({ message: result.error.message });
      }
      setLoading(false);
    });
  };

  return (
    <div>
      <Button disabled={loading} onClick={handleClick}>
        Pay
      </Button>
      {error && (
        <div className="text-red-500 text-sm mt-1">{error.message}</div>
      )}
    </div>
  );
};

export default PayButton;
