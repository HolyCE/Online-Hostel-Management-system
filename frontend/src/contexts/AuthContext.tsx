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
  channel?: string;
}

interface AuthContextType {
  user: User | null;
  notifications: Notification[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
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

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Transform backend notification format to frontend format
        const formattedNotifs = response.data.data.map((notif: any) => ({
          _id: notif._id,
          title: notif.subject || notif.title || 'Notification',
          message: notif.content || notif.message || '',
          type: notif.channel === 'payment' ? 'success' : 
                 notif.priority === 'high' ? 'warning' : 
                 notif.channel === 'ticket' ? 'info' : 'info',
          read: notif.status === 'read',
          createdAt: notif.createdAt || notif.sentAt || new Date().toISOString(),
          link: notif.link,
          channel: notif.channel
        }));
        setNotifications(formattedNotifs);
        
        // Show toast for new unread notifications (only show a few)
        const unread = formattedNotifs.filter((n: Notification) => !n.read);
        const newUnread = unread.filter(u => {
          // Check if this notification is new (within last minute)
          const notifTime = new Date(u.createdAt).getTime();
          const now = Date.now();
          return (now - notifTime) < 60000; // Last minute
        });
        
        if (newUnread.length > 0 && newUnread.length <= 3) {
          newUnread.forEach(notif => {
            toast(notif.message, {
              icon: notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : '🔔',
              duration: 5000,
              style: {
                background: '#f3f4f6',
                color: '#000000',
              },
            });
          });
        } else if (newUnread.length > 3) {
          toast(`You have ${newUnread.length} new notifications`, {
            icon: '🔔',
            duration: 5000,
            style: {
              background: '#f3f4f6',
              color: '#000000',
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        // Silent fail - user might not be logged in
      }
    }
  }, []);

  // Check token validity
  const checkToken = useCallback(async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUser(response.data.data);
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
      if (token) {
        const isValid = await checkToken(token);
        if (!isValid) {
          localStorage.removeItem('token');
          setUser(null);
          toast.error('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };
    initAuth();
    
    // Set up periodic notification refresh (every 30 seconds)
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [checkToken, fetchNotifications]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const loadingToast = toast.loading('Logging in...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        await fetchNotifications();
        toast.dismiss(loadingToast);
        toast.success(`Welcome back, ${response.data.user.name}!`);
        return true;
      }
      toast.dismiss(loadingToast);
      toast.error('Login failed. Please check your credentials.');
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      return false;
    }
  }, [fetchNotifications]);

  const register = useCallback(async (data: any): Promise<boolean> => {
    const loadingToast = toast.loading('Creating account...');
    try {
      const registerData = { ...data, role: 'student' };
      const response = await axios.post(`${API_URL}/auth/register`, registerData);
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        toast.dismiss(loadingToast);
        toast.success('Account created successfully! Welcome!');
        return true;
      }
      toast.dismiss(loadingToast);
      toast.error('Registration failed. Please try again.');
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('token');
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
