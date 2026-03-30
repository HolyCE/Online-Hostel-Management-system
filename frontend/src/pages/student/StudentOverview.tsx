import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BedDouble, CreditCard, Ticket, Clock, Home, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentOverview = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [roomRes, paymentsRes, ticketsRes] = await Promise.all([
        axios.get(`${API_URL}/rooms/student/my-room`, { headers }).catch(() => ({ data: { data: null } })),
        axios.get(`${API_URL}/payments/my-payments`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/tickets/my-tickets`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);

      setRoom(roomRes.data.data);
      setPayments(paymentsRes.data.data || []);
      setTickets(ticketsRes.data.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingTickets = tickets.filter((t: any) => t.status === 'pending').length;
  const totalSpent = payments.filter((p: any) => p.status === 'success').reduce((sum: number, p: any) => sum + p.amount, 0);

  const stats = [
    { 
      label: 'Room Status', 
      value: room ? `Room ${room.roomNumber}` : 'Not Allocated', 
      icon: BedDouble, 
      link: '/dashboard/rooms'
    },
    { 
      label: 'Total Spent', 
      value: `₦${totalSpent.toLocaleString() || '0'}`, 
      icon: CreditCard, 
      link: '/dashboard/payments'
    },
    { 
      label: 'Pending Tickets', 
      value: String(pendingTickets), 
      icon: Ticket, 
      link: '/dashboard/tickets'
    },
    { 
      label: 'Days Remaining', 
      value: '186', 
      icon: Clock, 
      link: '#'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your accommodation
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link} className="block">
              <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-black" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-black">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm text-black">
                  View details <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {room ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-black" />
            <h2 className="text-lg font-semibold text-black">Your Room Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Room Number</p>
              <p className="text-lg font-semibold text-black font-mono">{room.roomNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Block</p>
              <p className="text-lg font-semibold text-black">{room.blockName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Floor</p>
              <p className="text-lg font-semibold text-black">Floor {room.floorNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <p className="text-lg font-semibold text-black">₦{room.price?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center border border-gray-200">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-black mb-2">No Room Allocated Yet</h3>
          <p className="text-gray-500 mb-4">
            You haven't been allocated a room. Browse available rooms and apply now.
          </p>
          <Link
            to="/dashboard/rooms"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Browse Rooms <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Recent Payments</h3>
            <Link to="/dashboard/payments" className="text-sm text-black hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payment records yet</p>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 3).map((payment: any) => (
                <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-black">₦{payment.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    payment.status === 'success' ? 'bg-gray-200 text-black' :
                    payment.status === 'pending' ? 'bg-gray-300 text-black' :
                    'bg-gray-400 text-white'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Recent Tickets</h3>
            <Link to="/dashboard/tickets" className="text-sm text-black hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tickets submitted yet</p>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 3).map((ticket: any) => (
                <div key={ticket._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-black">{ticket.title}</p>
                    <p className="text-xs text-gray-500">{ticket.category}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    ticket.status === 'resolved' ? 'bg-gray-200 text-black' :
                    ticket.status === 'in-progress' ? 'bg-gray-300 text-black' :
                    'bg-gray-400 text-white'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
