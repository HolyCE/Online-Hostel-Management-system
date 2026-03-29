import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Mail, Globe, Lock, User, Save, RefreshCw, Eye, EyeOff, Building2, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SystemSettings {
  general: {
    systemName: string;
    systemEmail: string;
    supportPhone: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    currencySymbol: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    paymentAlerts: boolean;
    ticketAlerts: boolean;
    roomAlerts: boolean;
    reminderDays: number;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiryDays: number;
    maxLoginAttempts: number;
  };
  academic: {
    currentSession: string;
    currentSemester: string;
    semesterStartDate: string;
    semesterEndDate: string;
    registrationDeadline: string;
    paymentDeadline: string;
  };
  halls: Array<{
    _id: string;
    name: string;
    gender: string;
    isActive: boolean;
  }>;
}

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: 'HostelHub',
      systemEmail: 'admin@hostelhub.com',
      supportPhone: '+2348012345678',
      timezone: 'Africa/Lagos',
      dateFormat: 'DD/MM/YYYY',
      currency: 'NGN',
      currencySymbol: '₦'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      paymentAlerts: true,
      ticketAlerts: true,
      roomAlerts: true,
      reminderDays: 3
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiryDays: 90,
      maxLoginAttempts: 5
    },
    academic: {
      currentSession: '2024/2025',
      currentSemester: 'second',
      semesterStartDate: '2024-01-15',
      semesterEndDate: '2024-06-30',
      registrationDeadline: '2024-02-28',
      paymentDeadline: '2024-03-15'
    },
    halls: []
  });

  useEffect(() => {
    fetchSettings();
    fetchHalls();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/admin/settings`, { headers });
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          general: response.data.data.general || prev.general,
          notifications: response.data.data.notifications || prev.notifications,
          security: response.data.data.security || prev.security,
          academic: {
            ...prev.academic,
            ...response.data.data.academic,
            semesterStartDate: response.data.data.academic?.semesterStartDate?.split('T')[0] || prev.academic.semesterStartDate,
            semesterEndDate: response.data.data.academic?.semesterEndDate?.split('T')[0] || prev.academic.semesterEndDate,
            registrationDeadline: response.data.data.academic?.registrationDeadline?.split('T')[0] || prev.academic.registrationDeadline,
            paymentDeadline: response.data.data.academic?.paymentDeadline?.split('T')[0] || prev.academic.paymentDeadline
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchHalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/halls`, { headers });
      if (response.data.success) {
        setSettings(prev => ({ ...prev, halls: response.data.data }));
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    const loadingToast = toast.loading('Saving settings...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(`${API_URL}/admin/settings`, {
        general: settings.general,
        notifications: settings.notifications,
        security: settings.security,
        academic: settings.academic
      }, { headers });
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    const loadingToast = toast.loading('Changing password...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, { headers });
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const resetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      return;
    }
    
    const loadingToast = toast.loading('Resetting settings...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(`${API_URL}/admin/settings/reset`, {}, { headers });
      
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          general: response.data.data.general,
          notifications: response.data.data.notifications,
          security: response.data.data.security,
          academic: {
            ...response.data.data.academic,
            semesterStartDate: response.data.data.academic?.semesterStartDate?.split('T')[0] || prev.academic.semesterStartDate,
            semesterEndDate: response.data.data.academic?.semesterEndDate?.split('T')[0] || prev.academic.semesterEndDate,
            registrationDeadline: response.data.data.academic?.registrationDeadline?.split('T')[0] || prev.academic.registrationDeadline,
            paymentDeadline: response.data.data.academic?.paymentDeadline?.split('T')[0] || prev.academic.paymentDeadline
          }
        }));
        toast.dismiss(loadingToast);
        toast.success('Settings reset to default');
      }
    } catch (error: any) {
      console.error('Error resetting settings:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to reset settings');
    }
  };

  const toggleHallStatus = async (hallId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.put(`${API_URL}/halls/${hallId}`, 
        { isActive: !currentStatus },
        { headers }
      );
      
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          halls: prev.halls.map(hall =>
            hall._id === hallId ? { ...hall, isActive: !currentStatus } : hall
          )
        }));
        toast.success(`Hall ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating hall:', error);
      toast.error(error.response?.data?.message || 'Failed to update hall status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'academic', label: 'Academic', icon: Calendar },
    { id: 'halls', label: 'Halls', icon: Building2 },
    { id: 'password', label: 'Password', icon: Lock }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
        <p className="text-gray-600">Manage system configuration and preferences</p>
      </motion.div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-black mb-4">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                  <input
                    type="text"
                    value={settings.general.systemName}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, systemName: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Email</label>
                  <input
                    type="email"
                    value={settings.general.systemEmail}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, systemEmail: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                  <input
                    type="tel"
                    value={settings.general.supportPhone}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, supportPhone: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Africa/Cairo">Africa/Cairo (CAT)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, dateFormat: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, currency: e.target.value, currencySymbol: e.target.value === 'NGN' ? '₦' : '$' }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-black mb-4">Notification Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailNotifications: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get real-time updates in the app</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, pushNotifications: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">Payment Alerts</p>
                    <p className="text-sm text-gray-500">Notify when payments are made or pending</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.paymentAlerts}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, paymentAlerts: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">Ticket Alerts</p>
                    <p className="text-sm text-gray-500">Notify when tickets are created or updated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.ticketAlerts}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, ticketAlerts: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">Room Alerts</p>
                    <p className="text-sm text-gray-500">Notify when rooms are allocated or updated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.roomAlerts}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, roomAlerts: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Reminder Days</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.notifications.reminderDays}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, reminderDays: parseInt(e.target.value) }
                    }))}
                    className="w-full md:w-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days before payment deadline to send reminders</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-black mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorAuth: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.security.sessionTimeout}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    className="w-full md:w-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={settings.security.passwordExpiryDays}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, passwordExpiryDays: parseInt(e.target.value) }
                    }))}
                    className="w-full md:w-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                    }))}
                    className="w-full md:w-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Academic Settings */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-black mb-4">Academic Calendar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Session</label>
                  <select
                    value={settings.academic.currentSession}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      academic: { ...prev.academic, currentSession: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option>2023/2024</option>
                    <option>2024/2025</option>
                    <option>2025/2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
                  <select
                    value={settings.academic.currentSemester}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      academic: { ...prev.academic, currentSemester: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="first">First Semester</option>
                    <option value="second">Second Semester</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester Start Date</label>
                  <input
                    type="date"
                    value={settings.academic.semesterStartDate}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      academic: { ...prev.academic, semesterStartDate: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester End Date</label>
                  <input
                    type="date"
                    value={settings.academic.semesterEndDate}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      academic: { ...prev.academic, semesterEndDate: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                  <input
                    type="date"
                    value={settings.academic.registrationDeadline}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      academic: { ...prev.academic, registrationDeadline: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Deadline</label>
                  <input
                    type="date"
                    value={settings.academic.paymentDeadline}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      academic: { ...prev.academic, paymentDeadline: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Halls Management */}
          {activeTab === 'halls' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-black mb-4">Hall Management</h2>
              <div className="space-y-3">
                {settings.halls.map(hall => (
                  <div key={hall._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-black">{hall.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{hall.gender} Hall</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${hall.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {hall.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toggleHallStatus(hall._id, hall.isActive)}
                        className="px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        {hall.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Password Change */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-black mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <button
                  onClick={changePassword}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={resetSettings}
            className="px-6 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
