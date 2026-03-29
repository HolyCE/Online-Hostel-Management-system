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
  ChevronLeft,
  ChevronRight,
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
      {/* MOBILE DROPDOWN MENU (UNCHANGED) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 left-0 w-full bg-white z-40 shadow-lg border-b border-gray-200 md:hidden"
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
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
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
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 bg-white flex-col shadow-lg border-r border-gray-200"
      >
        {/* ✅ LOGO (UPDATED) */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="h-20 flex items-center justify-center gap-3 px-4 border-b border-gray-200 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                <span className="text-lg font-bold text-black">Hostel</span>
                <span className="text-lg font-bold text-gray-600">Manager</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation (UNCHANGED) */}
        <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                    isActive
                      ? 'text-black bg-gray-100'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gray-100 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <Icon className="w-5 h-5 relative z-10" />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="relative z-10"
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {link.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout (UNCHANGED) */}
        <div className="p-4 border-t border-gray-200 relative">
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 px-3 py-3 bg-gray-50 rounded-xl"
            >
              <p className="text-sm font-medium text-black truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
            </motion.div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;