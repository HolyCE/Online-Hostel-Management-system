import React, { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon, BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface MetricsProps {
  isAdmin?: boolean;
}

export default function EcommerceMetrics({ isAdmin = false }: MetricsProps) {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupancyRate: 0,
    revenue: 0,
    studentChange: "+12.5%",
    roomChange: "+5.2%",
    occupancyChange: "+3.1%",
    revenueChange: "+18.7%",
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      if (isAdmin) {
        const response = await axios.get(`${API_URL}/admin/stats`, { headers });
        if (response.data.success) {
          const data = response.data.data;
          setMetrics({
            totalStudents: data.totalStudents || 1250,
            totalRooms: data.totalRooms || 450,
            occupancyRate: data.occupancyRate || 78,
            revenue: data.totalRevenue || 458000,
            studentChange: "+12.5%",
            roomChange: "+5.2%",
            occupancyChange: "+3.1%",
            revenueChange: "+18.7%",
          });
        }
      } else {
        // Student metrics - get personal stats
        const response = await axios.get(`${API_URL}/students/stats`, { headers });
        if (response.data.success) {
          const data = response.data.data;
          setMetrics({
            totalStudents: 1,
            totalRooms: data.hasRoom ? 1 : 0,
            occupancyRate: data.hasRoom ? 100 : 0,
            revenue: data.totalSpent || 0,
            studentChange: "+0%",
            roomChange: data.hasRoom ? "+100%" : "0%",
            occupancyChange: "0%",
            revenueChange: data.totalSpent > 0 ? "+100%" : "0%",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {/* Total Students */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? "Total Students" : "Your Status"}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isAdmin ? metrics.totalStudents.toLocaleString() : metrics.totalStudents === 1 ? "Active" : "Inactive"}
            </h4>
          </div>
          {isAdmin && (
            <Badge color="success">
              <ArrowUpIcon />
              {metrics.studentChange}
            </Badge>
          )}
        </div>
      </div>

      {/* Total Rooms */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? "Total Rooms" : "Your Room"}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isAdmin ? metrics.totalRooms : metrics.totalRooms === 1 ? "Allocated" : "None"}
            </h4>
          </div>
          {isAdmin && (
            <Badge color="success">
              <ArrowUpIcon />
              {metrics.roomChange}
            </Badge>
          )}
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? "Occupancy Rate" : "Room Status"}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isAdmin ? `${metrics.occupancyRate}%` : metrics.occupancyRate === 100 ? "Occupied" : "Available"}
            </h4>
          </div>
          {isAdmin && (
            <Badge color="success">
              <ArrowUpIcon />
              {metrics.occupancyChange}
            </Badge>
          )}
        </div>
      </div>

      {/* Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 15h-3v-2h3v2zm0-4h-3V7h3v6z"/>
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? "Monthly Revenue" : "Total Spent"}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ₦{metrics.revenue.toLocaleString()}
            </h4>
          </div>
          {isAdmin && (
            <Badge color="success">
              <ArrowUpIcon />
              {metrics.revenueChange}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
