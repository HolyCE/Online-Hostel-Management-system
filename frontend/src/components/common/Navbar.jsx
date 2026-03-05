import React, { useState } from 'react';
import { Box, Typography, Button, Avatar, IconButton } from '@mui/material';
import { Menu as MenuIcon, X, Sun, Moon } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../../context/ThemeContext';

const DropdownItem = ({ title, description, icon, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      p: 1.5,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
    }}
  >
    <Box sx={{ mr: 2, mt: 0.5, color: '#a1a1aa' }}>{icon}</Box>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#fff', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: '#a1a1aa', display: 'block', lineHeight: 1.3 }}>
        {description}
      </Typography>
    </Box>
  </Box>
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
          <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <DropdownItem title="Room Allocation" description="AI-powered matching for students" onClick={() => navigate('/features/allocation')} />
            <DropdownItem title="Maintenance" description="Streamlined ticket management" onClick={() => navigate('/features/maintenance')} />
            <DropdownItem title="Payments" description="Secure, instant transaction handling" onClick={() => navigate('/features/payments')} />
            <DropdownItem title="Analytics" description="Deep insights for admins" onClick={() => navigate('/features/analytics')} />
          </Box>
        );
      case 'company':
        return (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <DropdownItem title="About Us" description="Our mission to modernize living" onClick={() => navigate('/about')} />
            <DropdownItem title="Careers" description="Join our growing team" onClick={() => navigate('/careers')} />
            <DropdownItem title="Contact" description="Get in touch with sales or support" onClick={() => navigate('/contact')} />
          </Box>
        );
      case 'resources':
        return (
          <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <DropdownItem title="Documentation" description="Guides and API references" onClick={() => navigate('/docs')} />
            <DropdownItem title="Help Center" description="FAQs and support articles" onClick={() => navigate('/help')} />
            <DropdownItem title="Blog" description="Latest news and updates" onClick={() => navigate('/blog')} />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'saturate(180%) blur(32px)',
        borderBottom: 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Brand Logo with Glow Effect */}
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#fff',
            position: 'relative',
            '&:hover .glow-text': {
              color: '#fff',
              textShadow: '0 0 20px rgba(139, 92, 246, 0.8)',
            },
          }}
        >
          Hostel <Box component="span" className="glow-text" sx={{ color: '#a1a1aa', transition: 'all 0.3s ease' }}>Manager</Box>
        </Typography>
      </Box>

      {/* Desktop Navigation */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        {!user && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}
            onMouseLeave={handleMouseLeave}
          >
            {['Features', 'Company', 'Resources', 'Pricing'].map((item) => {
              const isActive = activeDropdown === item.toLowerCase();
              return (
                <Box
                  key={item}
                  onMouseEnter={() => handleMouseEnter(item.toLowerCase())}
                  sx={{
                    color: isActive ? (isDark ? '#fff' : '#000') : (isDark ? '#a1a1aa' : '#6b7280'),
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    py: 1.5,
                    px: 2,
                    position: 'relative',
                    transition: 'color 0.2s',
                    '&:hover': { color: isDark ? '#fff' : '#000' },
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>{item}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-hover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        zIndex: 1
                      }}
                    />
                  )}
                </Box>
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
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    zIndex: 1200,
                  }}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    style={{
                      width: activeDropdown === 'features' ? 600 : activeDropdown === 'resources' ? 500 : 250,
                      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                      borderRadius: '12px',
                      boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
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
          </Box>
        )}
      </Box>

      {/* Auth / Profile Actions */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
        <IconButton onClick={toggleTheme} sx={{ color: '#a1a1aa', '&:hover': { color: '#fff' } }}>
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>

        {!user ? (
          <>
            <Button
              onClick={() => navigate('/login')}
              sx={{ color: isDark ? '#a1a1aa' : '#6b7280', '&:hover': { color: isDark ? '#fff' : '#000', backgroundColor: 'transparent' } }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: isDark ? '#fff' : '#000',
                color: isDark ? '#000' : '#fff',
                '&:hover': { backgroundColor: isDark ? '#f0f0f0' : '#333' },
              }}
            >
              Get Started
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff/dashboard' : '/dashboard')}
              sx={{ color: isDark ? '#fff' : '#000' }}
            >
              Dashboard
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: isDark ? '#27272a' : '#e5e7eb', color: isDark ? '#fff' : '#000', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
            <Button onClick={onLogout} size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              Logout
            </Button>
          </Box>
        )}
      </Box>

      {/* Mobile Menu Toggle */}
      <IconButton
        sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </IconButton>

      {/* Basic Mobile Menu Overlay */}
      {mobileOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            p: 2,
            display: { md: 'none' },
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Theme Toggle Mobile */}
          <Button
            fullWidth
            variant="outlined"
            onClick={toggleTheme}
            startIcon={mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          >
            Switch to {mode === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>

          {/* Extremely simplified mobile menu for brevity */}
          {!user ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Sign In</Button>
              <Button fullWidth variant="contained" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Get Started</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button fullWidth variant="contained" onClick={() => { navigate(user.role === 'admin' ? '/admin' : '/dashboard'); setMobileOpen(false); }}>Dashboard</Button>
              <Button fullWidth variant="outlined" onClick={() => { onLogout(); setMobileOpen(false); }}>Logout</Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
