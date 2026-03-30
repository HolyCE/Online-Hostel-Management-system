import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 AuthContext.login called');
    console.log('📡 API URL:', API_URL);
    console.log('📧 Email:', email);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', response.data);
      
      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        console.log('✅ Login successful');
        console.log('👤 User:', userData);
        console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
        
        setUser(userData);
        
        if (token) {
          localStorage.setItem('token', token);
          console.log('💾 Token saved to localStorage');
        } else {
          console.error('❌ No token received!');
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 User saved to localStorage');
        
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      } else {
        console.log('❌ Login failed - response.data.success is false');
        toast.error('Login failed');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.error('Error response:', error.response?.data);
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
