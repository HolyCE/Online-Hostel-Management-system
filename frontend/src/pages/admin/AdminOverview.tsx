import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupancyRate: 0,
    pendingTickets: 0
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-black mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Students</p>
          <p className="text-3xl font-bold text-black">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Rooms</p>
          <p className="text-3xl font-bold text-black">{stats.totalRooms}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Occupancy Rate</p>
          <p className="text-3xl font-bold text-black">{stats.occupancyRate}%</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Pending Tickets</p>
          <p className="text-3xl font-bold text-black">{stats.pendingTickets}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
