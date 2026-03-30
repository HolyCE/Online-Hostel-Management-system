import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Hardcoded Paystack test public key for testing
const PAYSTACK_KEY = 'pk_test_7fab5c29d364e15f1bdb4c9d3e4b0027758440d9';

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
    console.log('=== Paystack Payment Debug Info ===');
    console.log('Amount (naira):', amount);
    console.log('Amount (kobo):', amount * 100);
    console.log('Email:', email);
    console.log('Room:', roomNumber);
    console.log('Student:', studentName);
    console.log('===================================');
  }, [amount, email, roomNumber, studentName]);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('Calling backend to initialize payment...');
      console.log('Payload:', { amount, roomId, roomNumber, studentName, duration });
      
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

      console.log('Backend response:', response.data);

      if (response.data.success && response.data.data.reference) {
        const publicKey = PAYSTACK_KEY;
        const reference = response.data.data.reference;
        const amountInKobo = Math.round(amount * 100);
        
        console.log('=== Paystack Setup ===');
        console.log('Public Key:', publicKey);
        console.log('Reference:', reference);
        console.log('Amount in kobo:', amountInKobo);
        console.log('Email:', email);
        console.log('=====================');
        
        if (!publicKey) {
          const errorMsg = 'Paystack public key is missing.';
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
        
        if (typeof window.PaystackPop === 'undefined') {
          const errorMsg = 'Paystack script not loaded. Please refresh the page.';
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        const callback = async (responseData: any) => {
          console.log('Paystack callback received:', responseData);
          if (responseData.status === 'success') {
            await verifyPayment(responseData.reference);
          } else {
            console.log('Payment was not successful:', responseData);
            setError('Payment was not completed successfully');
            toast.error('Payment was not completed successfully');
            setLoading(false);
          }
        };

        const closeCallback = () => {
          console.log('Payment modal closed by user');
          setLoading(false);
          if (onClose) onClose();
        };

        try {
          const handler = window.PaystackPop.setup({
            key: publicKey,
            email: email,
            amount: amountInKobo,
            currency: 'NGN',
            ref: reference,
            metadata: {
              student_name: studentName,
              room_number: roomNumber,
              duration: duration,
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
                },
                {
                  display_name: "Duration",
                  variable_name: "duration",
                  value: duration
                }
              ]
            },
            callback: callback,
            onClose: closeCallback
          });
          
          handler.openIframe();
        } catch (paystackError: any) {
          console.error('Paystack setup error:', paystackError);
          setError(`Paystack error: ${paystackError.message || 'Failed to open payment window'}`);
          toast.error('Failed to open payment window');
          setLoading(false);
        }
      } else {
        setError(response.data.message || 'Failed to initialize payment. Please try again.');
        toast.error(response.data.message || 'Failed to initialize payment. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to initialize payment. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('Verifying payment with reference:', reference);
      
      const response = await axios.get(
        `${API_URL}/payments/verify/${reference}`,
        { headers }
      );

      console.log('Payment verification response:', response.data);

      if (response.data.success) {
        console.log('✅ Payment verified successfully!');
        if (onSuccess) onSuccess();
        toast.success('Payment successful! Your room has been allocated.');
        navigate('/dashboard/payments');
      } else {
        console.log('❌ Payment verification failed:', response.data.message);
        toast.error(`Payment verification failed: ${response.data.message || 'Please contact support'}`);
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      toast.error(`Payment verification failed: ${err.response?.data?.message || err.message}`);
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
