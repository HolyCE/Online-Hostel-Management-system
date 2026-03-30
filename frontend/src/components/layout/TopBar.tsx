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
  Home,
  UserCircle,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { performSearch } from '../../services/searchService';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, isMobile = false }) => {
  const { user, logout, notifications, unreadCount, markNotificationRead, fetchNotifications } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else if (searchQuery.length > 0 && searchQuery.length < 2) {
        toast.error('🔍 Please enter at least 2 characters to search', {
          duration: 2000,
          icon: '❓',
        });
        setSearchResults([]);
        setShowSearchResults(false);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    
    setIsSearching(true);
    
    const fetchSearchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [roomsRes, ticketsRes, paymentsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/rooms`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/tickets/my-tickets`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/payments/my-payments`, { headers }).catch(() => ({ data: { data: [] } })),
        user?.role === 'admin' ? axios.get(`${API_URL}/users`, { headers }).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
      ]);
      
      return {
        rooms: roomsRes.data.data || [],
        tickets: ticketsRes.data.data || [],
        payments: paymentsRes.data.data || [],
        users: usersRes.data.data || [],
      };
    };
    
    const results = await performSearch(searchQuery, user?.role || 'student', fetchSearchData);
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    setIsSearching(false);
  };

  const handleResultClick = (link: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(link);
  };

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

  const getResultIcon = (type: string) => {
    switch(type) {
      case 'room': return '🏠';
      case 'payment': return '💰';
      case 'ticket': return '🎫';
      case 'user': return '👤';
      default: return '📄';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Search Bar */}
        <div className="hidden md:block relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            placeholder="Search rooms, payments, tickets..."
            className="w-80 pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (searchResults.length > 0 || isSearching) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                    <p className="mt-2">Searching...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <p className="text-sm font-medium text-black">
                        Found {searchResults.length} result(s)
                      </p>
                    </div>
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleResultClick(result.link)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-0 transition-colors flex items-start gap-3"
                      >
                        <div className="text-xl">{getResultIcon(result.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black">{result.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{result.subtitle}</p>
                          <p className="text-xs text-gray-400 mt-1 capitalize">{result.type}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg"
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
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-lg">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={() => {
                      if (user?.role === 'admin') {
                        navigate('/dashboard/admin/overview');
                      } else {
                        navigate('/dashboard');
                      }
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      if (user?.role === 'admin') {
                        navigate('/dashboard/admin/settings');
                      } else {
                        navigate('/dashboard/profile');
                      }
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserCircle className="w-4 h-4" />
                    {user?.role === 'admin' ? 'System Settings' : 'My Profile'}
                  </button>
                  
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/dashboard/admin/users');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Shield className="w-4 h-4" />
                      Manage Users
                    </button>
                  )}
                </div>
                
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
