import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserMetaCard() {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || 'User Name'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Role: {user?.role || 'student'}</p>
        </div>
      </div>
    </div>
  );
}
