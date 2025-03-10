import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';
import { Input } from './ui/input';

const EmailInput = () => {
  const checkout = useCheckout();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState(null);

  const handleBlur = () => {
    checkout.updateEmail(email).then((result) => {
      if (result.error) {
        setError(result.error);
      }
    })
  };

  const handleChange = (e) => {
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
      {error && <div>{error.message}</div>}
    </div>
  );
};

export default EmailInput;