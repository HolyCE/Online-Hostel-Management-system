import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/ToastProvider';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import DashboardLayout from './components/layout/DashboardLayout';

// Student Pages
import StudentOverview from './pages/student/StudentOverview';
import StudentRooms from './pages/student/StudentRooms';
import StudentPayments from './pages/student/StudentPayments';
import StudentTickets from './pages/student/StudentTickets';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminRooms from './pages/admin/AdminRooms';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminTickets from './pages/admin/AdminTickets';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

import './index.css';

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard/admin/overview" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <ToastProvider />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Redirect */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/dashboard/admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Student Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<StudentOverview />} />
              <Route path="rooms" element={<StudentRooms />} />
              <Route path="payments" element={<StudentPayments />} />
              <Route path="tickets" element={<StudentTickets />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
