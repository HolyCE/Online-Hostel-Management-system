import React from 'react';
import { PaystackButton } from 'react-paystack';

const PaystackPayment = ({ email, amount, metadata, onSuccess, onClose }) => {
  const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    return (
      <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffeeee' }}>
        Paystack public key not configured. Please add REACT_APP_PAYSTACK_PUBLIC_KEY to your .env file
      </div>
    );
  }

  const componentProps = {
    email,
    amount: amount * 100,
    metadata,
    publicKey,
    text: `Pay ₦${amount}`,
    onSuccess: (reference) => {
      console.log('Payment successful:', reference);
      onSuccess?.(reference);
    },
    onClose: () => {
      console.log('Payment closed');
      onClose?.();
    },
  };

  return (
    <PaystackButton
      {...componentProps}
      style={{
        backgroundColor: '#0a2351',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '100%',
      }}
    />
  );
};

export default PaystackPayment;
