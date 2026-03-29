import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster as SonnerToaster } from 'sonner';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';

// Contexts
import { ThemeContextProvider, useThemeContext } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

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

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import './index.css';

const queryClient = new QueryClient();

// MUI Theme wrapper
const MuiThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useThemeContext();
  
  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#6366F1',
      },
      secondary: {
        main: '#8B5CF6',
      },
      success: {
        main: '#10B981',
      },
      warning: {
        main: '#F59E0B',
      },
      error: {
        main: '#EF4444',
      },
      background: {
        default: mode === 'dark' ? '#0A0A0F' : '#F8FAFC',
        paper: mode === 'dark' ? '#1A1A23' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin' | 'staff';
}> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router based on user role
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Admin Routes
  if (user.role === 'admin') {
    return (
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="staff" element={<AdminUsers />} />
        <Route path="reports" element={<AdminOverview />} />
        <Route path="settings" element={
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">System settings coming soon</p>
          </div>
        } />
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    );
  }

  // Staff Routes
  if (user.role === 'staff') {
    return (
      <Routes>
        <Route index element={<StaffDashboard />} />
        <Route path="tasks" element={<StaffDashboard />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Student Routes
  return (
    <Routes>
      <Route index element={<StudentOverview />} />
      <Route path="overview" element={<StudentOverview />} />
      <Route path="rooms" element={<StudentRooms />} />
      <Route path="payments" element={<StudentPayments />} />
      <Route path="tickets" element={<StudentTickets />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
    </Routes>
  );
};

const AppContent: React.FC = () => {
  return (
    <MuiThemeWrapper>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="*" element={<DashboardRouter />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MuiThemeWrapper>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  );
}

export default App;
