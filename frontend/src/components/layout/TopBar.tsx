import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
  isMobile?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, isMobile = false }) => {
  const { user, logout, notifications, unreadCount, markNotificationRead, fetchNotifications } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
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

  return (
    <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left Section - Only hamburger menu on mobile */}
      <div className="flex items-center">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        )}
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

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
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
                      className={`w-full text-left p-4 hover:bg-gray-50 border-b last:border-0 transition-colors ${
                        !notif.read ? 'bg-gray-50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-black">{notif.title}</p>
                      <p className="text-xs text-gray-600 mb-1">{notif.message}</p>
                      <p className="text-xs text-gray-500">{formatDate(notif.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg"
          >
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-semibold text-sm">
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <p className="text-sm font-medium text-black">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              
              <button
                onClick={() => {
                  navigate('/dashboard/profile');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
