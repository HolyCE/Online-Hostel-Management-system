import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
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
  loading: boolean;
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
    console.log('🔧 AuthProvider mounted');
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('📦 Token exists:', !!token);
    console.log('📦 Stored user exists:', !!storedUser);
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 Restored user from storage:', parsedUser.name);
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ Failed to parse user:', e);
        localStorage.removeItem('user');
      }
    } else {
      console.log('⚠️ No stored session found');
    }
    setLoading(false);
    console.log('🏁 AuthProvider ready, user:', user?.name || 'none');
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 login function called with:', email);
    
    try {
      console.log('📡 Sending request to:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('📥 Response received:', response.status, response.data.success);
      
      if (response.data.success) {
        console.log('✅ Login successful, user:', response.data.user.name);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success(`Welcome back, ${response.data.user.name}!`);
        return true;
      }
      console.log('❌ Login failed - server returned success: false');
      toast.error('Login failed');
      return false;
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    console.log('📝 register function called with:', data.email);
    
    try {
      const registerData = { ...data, role: 'student' };
      const response = await axios.post(`${API_URL}/auth/register`, registerData);
      console.log('📥 Register response:', response.status, response.data.success);
      
      if (response.data.success) {
        console.log('✅ Registration successful, user:', response.data.user.name);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Account created successfully!');
        return true;
      }
      console.log('❌ Registration failed');
      toast.error('Registration failed');
      return false;
    } catch (error: any) {
      console.error('💥 Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 logout called');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
