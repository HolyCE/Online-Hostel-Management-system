import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import EcommerceMetrics from "../../components/dashboard/EcommerceMetrics";
import RecentOrders from "../../components/dashboard/RecentOrders";
import UserMetaCard from "../../components/dashboard/UserMetaCard";
import UserInfoCard from "../../components/dashboard/UserInfoCard";
import UserAddressCard from "../../components/dashboard/UserAddressCard";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({
    room: null,
    payments: [],
    tickets: [],
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [roomRes, paymentsRes, ticketsRes] = await Promise.all([
        axios.get(`${API_URL}/rooms/student/my-room`, { headers }).catch(() => ({ data: { data: null } })),
        axios.get(`${API_URL}/payments/my-payments`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/tickets/my-tickets`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);

      setStudentData({
        room: roomRes.data.data,
        payments: paymentsRes.data.data || [],
        tickets: ticketsRes.data.data || [],
      });
    } catch (error) {
      console.error("Error fetching student data:", error);
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
            Student Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || "Student"}! Here's your accommodation overview
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-8">
          <EcommerceMetrics isAdmin={false} />
        </div>

        {/* Room Status Card */}
        {studentData.room && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
              Your Room Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Room Number</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {studentData.room.roomNumber}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Block</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {studentData.room.blockName}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Floor</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Floor {studentData.room.floorNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="mb-8">
          <RecentOrders />
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
