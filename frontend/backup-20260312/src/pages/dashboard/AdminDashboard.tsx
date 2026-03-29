import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import EcommerceMetrics from "../../components/dashboard/EcommerceMetrics";
import MonthlySalesChart from "../../components/dashboard/MonthlySalesChart";
import StatisticsChart from "../../components/dashboard/StatisticsChart";
import MonthlyTarget from "../../components/dashboard/MonthlyTarget";
import DemographicCard from "../../components/dashboard/DemographicCard";
import RecentOrders from "../../components/dashboard/RecentOrders";
import BasicTableOne from "../../components/dashboard/BasicTableOne";
import UserMetaCard from "../../components/dashboard/UserMetaCard";
import UserInfoCard from "../../components/dashboard/UserInfoCard";
import UserAddressCard from "../../components/dashboard/UserAddressCard";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupancyRate: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_URL}/admin/stats`, { headers });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || "Admin"}! Here's your hostel overview
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-8">
          <EcommerceMetrics isAdmin={true} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <MonthlySalesChart />
          <StatisticsChart />
        </div>

        {/* Monthly Target & Demographic */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <MonthlyTarget />
          <DemographicCard />
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <RecentOrders />
        </div>

        {/* Room Distribution Table */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Room Distribution
          </h2>
          <BasicTableOne />
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
