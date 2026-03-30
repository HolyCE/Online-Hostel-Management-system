import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Download, Plus, CheckCircle, XCircle, Clock, Eye, Home, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PaystackPayment from '../../components/common/PaystackPayment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Payment {
  _id: string;
  reference: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  paymentDate: string;
  paymentMethod: string;
  sessionYear: string;
  semester: string;
  paidFor: string;
  createdAt: string;
}

const StudentPayments = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPaid: 0,
    successfulPayments: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    // Check URL for payment reference (return from Paystack)
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    
    if (reference) {
      // Verify payment immediately
      verifyPaymentOnReturn(reference);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check for selected room from navigation state
    if (location.state && (location.state as any).selectedRoom) {
      const room = (location.state as any).selectedRoom;
      setSelectedRoom(room);
      setShowPaymentForm(true);
      toast.success(`Room ${room.roomNumber} selected! Ready to pay.`);
    }
    
    // Also check localStorage
    const storedRoom = localStorage.getItem('selectedRoom');
    if (storedRoom && !selectedRoom) {
      const room = JSON.parse(storedRoom);
      setSelectedRoom(room);
      setShowPaymentForm(true);
      toast.success(`Room ${room.roomNumber} selected! Ready to pay.`);
      localStorage.removeItem('selectedRoom');
    }
    
    fetchPayments();
  }, []);

  const verifyPaymentOnReturn = async (reference: string) => {
    const loadingToast = toast.loading('Verifying payment...');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(`${API_URL}/payments/verify/${reference}`, { headers });
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success('🎉 Payment successful! Your room has been allocated.');
        fetchPayments();
        navigate('/dashboard');
      } else {
        toast.dismiss(loadingToast);
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.dismiss(loadingToast);
      toast.error('Payment verification failed. Please contact support.');
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/payments/my-payments`, { headers });
      const data = response.data.data || [];
      setPayments(data);
      
      const successful = data.filter((p: Payment) => p.status === 'success');
      const pending = data.filter((p: Payment) => p.status === 'pending');
      const totalPaid = successful.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      
      setStats({
        totalPaid,
        successfulPayments: successful.length,
        pendingPayments: pending.length
      });
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! Your room has been allocated.');
    setShowPaymentForm(false);
    setSelectedRoom(null);
    fetchPayments();
    navigate('/dashboard');
  };

  // ... rest of the component remains the same
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Payments</h1>
          <p className="text-gray-600">{payments.length} payment records</p>
        </div>
        <button 
          onClick={() => setShowPaymentForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Make Payment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Paid</p>
          <p className="text-3xl font-bold text-black mb-2">₦{stats.totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Lifetime payments</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Successful</p>
          <p className="text-3xl font-bold text-black mb-2">{stats.successfulPayments}</p>
          <p className="text-xs text-gray-500">Completed transactions</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-black mb-2">{stats.pendingPayments}</p>
          <p className="text-xs text-gray-500">Awaiting confirmation</p>
        </div>
      </div>

      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Make Payment</h2>
                <button 
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedRoom(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {!selectedRoom ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Please select a room from the Rooms page first</p>
                  <button 
                    onClick={() => navigate('/dashboard/rooms')}
                    className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                  >
                    Browse Rooms
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-black mb-3">Selected Room</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Number:</span>
                        <span className="font-medium text-black">{selectedRoom.roomNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Block:</span>
                        <span className="font-medium text-black">{selectedRoom.blockName}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-600 font-semibold">Amount:</span>
                        <span className="text-xl font-bold text-black">₦{selectedRoom.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <PaystackPayment
                    amount={selectedRoom.price}
                    email={user?.email || ''}
                    studentName={user?.name || ''}
                    roomNumber={selectedRoom.roomNumber}
                    roomId={selectedRoom.id}
                    duration={selectedRoom.duration || 'session'}
                    onSuccess={handlePaymentSuccess}
                    onClose={() => setShowPaymentForm(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Session</th>
                <th className="px-6 py-4"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-black">{payment.reference?.slice(0, 12)}...</td>
                  <td className="px-6 py-4 text-sm font-semibold text-black">₦{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate || payment.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{payment.paymentMethod || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.sessionYear} - {payment.semester}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentPayments;
