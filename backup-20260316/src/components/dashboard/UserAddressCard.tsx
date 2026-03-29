import React from 'react';

export default function UserAddressCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address</h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Nigeria</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">City/State</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Lagos</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Postal Code</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">100001</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">123 University Road, Yaba</p>
        </div>
      </div>
    </div>
  );
}
