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

declare global {
  interface Window {
    PaystackPop: any;
  }
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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const initializePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(
        `${API_URL}/payments/initialize`,
        {
          amount: amount,
          roomId,
          roomNumber,
          studentName,
          duration
        },
        { headers }
      );

      if (response.data.success && response.data.data.reference) {
        const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        
        if (!publicKey) {
          setError('Payment configuration error. Please contact support.');
          setLoading(false);
          return;
        }
        
        if (!window.PaystackPop) {
          setError('Paystack is not loaded. Please refresh the page.');
          setLoading(false);
          return;
        }

        const callback = (responseData: any) => {
          if (responseData.status === 'success') {
            verifyPayment(responseData.reference);
          }
        };

        const closeCallback = () => {
          setLoading(false);
          if (onClose) onClose();
        };

        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: email,
          amount: amount * 100, // Convert to kobo
          currency: 'NGN',
          ref: response.data.data.reference,
          metadata: {
            student_name: studentName,
            room_number: roomNumber,
            duration: duration
          },
          callback: callback,
          onClose: closeCallback
        });
        
        handler.openIframe();
      } else {
        setError('Failed to initialize payment. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_URL}/payments/verify/${reference}`,
        { headers }
      );

      if (response.data.success) {
        toast.success('Payment successful! Your room has been allocated.');
        if (onSuccess) onSuccess();
        navigate('/dashboard/payments');
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={initializePayment}
        disabled={loading}
        className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Initializing...
          </div>
        ) : (
          `Pay ₦${amount.toLocaleString()} with Paystack`
        )}
      </button>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PaystackPayment;
