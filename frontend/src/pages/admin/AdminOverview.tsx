import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BedDouble, DollarSign, Ticket } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    pendingTickets: 0,
    availableRooms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/admin/stats`, { headers });
      if (response.data.success) {
        setStats(response.data.data.overview);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of hostel management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.totalStudents}</span>
          </div>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BedDouble className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.totalRooms}</span>
          </div>
          <p className="text-sm text-gray-600">Total Rooms</p>
          <p className="text-xs text-gray-500 mt-1">{stats.availableRooms} available</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.occupancyRate}%</span>
          </div>
          <p className="text-sm text-gray-600">Occupancy Rate</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">₦{(stats.monthlyRevenue / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-sm text-gray-600">Monthly Revenue</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Ticket className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.pendingTickets}</span>
          </div>
          <p className="text-sm text-gray-600">Pending Tickets</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Welcome to Admin Dashboard</h2>
        <p className="text-gray-600">Use the sidebar to manage rooms, users, payments, and tickets.</p>
      </div>
    </div>
  );
};

export default AdminOverview;
