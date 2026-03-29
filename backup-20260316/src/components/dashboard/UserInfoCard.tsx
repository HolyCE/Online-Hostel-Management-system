import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserInfoCard() {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">+234 801 234 5678</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">STU001</p>
        </div>
      </div>
    </div>
  );
}
