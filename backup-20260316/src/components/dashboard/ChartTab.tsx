import React from "react";

export default function ChartTab() {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
      <button className="px-3 py-1 text-sm font-medium text-white bg-brand-500 rounded-md">
        Monthly
      </button>
      <button className="px-3 py-1 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
        Weekly
      </button>
      <button className="px-3 py-1 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
        Daily
      </button>
    </div>
  );
}
