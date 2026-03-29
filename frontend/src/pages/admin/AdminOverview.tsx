import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BedDouble, TrendingUp, DollarSign, Ticket, Home, 
  ArrowUpRight, Calendar, CheckCircle, Clock, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface DashboardStats {
  overview: {
    totalStudents: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: string;
    totalPayments: number;
    pendingPayments: number;
    totalTickets: number;
    pendingTickets: number;
    waitingList: number;
  };
  revenue: Array<{
    _id: { year: number; month: number };
    total: number;
    count: number;
  }>;
  tickets: Array<{
    _id: string;
    count: number;
    resolved: number;
  }>;
  demographics: {
    gender: Array<{ _id: string; count: number }>;
  };
  recentActivities: Array<{
    _id: string;
    user: { name: string; email: string };
    action: string;
    details: string;
    timestamp: string;
  }>;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRevenueData = () => {
    if (!stats?.revenue) return [];
    return stats.revenue.map(item => ({
      month: `${item._id.month}/${item._id.year}`,
      revenue: item.total,
      count: item.count
    })).reverse();
  };

  const getTicketData = () => {
    if (!stats?.tickets) return [];
    return stats.tickets.map(item => ({
      category: item._id,
      total: item.count,
      resolved: item.resolved
    }));
  };

  const getGenderData = () => {
    if (!stats?.demographics?.gender) return [];
    return stats.demographics.gender.map(item => ({
      name: item._id || 'Not specified',
      value: item.count,
      color: item._id === 'male' ? '#000000' : item._id === 'female' ? '#666666' : '#999999'
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <UserCheck className="w-4 h-4 text-gray-600" />;
    if (action.includes('PAYMENT')) return <DollarSign className="w-4 h-4 text-gray-600" />;
    if (action.includes('ROOM')) return <BedDouble className="w-4 h-4 text-gray-600" />;
    if (action.includes('TICKET')) return <Ticket className="w-4 h-4 text-gray-600" />;
    return <Clock className="w-4 h-4 text-gray-600" />;
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

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Failed to load dashboard data</p>
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
            <span className="text-2xl font-bold text-black">{stats.overview.totalStudents}</span>
          </div>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BedDouble className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.overview.totalRooms}</span>
          </div>
          <p className="text-sm text-gray-600">Total Rooms</p>
          <p className="text-xs text-gray-500 mt-1">{stats.overview.occupiedRooms} occupied / {stats.overview.availableRooms} available</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.overview.occupancyRate}</span>
          </div>
          <p className="text-sm text-gray-600">Occupancy Rate</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.overview.totalPayments}</span>
          </div>
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-xs text-gray-500 mt-1">{stats.overview.pendingPayments} pending</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Ticket className="w-8 h-8 text-gray-700" />
            <span className="text-2xl font-bold text-black">{stats.overview.pendingTickets}</span>
          </div>
          <p className="text-sm text-gray-600">Pending Tickets</p>
          <p className="text-xs text-gray-500 mt-1">Total: {stats.overview.totalTickets}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(value) => `₦${(value/1000000).toFixed(1)}M`} />
              <Tooltip 
                formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} dot={{ fill: '#000000' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-4">Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getGenderData()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {getGenderData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {getTicketData().length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">Tickets by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTicketData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} />
              <Bar dataKey="total" fill="#000000" name="Total Tickets" />
              <Bar dataKey="resolved" fill="#9CA3AF" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Recent Activities</h2>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentActivities.map(activity => (
            <div key={activity._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    {activity.user?.name || 'System'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.details}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {activity.action.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
          {stats.recentActivities.length === 0 && (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
