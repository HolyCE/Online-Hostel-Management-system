import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_7fab5c29d364e15f1bdb4c9d3e4b0027758440d9';

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

  useEffect(() => {
    console.log('🔍 Paystack Payment Component Mounted');
    console.log('  Amount:', amount);
    console.log('  Email:', email);
    console.log('  Room:', roomNumber);
    console.log('  Key exists:', !!PAYSTACK_KEY);
  }, [amount, email, roomNumber]);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      if (!email || !email.includes('@')) {
        throw new Error('Invalid email address');
      }
      
      console.log('📡 Calling backend to initialize payment...');
      
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

      console.log('✅ Backend response:', response.data);

      if (response.data.success && response.data.data.reference) {
        const reference = response.data.data.reference;
        const amountInKobo = Math.round(amount * 100);
        
        console.log('💰 Paystack Setup:');
        console.log('  Reference:', reference);
        console.log('  Amount (₦):', amount);
        console.log('  Amount (kobo):', amountInKobo);
        console.log('  Email:', email);
        
        if (typeof window.PaystackPop === 'undefined') {
          throw new Error('Paystack script not loaded. Please refresh the page.');
        }

        // Define callback functions first
        const callback = (responseData: any) => {
          console.log('🎯 Paystack callback received:', responseData);
          if (responseData.status === 'success') {
            verifyPayment(responseData.reference);
          } else {
            toast.error('Payment was not completed');
            setLoading(false);
          }
        };

        const closeCallback = () => {
          console.log('🚪 Payment modal closed');
          setLoading(false);
          if (onClose) onClose();
        };

        // Setup Paystack
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_KEY,
          email: email,
          amount: amountInKobo,
          currency: 'NGN',
          ref: reference,
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
        throw new Error(response.data.message || 'Payment initialization failed');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      const errorMsg = err.message || 'Failed to initialize payment';
      setError(errorMsg);
      toast.error(errorMsg);
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
        toast.success('Payment successful! Room allocated.');
        if (onSuccess) onSuccess();
        navigate('/dashboard/payments');
      } else {
        toast.error('Payment verification failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      toast.error('Payment verification failed');
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
        {loading ? 'Processing...' : `Pay ₦${amount.toLocaleString()} with Paystack`}
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
