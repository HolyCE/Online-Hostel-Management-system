import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  LayoutDashboard,
  BedDouble,
  CreditCard,
  Ticket,
  User,
  Settings,
  Users,
  BarChart3,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/rooms', icon: BedDouble, label: 'Rooms' },
    { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { to: '/dashboard/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/dashboard/admin/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/admin/rooms', icon: BedDouble, label: 'Rooms' },
    { to: '/dashboard/admin/users', icon: Users, label: 'Users' },
    { to: '/dashboard/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/dashboard/admin/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/dashboard/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/dashboard/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* ✅ MOBILE DROPDOWN */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay (click outside closes) */}
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen?.(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-0 right-0 bg-white z-50 shadow-lg border-b border-gray-200 md:hidden"
            >
              <nav className="py-4 px-4 space-y-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen?.(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                          isActive
                            ? 'bg-gray-100 text-black'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </NavLink>
                  );
                })}

                <button
                  onClick={() => {
                    logout();
                    setMobileOpen?.(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 bg-white flex-col shadow-lg border-r border-gray-200"
      >
        {/* Logo (toggle) */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="h-20 flex items-center justify-center gap-3 px-4 border-b cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div>
              <span className="font-bold">Hostel</span>
              <span className="font-bold text-gray-500">Manager</span>
            </div>
          )}
        </div>

        {/* Links */}
        <nav className="flex-1 p-3 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl ${
                    isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {!collapsed && link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;