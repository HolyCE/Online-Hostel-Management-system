import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Globe, Shield, Save, RefreshCw } from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const StudentSettings = () => {
  const { mode, toggleTheme } = useThemeContext();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    language: 'en',
    twoFactorAuth: false
  });
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    const loadingToast = toast.loading('Saving settings...');
    
    try {
      // Save to localStorage or backend
      localStorage.setItem('studentSettings', JSON.stringify(settings));
      toast.dismiss(loadingToast);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: true,
      language: 'en',
      twoFactorAuth: false
    });
    toast.success('Settings reset to default');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
        <p className="text-gray-600">Manage your preferences and account settings</p>
      </motion.div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="space-y-6 p-6">
          {/* Theme Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Appearance
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-black">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch between light and dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-black">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email alerts for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={e => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
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
                  checked={settings.pushNotifications}
                  onChange={e => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>

          {/* Language Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <select
                value={settings.language}
                onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-black">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={e => setSettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
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

export default StudentSettings;
