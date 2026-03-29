import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../../contexts/ThemeContext';
import { Menu, X, Sun, Moon, LogOut, User, Home, Calendar, Bell, Settings } from 'lucide-react';

const DropdownItem = ({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-start p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-white/5"
  >
    <div className="mr-2 mt-0.5 text-zinc-400">{icon}</div>
    <div>
      <p className="text-sm font-medium text-white mb-0.5">{title}</p>
      <p className="text-xs text-zinc-400 leading-tight">{description}</p>
    </div>
  </div>
);

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const isHome = location.pathname === '/';
  const isDark = mode === 'dark';

  const handleMouseEnter = (menu) => setActiveDropdown(menu);
  const handleMouseLeave = () => setActiveDropdown(null);

  const renderDropdownContent = () => {
    switch (activeDropdown) {
      case 'features':
        return (
          <div className="p-2 grid grid-cols-2 gap-1">
            <DropdownItem 
              title="Room Allocation" 
              description="AI-powered matching for students" 
              icon={<span>🏠</span>}
              onClick={() => navigate('/features/allocation')} 
            />
            <DropdownItem 
              title="Maintenance" 
              description="Streamlined ticket management" 
              icon={<span>🔧</span>}
              onClick={() => navigate('/features/maintenance')} 
            />
            <DropdownItem 
              title="Payments" 
              description="Secure, instant transaction handling" 
              icon={<span>💰</span>}
              onClick={() => navigate('/features/payments')} 
            />
            <DropdownItem 
              title="Analytics" 
              description="Deep insights for admins" 
              icon={<span>📊</span>}
              onClick={() => navigate('/features/analytics')} 
            />
          </div>
        );
      case 'company':
        return (
          <div className="p-2 flex flex-col gap-1">
            <DropdownItem 
              title="About Us" 
              description="Our mission to modernize living" 
              icon={<span>🏢</span>}
              onClick={() => navigate('/about')} 
            />
            <DropdownItem 
              title="Careers" 
              description="Join our growing team" 
              icon={<span>💼</span>}
              onClick={() => navigate('/careers')} 
            />
            <DropdownItem 
              title="Contact" 
              description="Get in touch with sales or support" 
              icon={<span>📞</span>}
              onClick={() => navigate('/contact')} 
            />
          </div>
        );
      case 'resources':
        return (
          <div className="p-2 grid grid-cols-2 gap-1">
            <DropdownItem 
              title="Documentation" 
              description="Guides and API references" 
              icon={<span>📚</span>}
              onClick={() => navigate('/docs')} 
            />
            <DropdownItem 
              title="Help Center" 
              description="FAQs and support articles" 
              icon={<span>❓</span>}
              onClick={() => navigate('/help')} 
            />
            <DropdownItem 
              title="Blog" 
              description="Latest news and updates" 
              icon={<span>📝</span>}
              onClick={() => navigate('/blog')} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-[1100] h-16 flex items-center justify-between px-4 md:px-8
      transition-all duration-300
      ${isDark 
        ? 'bg-black/40' 
        : 'bg-white/60'
      }
      backdrop-saturate-180 backdrop-blur-3xl
      border-b-0
    `}>
      {/* Brand Logo with Glow Effect */}
      <div 
        className="flex items-center cursor-pointer group" 
        onClick={() => navigate('/')}
      >
        <h6 className="text-xl font-bold tracking-tight text-black">
          Hostel <span className="text-black transition-all duration-300 group-hover:text-purple-900 group-hover:drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]">Manager</span>
        </h6>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {!user && (
          <div
            className="flex items-center gap-1 relative"
            onMouseLeave={handleMouseLeave}
          >
            {['Features', 'Company', 'Resources', 'Pricing'].map((item) => {
              const isActive = activeDropdown === item.toLowerCase();
              return (
                <div
                  key={item}
                  onMouseEnter={() => handleMouseEnter(item.toLowerCase())}
                  className={`
                    text-sm font-medium cursor-pointer py-1.5 px-4 relative
                    transition-colors duration-200 hover:text-black
                    ${isActive 
                      ? (isDark ? 'text-white' : 'text-black') 
                      : (isDark ? 'text-zinc-400' : 'text-black')
                    }
                  `}
                >
                  <span className="relative z-10">{item}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-hover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      className="absolute inset-0 bg-white/5 rounded-lg z-0"
                    />
                  )}
                </div>
              );
            })}

            {/* Animated Dropdown Panel */}
            <AnimatePresence>
              {activeDropdown && activeDropdown !== 'pricing' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                  exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute top-full left-1/2 z-[1200]"
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className={`
                      overflow-hidden relative rounded-xl border
                      ${activeDropdown === 'features' ? 'w-[600px]' : 
                        activeDropdown === 'resources' ? 'w-[500px]' : 'w-64'}
                      ${isDark 
                        ? 'bg-[#0a0a0a] border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]' 
                        : 'bg-white border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)]'
                      }
                    `}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={activeDropdown}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderDropdownContent()}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Auth / Profile Actions */}
      <div className="hidden md:flex items-center gap-2">
        {/* <button
          onClick={toggleTheme}
          className="text-black hover:text-white transition-colors p-2"
        >
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button> */}

        {!user ? (
          <>
            <button
              onClick={() => navigate('/login')}
              className={`
                text-sm font-medium mr-5 transition-colors
                ${isDark 
                  ? 'text-zinc-400 hover:text-white' 
                  : 'text-black hover:text-black'
                }
              `}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`
                text-sm font-medium px-4 py-2 rounded-lg transition-colors
                ${isDark 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              Get Started
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff/dashboard' : '/dashboard')}
              className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}
            >
              Dashboard
            </button>
            <div 
              className="flex items-center gap-1 cursor-pointer" 
              onClick={() => navigate('/profile')}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                border transition-colors
                ${isDark 
                  ? 'bg-zinc-800 text-white border-white/10' 
                  : 'bg-gray-200 text-black border-black/10'
                }
              `}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-sm px-3 py-1.5 rounded border border-white/10 hover:bg-white/5 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-white p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Basic Mobile Menu Overlay */}
      {mobileOpen && (
        <div className={`
          absolute top-16 left-0 right-0 p-4 md:hidden flex flex-col gap-2
          border-b
          ${isDark 
            ? 'bg-[#0a0a0a] border-white/10' 
            : 'bg-white border-black/10'
          }
        `}>
          {/* Theme Toggle Mobile */}
          <button
            onClick={toggleTheme}
            className="w-full px-4 py-2 rounded border border-white/10 flex items-center justify-center gap-2"
          >
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            Switch to {mode === 'dark' ? 'Light' : 'Dark'} Mode
          </button>

          {/* Extremely simplified mobile menu for brevity */}
          {!user ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                className="w-full px-4 py-2 rounded border border-white/10 hover:bg-white/5"
              >
                Sign In
              </button>
              <button
                onClick={() => { navigate('/register'); setMobileOpen(false); }}
                className="w-full px-4 py-2 rounded bg-white text-black hover:bg-gray-100"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { 
                  navigate(user.role === 'admin' ? '/admin' : '/dashboard'); 
                  setMobileOpen(false); 
                }}
                className="w-full px-4 py-2 rounded bg-white text-black hover:bg-gray-100"
              >
                Dashboard
              </button>
              <button
                onClick={() => { onLogout(); setMobileOpen(false); }}
                className="w-full px-4 py-2 rounded border border-white/10 hover:bg-white/5"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;