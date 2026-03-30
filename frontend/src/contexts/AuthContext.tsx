import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  matricNumber?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female';
  room?: any;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  notifications: any[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // If we're on login page, don't restore session
      if (window.location.pathname === '/login') {
        setLoading(false);
        return;
      }
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          try {
            const response = await axios.get(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
              setUser(response.data.data);
              localStorage.setItem('user', JSON.stringify(response.data.data));
            } else {
              // Token invalid, redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              window.location.href = '/login';
            }
          } catch (err) {
            console.log('Backend verification failed');
          }
        } catch (err) {
          localStorage.removeItem('user');
        }
      } else if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        // No token, redirect to login
        window.location.href = '/login';
      }
      setLoading(false);
    };
    
    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success(`Welcome back, ${response.data.user.name}!`);
        // Redirect to dashboard after login
        window.location.href = '/dashboard';
        return true;
      }
      toast.error('Login failed');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const registerData = { ...data, role: 'student' };
      const response = await axios.post(`${API_URL}/auth/register`, registerData);
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Account created successfully!');
        window.location.href = '/dashboard';
        return true;
      }
      toast.error('Registration failed');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    // Clear state
    setUser(null);
    setNotifications([]);
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Show success message
    toast.success('Logged out successfully');
    // Force redirect to login page
    window.location.href = '/login';
  }, []);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{ 
      user, 
      notifications, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout, 
      markNotificationRead, 
      unreadCount 
    }}>
      {!loading ? children : (
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your session...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
