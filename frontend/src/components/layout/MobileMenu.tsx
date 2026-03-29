import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BedDouble,
  CreditCard,
  Ticket,
  User,
  Settings,
  Users,
  BarChart3,
  LogOut,
  X,
  Building2
} from 'lucide-react';
import { useEffect } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/rooms', icon: BedDouble, label: 'Rooms' },
    { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { to: '/dashboard/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/rooms', icon: BedDouble, label: 'Rooms' },
    { to: '/dashboard/users', icon: Users, label: 'Users' },
    { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { to: '/dashboard/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          
          {/* Modal - Perfectly Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-black">Hostel</span>
                  <span className="text-lg font-bold text-gray-600">Hub</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* User Info */}
            {user && (
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-semibold text-black">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{user.role}</p>
              </div>
            )}
            
            {/* Navigation Links */}
            <div className="py-2 max-h-[50vh] overflow-y-auto">
              {links.map(link => {
                const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
                const Icon = link.icon;
                
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-3.5 text-sm transition-colors ${
                        isActive
                          ? 'text-black bg-gray-100 font-medium'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
            
            {/* Logout Button */}
            <div className="border-t border-gray-200">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
