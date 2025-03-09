import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';
import { Button } from './ui/button';

const PayButton = () => {
  const {confirm} = useCheckout();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleClick = () => {
    setLoading(true);
    confirm().then((result) => {
      if (result.type === 'error') {
        setError(result.error)
      }
      setLoading(false);
    })
  };

  return (
    <div>
      <Button disabled={loading} onClick={handleClick}>
        Pay
      </Button>
      {error && <div>{error.message}</div>}
    </div>
  )
};

export default PayButton;