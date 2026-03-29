import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import AppSidebar from "./components/layout/AppSidebar";
import Header from "./components/layout/Header";
import "./App.css";

// Pages
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Student Components
import RoomBrowser from "./components/student/RoomBrowser";
import RoomDetails from "./components/student/RoomDetails";
import ComplaintForm from "./components/student/ComplaintForm";

// Admin Components
import RoomManagement from "./components/admin/RoomManagement";
import UserManagement from "./components/admin/UserManagement";
import TicketManagement from "./components/admin/TicketManagement";
import PaymentManagement from "./components/admin/PaymentManagement";

// Staff Components
import StaffDashboard from "./components/staff/StaffDashboard";

// Loading Component
const LoadingScreen = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress sx={{ color: '#0a2351' }} />
  </Box>
);

// Protected Route Component with TypeScript
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  staffOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }: ProtectedRouteProps) => {
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

  return <>{children}</>;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-0"}`}>
        <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />

            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <RoomBrowser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/:id"
              element={
                <ProtectedRoute>
                  <RoomDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/new"
              element={
                <ProtectedRoute>
                  <ComplaintForm />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute adminOnly>
                  <RoomManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute adminOnly>
                  <TicketManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute adminOnly>
                  <PaymentManagement />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute staffOnly>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
