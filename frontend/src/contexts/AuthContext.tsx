import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  matricNumber?: string;
  phoneNumber?: string;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔧 Restoring session...');
      console.log('📦 Token exists:', !!token);
      console.log('📦 Stored user exists:', !!storedUser);
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('👤 Restored user:', parsedUser.name);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse user:', e);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        console.log('✅ Login successful, setting user:', userData.name);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      }
      toast.error('Login failed');
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Account created successfully!');
        return true;
      }
      toast.error('Registration failed');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    window.location.href = '/login';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
