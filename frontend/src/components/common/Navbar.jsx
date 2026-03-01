import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  MeetingRoom,
  Payment,
  Report,
  Person,
  Logout,
  Home,
  Info,
  ContactMail
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = user ? (
    user.role === 'admin' ? [
      { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
      { text: 'Rooms', icon: <MeetingRoom />, path: '/admin/rooms' },
      { text: 'Users', icon: <Person />, path: '/admin/users' },
      { text: 'Tickets', icon: <Report />, path: '/admin/tickets' },
      { text: 'Payments', icon: <Payment />, path: '/admin/payments' },
    ] : user.role === 'staff' ? [
      { text: 'Dashboard', icon: <Dashboard />, path: '/staff/dashboard' },
    ] : [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Browse Rooms', icon: <MeetingRoom />, path: '/rooms' },
      { text: 'Report Issue', icon: <Report />, path: '/complaints/new' },
    ]
  ) : [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'About', icon: <Info />, path: '/about' },
    { text: 'Contact', icon: <ContactMail />, path: '/contact' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: '#0a2351' }}>
        Hostel Manager
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              '&:hover': {
                backgroundColor: '#f0f0f0',
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {user && (
          <ListItem
            button
            onClick={onLogout}
            sx={{
              '&:hover': {
                backgroundColor: '#ffebee',
              }
            }}
          >
            <ListItemIcon><Logout color="error" /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#0a2351' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏨 Hostel Management System
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {!user ? (
              <>
                <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
                <Button color="inherit" onClick={() => navigate('/about')}>About</Button>
                <Button color="inherit" onClick={() => navigate('/contact')}>Contact</Button>
                <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    ml: 2,
                    backgroundColor: 'white',
                    color: '#0a2351',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    }
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}>
                  Dashboard
                </Button>
                <IconButton onClick={handleMenu} color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff9800' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                    <Person sx={{ mr: 1 }} /> Profile
                  </MenuItem>
                  <MenuItem onClick={() => { handleClose(); onLogout(); }}>
                    <Logout sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navbar;
