import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Camera, Save, X, Lock, User, Mail, Phone, BookOpen, Calendar, Home } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  matricNumber: string;
  gender: string;
  role: string;
  course?: string;
  year?: number;
  room?: {
    _id: string;
    roomNumber: string;
    blockName: string;
  };
  createdAt: string;
}

const StudentProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    matricNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const loadingToast = toast.loading('Loading profile...');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/users/profile`, { headers });
      const data = response.data.data || response.data.user;
      setUser(data);
      setForm({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        matricNumber: data.matricNumber || '',
      });
      toast.dismiss(loadingToast);
      toast.success('Profile loaded successfully');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to load profile');
      if (authUser) {
        setUser(authUser as any);
        setForm({
          name: authUser.name || '',
          email: authUser.email || '',
          phoneNumber: (authUser as any).phoneNumber || '',
          matricNumber: (authUser as any).matricNumber || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    const loadingToast = toast.loading('Updating profile...');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/users/profile`, form, { headers });
      setEditing(false);
      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
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
        setShowPasswordModal(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-black mb-6">My Profile</h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 rounded-lg bg-black flex items-center justify-center relative group">
            <span className="text-2xl font-bold text-white">
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
            <button className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-xl font-semibold text-black">{user.name}</p>
            <p className="text-sm text-gray-600 capitalize">
              {user.role} • {user.gender || 'Not specified'}
            </p>
            {user.course && (
              <p className="text-sm text-gray-500 mt-1">
                {user.course} • Year {user.year}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', value: form.name, icon: User },
            { label: 'Email', key: 'email', value: form.email, icon: Mail },
            { label: 'Phone Number', key: 'phoneNumber', value: form.phoneNumber, icon: Phone },
            { label: 'Matric Number', key: 'matricNumber', value: form.matricNumber, icon: BookOpen },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                <field.icon className="w-3 h-3" />
                {field.label}
              </label>
              {editing ? (
                <input
                  type="text"
                  value={field.value}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              ) : (
                <p className="text-sm text-black py-2">
                  {field.value || '—'}
                </p>
              )}
            </div>
          ))}
          
          {user.room && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                <Home className="w-3 h-3" />
                Allocated Room
              </label>
              <p className="text-sm text-black py-2">
                {user.room.roomNumber} - {user.room.blockName}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Member Since
            </label>
            <p className="text-sm text-black py-2">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          {editing ? (
            <>
              <button 
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => setEditing(false)} 
                className="px-4 py-2 bg-gray-200 text-black rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setEditing(true)} 
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-gray-200 text-black rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-300 transition-colors"
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Change Password</h2>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
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
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
