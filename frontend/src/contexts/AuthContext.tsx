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
  room?: {
    _id: string;
    roomNumber: string;
    blockName: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface AuthContextType {
  user: User | null;
  notifications: Notification[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  markNotificationRead: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const formattedNotifs = response.data.data.map((notif: any) => ({
          _id: notif._id,
          title: notif.subject || notif.title || 'Notification',
          message: notif.content || notif.message || '',
          type: notif.channel === 'payment' ? 'success' : 
                 notif.priority === 'high' ? 'warning' : 'info',
          read: notif.status === 'read',
          createdAt: notif.createdAt || notif.sentAt || new Date().toISOString(),
          link: notif.link,
        }));
        setNotifications(formattedNotifs);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  const checkToken = useCallback(async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        await fetchNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }, [fetchNotifications]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // If we have stored user data, use it immediately
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      
      if (token) {
        await checkToken(token);
      }
      setLoading(false);
    };
    initAuth();
  }, [checkToken]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const loadingToast = toast.loading('Logging in...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        await fetchNotifications();
        toast.dismiss(loadingToast);
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true };
      }
      toast.dismiss(loadingToast);
      toast.error('Login failed. Please check your credentials.');
      return { success: false, error: 'Invalid credentials' };
    } catch (error: any) {
      console.error('Login error:', error);
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [fetchNotifications]);

  const register = useCallback(async (data: any): Promise<{ success: boolean; error?: string }> => {
    const loadingToast = toast.loading('Creating account...');
    try {
      const registerData = { ...data, role: 'student' };
      const response = await axios.post(`${API_URL}/auth/register`, registerData);
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.dismiss(loadingToast);
        toast.success('Account created successfully! Welcome!');
        return { success: true };
      }
      toast.dismiss(loadingToast);
      toast.error('Registration failed. Please try again.');
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  }, []);

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
      fetchNotifications,
      unreadCount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
