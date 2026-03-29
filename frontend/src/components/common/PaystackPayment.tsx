import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PaystackPaymentProps {
  amount: number;
  email: string;
  studentName: string;
  roomNumber: string;
  roomId: string;
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
          amount,
          roomId,
          roomNumber,
          studentName
        },
        { headers }
      );

      if (response.data.success && response.data.data.reference) {
        // Check if Paystack script is loaded
        if (!window.PaystackPop) {
          setError('Paystack is not loaded. Please refresh the page and try again.');
          setLoading(false);
          return;
        }

        // Define callback functions
        const callback = (responseData: any) => {
          console.log('Payment callback:', responseData);
          if (responseData.status === 'success') {
            verifyPayment(responseData.reference);
          }
        };

        const closeCallback = () => {
          console.log('Payment modal closed');
          setLoading(false);
          if (onClose) onClose();
        };

        // Open Paystack popup with correct configuration
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: email,
          amount: amount * 100, // Paystack expects amount in kobo
          currency: 'NGN',
          ref: response.data.data.reference,
          metadata: {
            student_name: studentName,
            room_number: roomNumber,
            custom_fields: [
              {
                display_name: "Student Name",
                variable_name: "student_name",
                value: studentName
              },
              {
                display_name: "Room Number",
                variable_name: "room_number",
                value: roomNumber
              }
            ]
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
        if (onSuccess) onSuccess();
        alert('Payment successful! Your room has been allocated.');
        navigate('/dashboard/payments');
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={initializePayment}
        disabled={loading}
        className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
