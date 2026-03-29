import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import './App.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';

// New Feature Components
import RoomBrowser from './components/student/RoomBrowser';
import RoomDetails from './components/student/RoomDetails';
import ComplaintForm from './components/student/ComplaintForm';

import RoomManagement from './components/admin/RoomManagement';
import UserManagement from './components/admin/UserManagement';
import TicketManagement from './components/admin/TicketManagement';
import PaymentManagement from './components/admin/PaymentManagement';

import StaffDashboard from './components/staff/StaffDashboard';

// Loading Component
const LoadingScreen = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress sx={{ color: '#0a2351' }} />
  </Box>
);

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (staffOnly && user?.role !== 'staff') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <Navbar user={user} onLogout={logout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route path="/rooms" element={<ProtectedRoute><RoomBrowser /></ProtectedRoute>} />
          <Route path="/rooms/:id" element={<ProtectedRoute><RoomDetails /></ProtectedRoute>} />
          <Route path="/complaints/new" element={<ProtectedRoute><ComplaintForm /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/rooms" element={<ProtectedRoute adminOnly><RoomManagement /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/tickets" element={<ProtectedRoute adminOnly><TicketManagement /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute adminOnly><PaymentManagement /></ProtectedRoute>} />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute staffOnly>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;