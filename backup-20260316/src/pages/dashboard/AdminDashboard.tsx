import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
        Admin Dashboard
      </h1>
      <p className="text-gray-800 dark:text-gray-200">
        Welcome back, {user?.name || 'Admin'}!
      </p>
    </div>
  );
}