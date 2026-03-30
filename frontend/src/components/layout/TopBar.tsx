import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sidebarCollapsed, isMobile = false }) => {
  const { user, logout, notifications, unreadCount, markNotificationRead, fetchNotifications } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    console.log('🚪 Logging out from TopBar...');
    logout(); // This will now redirect to login
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Mobile Only */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-lg font-bold text-black hidden sm:block">HostelHub</span>
        </div>

        {/* Search Bar - Desktop Only */}
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-80 pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-black">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif._id}
                        onClick={() => markNotificationRead(notif._id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 ${
                          !notif.read ? 'bg-gray-50' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-black">{notif.title}</p>
                        <p className="text-xs text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notif.createdAt)}</p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-semibold text-sm">
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-black">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    if (user?.role === 'admin') {
                      navigate('/dashboard/admin/settings');
                    } else {
                      navigate('/dashboard/profile');
                    }
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                {user?.role !== 'admin' && (
                  <button
                    onClick={() => {
                      navigate('/dashboard/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
