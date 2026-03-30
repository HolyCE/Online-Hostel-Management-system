import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PaystackPaymentProps {
  amount: number;
  email: string;
  studentName: string;
  roomNumber: string;
  roomId: string;
  duration?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  amount,
  email,
  studentName,
  roomNumber,
  roomId,
  duration = 'session',
  onSuccess,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Initialize payment with backend
      const response = await axios.post(
        `${API_URL}/payments/initialize`,
        {
          amount,
          roomId,
          roomNumber,
          studentName,
          duration
        },
        { headers }
      );

      if (response.data.success && response.data.data.authorizationUrl) {
        // Redirect to Paystack checkout page
        window.location.href = response.data.data.authorizationUrl;
      } else {
        toast.error('Failed to initialize payment');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  // Listen for return from Paystack
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference) {
      // Verify payment when returning from Paystack
      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          
          const response = await axios.get(
            `${API_URL}/payments/verify/${reference}`,
            { headers }
          );
          
          if (response.data.success) {
            toast.success('Payment successful! Room allocated.');
            if (onSuccess) onSuccess();
            navigate('/dashboard/payments');
          } else {
            toast.error('Payment verification failed');
          }
        } catch (error) {
          console.error('Verification error:', error);
          toast.error('Payment verification failed');
        }
      };
      
      verifyPayment();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate, onSuccess]);

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Pay ₦${amount.toLocaleString()} with Paystack`}
    </button>
  );
};

export default PaystackPayment;
