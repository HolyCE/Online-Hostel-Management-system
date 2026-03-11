import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Badge,
  Divider,
  AvatarGroup,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  MeetingRoom,
  Payment,
  Report,
  Search,
  Favorite,
  FavoriteBorder,
  LocationOn,
  Bed,
  CheckCircle,
  Pending,
  Error,
  Warning,
  Info,
  ArrowForward,
  CalendarToday,
  TrendingUp,
  AccountBalanceWallet,
  ConfirmationNumber,
  Home,
  Star,
  StarBorder,
  Refresh,
  Notifications,
  Person,
  Receipt,
  AccessTime,
  MoreVert,
  Download,
  Share,
  Settings,
  Logout,
  Add,
  Remove,
  TrendingDown,
  Visibility,
  Edit,
  Delete,
  Email,
  Phone,
  Message,
  Wifi,
  AcUnit,
  Bathtub,
  LocalParking,
  Kitchen,
  Security,
  EventAvailable,
  EventBusy,
  Assessment,
  Dashboard as DashboardIcon,
  Group,
  Room,
  SupportAgent,
  CleaningServices,
  Restaurant,
  FitnessCenter,
  Pool,
  Weekend,
  KingBed,
  SingleBed,
  Balcony,
  Elevator,
  FireExtinguisher,
  SmokeFree,
  Pets,
  ChildCare,
  Checkroom,
  LocalLaundryService,
  Coffee,
  Waves,
  BeachAccess,
  Terrain,
  Cabin,
  Villa,
  Cottage,
  House,
  Apartment,
  Hotel,
  Resort,
  Castle,
  Tent,
  Campsites,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChart, setSelectedChart] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Real data from backend
  const [userRoom, setUserRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    totalPayments: 0,
    daysRemaining: 180,
    monthlySpending: [],
    categoryBreakdown: [],
    occupancyRate: 78,
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [roomRes, roomsRes, paymentsRes, ticketsRes] = await Promise.all([
        axios.get(`${API_URL}/rooms/student/my-room`, { headers }).catch(() => ({ data: { data: null } })),
        axios.get(`${API_URL}/rooms/available`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/payments/my-payments`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/tickets/my-tickets`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);

      const room = roomRes.data.data;
      const available = roomsRes.data.data || [];
      const paymentsList = paymentsRes.data.data || [];
      const ticketsList = ticketsRes.data.data || [];

      setUserRoom(room);
      setAvailableRooms(available.filter(r => r.status === 'available').slice(0, 6));
      setPayments(paymentsList);
      setTickets(ticketsList);

      if (room?.occupants?.length > 0) {
        setRoommates(room.occupants.filter(o => o._id !== user?.id));
      }

      const totalSpent = paymentsList
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString('default', { month: 'short' });
      }).reverse();

      const monthlyData = last6Months.map(month => {
        const monthPayments = paymentsList.filter(p => {
          const paymentDate = new Date(p.createdAt);
          return paymentDate.toLocaleString('default', { month: 'short' }) === month;
        });
        
        return {
          month,
          accommodation: monthPayments.filter(p => p.paidFor === 'accommodation').reduce((sum, p) => sum + p.amount, 0),
          food: monthPayments.filter(p => p.paidFor === 'food').reduce((sum, p) => sum + p.amount, 0),
          utilities: monthPayments.filter(p => p.paidFor === 'utilities').reduce((sum, p) => sum + p.amount, 0),
          total: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        };
      });

      const categories = [
        { name: 'Accommodation', value: paymentsList.filter(p => p.paidFor === 'accommodation').reduce((sum, p) => sum + p.amount, 0), color: '#FF6B6B', icon: '🏠' },
        { name: 'Food', value: paymentsList.filter(p => p.paidFor === 'food').reduce((sum, p) => sum + p.amount, 0), color: '#4ECDC4', icon: '🍽️' },
        { name: 'Utilities', value: paymentsList.filter(p => p.paidFor === 'utilities').reduce((sum, p) => sum + p.amount, 0), color: '#FFD166', icon: '💡' },
        { name: 'Other', value: paymentsList.filter(p => !p.paidFor).reduce((sum, p) => sum + p.amount, 0), color: '#6C5CE7', icon: '📦' },
      ].filter(c => c.value > 0);

      setStats({
        totalSpent,
        pendingTickets: ticketsList.filter(t => t.status === 'pending').length,
        resolvedTickets: ticketsList.filter(t => t.status === 'resolved').length,
        totalPayments: paymentsList.length,
        daysRemaining: room ? calculateDaysRemaining(room) : 0,
        monthlySpending: monthlyData,
        categoryBreakdown: categories,
        occupancyRate: 78,
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (room) => {
    return 165;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleFavorite = (roomId) => {
    setFavorites(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <Box className="loading-spinner">
          <Box className="spinner-ring"></Box>
          <Box className="spinner-ring"></Box>
          <Box className="spinner-ring"></Box>
        </Box>
        <Typography variant="h6" className="loading-text">
          Loading your dashboard
        </Typography>
        <Typography variant="body2" className="loading-subtext">
          Please wait while we prepare your data
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboard">
      {/* Animated Background */}
      <Box className="dashboard-bg">
        <Box className="bg-gradient"></Box>
        <Box className="bg-grid"></Box>
        <Box className="bg-orb orb-1"></Box>
        <Box className="bg-orb orb-2"></Box>
        <Box className="bg-orb orb-3"></Box>
      </Box>

      <Container maxWidth="xl" className="dashboard-container">
        {/* Header Section - Fixed spacing from navbar */}
        <Box className="dashboard-header">
          <Box className="header-left">
            <Box className="welcome-badge">
              <span className="badge-dot"></span>
              <Typography variant="caption" className="badge-text">
                STUDENT PORTAL
              </Typography>
            </Box>
            <Typography variant="h3" className="welcome-title">
              Welcome back, {user?.name?.split(' ')[0] || 'Chisom'}
              <span className="welcome-emoji">✨</span>
            </Typography>
            <Typography variant="body1" className="welcome-subtitle">
              Here's what's happening with your accommodation today
            </Typography>
          </Box>

          <Box className="header-right">
            <Paper className="quick-stats">
              <Box className="quick-stat-item">
                <Typography variant="caption" className="stat-label-small">Room</Typography>
                <Typography variant="h6" className="stat-value-small">
                  {userRoom ? userRoom.roomNumber : '—'}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem className="stat-divider" />
              <Box className="quick-stat-item">
                <Typography variant="caption" className="stat-label-small">Block</Typography>
                <Typography variant="h6" className="stat-value-small">
                  {userRoom ? userRoom.blockName : '—'}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem className="stat-divider" />
              <Box className="quick-stat-item">
                <Typography variant="caption" className="stat-label-small">Floor</Typography>
                <Typography variant="h6" className="stat-value-small">
                  {userRoom ? userRoom.floorNumber : '—'}
                </Typography>
              </Box>
            </Paper>

            <Box className="header-actions">
              <Tooltip title="Refresh">
                <IconButton className="action-btn" onClick={fetchDashboardData}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton className="action-btn">
                  <Badge badgeContent={stats.pendingTickets} color="error" className="notification-badge">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Avatar className="profile-avatar">
                {user?.name?.charAt(0) || 'S'}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="dashboard-alert" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats Cards - 4 cards per row (1/4 width each) */}
        <Grid container spacing={3} className="stats-grid">
          {/* Card 1 - Room Status */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={300}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ bgcolor: 'rgba(255, 107, 107, 0.15)' }}>
                    <Home className="stat-icon" sx={{ color: '#FF6B6B' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Room Status
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {userRoom ? 'Allocated' : 'Available'}
                  </Typography>
                  {userRoom ? (
                    <Box className="stat-details">
                      <Chip
                        label={`${userRoom.roomNumber} · ${userRoom.blockName}`}
                        size="small"
                        className="stat-chip"
                      />
                    </Box>
                  ) : (
                    <Button
                      size="small"
                      className="stat-action-btn"
                      onClick={() => navigate('/rooms')}
                    >
                      Apply Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Card 2 - Total Spent */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={400}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ bgcolor: 'rgba(78, 205, 196, 0.15)' }}>
                    <AccountBalanceWallet className="stat-icon" sx={{ color: '#4ECDC4' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Total Spent
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    ₦{stats.totalSpent.toLocaleString() || '0'}
                  </Typography>
                  <Box className="stat-details">
                    <Chip
                      label={`${stats.totalPayments} transactions`}
                      size="small"
                      className="stat-chip"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Card 3 - Open Tickets */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={500}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ bgcolor: 'rgba(255, 209, 102, 0.15)' }}>
                    <ConfirmationNumber className="stat-icon" sx={{ color: '#FFD166' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {stats.pendingTickets || '0'}
                  </Typography>
                  <Box className="stat-details">
                    <Chip
                      label={`${stats.resolvedTickets} resolved`}
                      size="small"
                      className="stat-chip"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Card 4 - Session Ends */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ bgcolor: 'rgba(108, 92, 231, 0.15)' }}>
                    <AccessTime className="stat-icon" sx={{ color: '#6C5CE7' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Session Ends
                  </Typography>
                  <Typography variant="h4" className="stat-value">
                    {stats.daysRemaining}d
                  </Typography>
                  <Box className="stat-details">
                    <Box className="progress-bar">
                      <Box
                        className="progress-fill"
                        sx={{ width: `${(stats.daysRemaining / 180) * 100}%` }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Charts & Overview Section - 2/3 and 1/3 split */}
        <Grid container spacing={3} className="overview-grid">
          {/* Left chart - 2/3 width */}
          <Grid item xs={12} lg={8}>
            <Fade in timeout={700}>
              <Card className="chart-card">
                <CardContent>
                  <Box className="chart-header">
                    <Typography variant="h6" className="chart-title">
                      Spending Overview
                    </Typography>
                    <Box className="chart-legend">
                      <Box className="legend-item">
                        <Box className="legend-dot" sx={{ bgcolor: '#FF6B6B' }} />
                        <Typography variant="caption">Accommodation</Typography>
                      </Box>
                      <Box className="legend-item">
                        <Box className="legend-dot" sx={{ bgcolor: '#4ECDC4' }} />
                        <Typography variant="caption">Food</Typography>
                      </Box>
                      <Box className="legend-item">
                        <Box className="legend-dot" sx={{ bgcolor: '#FFD166' }} />
                        <Typography variant="caption">Utilities</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.monthlySpending.length ? stats.monthlySpending : dummyData}>
                        <defs>
                          <linearGradient id="accommodationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="foodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="utilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888' }} />
                        <YAxis stroke="#888" tick={{ fill: '#888' }} />
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: '#1A1A1A',
                            border: '1px solid #333',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#FFF' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="accommodation"
                          stackId="1"
                          stroke="#FF6B6B"
                          strokeWidth={2}
                          fill="url(#accommodationGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="food"
                          stackId="1"
                          stroke="#4ECDC4"
                          strokeWidth={2}
                          fill="url(#foodGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="utilities"
                          stackId="1"
                          stroke="#FFD166"
                          strokeWidth={2}
                          fill="url(#utilitiesGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Right mini stats - 1/3 width */}
          <Grid item xs={12} lg={4}>
            <Fade in timeout={800}>
              <Card className="stats-mini-card">
                <CardContent>
                  <Typography variant="h6" className="card-title" gutterBottom>
                    Quick Overview
                  </Typography>
                  
                  <Box className="mini-stat-item">
                    <Box className="mini-stat-icon" sx={{ bgcolor: 'rgba(255, 107, 107, 0.15)' }}>
                      <MeetingRoom sx={{ color: '#FF6B6B', fontSize: 20 }} />
                    </Box>
                    <Box className="mini-stat-content">
                      <Typography variant="body2" className="mini-stat-label">
                        Occupancy Rate
                      </Typography>
                      <Typography variant="h5" className="mini-stat-value">
                        {stats.occupancyRate}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="mini-stat-item">
                    <Box className="mini-stat-icon" sx={{ bgcolor: 'rgba(78, 205, 196, 0.15)' }}>
                      <Group sx={{ color: '#4ECDC4', fontSize: 20 }} />
                    </Box>
                    <Box className="mini-stat-content">
                      <Typography variant="body2" className="mini-stat-label">
                        Roommates
                      </Typography>
                      <Typography variant="h5" className="mini-stat-value">
                        {roommates.length}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="mini-stat-item">
                    <Box className="mini-stat-icon" sx={{ bgcolor: 'rgba(255, 209, 102, 0.15)' }}>
                      <Payment sx={{ color: '#FFD166', fontSize: 20 }} />
                    </Box>
                    <Box className="mini-stat-content">
                      <Typography variant="body2" className="mini-stat-label">
                        Next Payment
                      </Typography>
                      <Typography variant="h5" className="mini-stat-value">
                        {payments.length > 0 ? '₦' + payments[0]?.amount?.toLocaleString() : '—'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: '#333' }} />

                  <Box className="quick-actions">
                    <Button
                      fullWidth
                      variant="outlined"
                      className="quick-action-button"
                      onClick={() => navigate('/payments')}
                      startIcon={<Payment />}
                    >
                      Make Payment
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      className="quick-action-button"
                      onClick={() => navigate('/complaints/new')}
                      startIcon={<Report />}
                    >
                      Report Issue
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Tabs Section - Full width */}
        <Box className="tabs-section">
          <Paper className="tabs-header">
            <Tabs value={activeTab} onChange={handleTabChange} className="tabs">
              <Tab icon={<MeetingRoom />} label="Available Rooms" />
              <Tab icon={<Receipt />} label="Payment History" />
              <Tab icon={<Report />} label="Support Tickets" />
            </Tabs>
          </Paper>

          {/* Available Rooms Tab - 3 cards per row */}
          {activeTab === 0 && (
            <Fade in>
              <Card className="content-card">
                <CardContent>
                  <Box className="content-header">
                    <Typography variant="h6">Available Rooms</Typography>
                    <Box className="content-actions">
                      <TextField
                        placeholder="Search rooms..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ color: '#888' }} />
                            </InputAdornment>
                          ),
                        }}
                        className="search-field"
                      />
                      <Button
                        className="view-all-link"
                        onClick={() => navigate('/rooms')}
                      >
                        View All <ArrowForward />
                      </Button>
                    </Box>
                  </Box>

                  {availableRooms.length === 0 ? (
                    <Box className="empty-state">
                      <Typography variant="body1" color="textSecondary">
                        No rooms available at the moment
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {availableRooms.map((room, index) => (
                        <Grid item xs={12} sm={6} md={4} key={room._id}>
                          <Fade in timeout={900 + index * 100}>
                            <Box className="room-card">
                              <Box className="room-image">
                                <img
                                  src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'}
                                  alt={room.roomNumber}
                                />
                                <IconButton
                                  className="favorite-btn"
                                  onClick={() => toggleFavorite(room._id)}
                                  size="small"
                                >
                                  {favorites.includes(room._id) ? (
                                    <Favorite sx={{ color: '#FF6B6B' }} />
                                  ) : (
                                    <FavoriteBorder />
                                  )}
                                </IconButton>
                                <Chip
                                  label="Available"
                                  size="small"
                                  className="room-status"
                                />
                              </Box>
                              <Box className="room-info">
                                <Box className="room-header">
                                  <Typography variant="subtitle1" className="room-number">
                                    {room.roomNumber}
                                  </Typography>
                                  <Typography variant="subtitle1" className="room-price">
                                    ₦{room.price.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" className="room-location">
                                  <LocationOn sx={{ fontSize: 14 }} />
                                  {room.blockName}, Floor {room.floorNumber}
                                </Typography>
                                <Box className="room-amenities">
                                  {room.amenities?.slice(0, 3).map(amenity => (
                                    <Chip
                                      key={amenity}
                                      label={amenity}
                                      size="small"
                                      className="amenity-chip"
                                    />
                                  ))}
                                </Box>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  className="view-room-btn"
                                  onClick={() => navigate(`/rooms/${room._id}`)}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </Box>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Payment History Tab */}
          {activeTab === 1 && (
            <Fade in>
              <Card className="content-card">
                <CardContent>
                  <Box className="content-header">
                    <Typography variant="h6">Recent Payments</Typography>
                    <Button
                      className="view-all-link"
                      onClick={() => navigate('/payments')}
                    >
                      View All <ArrowForward />
                    </Button>
                  </Box>

                  {payments.length === 0 ? (
                    <Box className="empty-state">
                      <Typography variant="body1" color="textSecondary">
                        No payment history yet
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="payment-list">
                      {payments.slice(0, 5).map((payment, index) => (
                        <Fade in timeout={900 + index * 100} key={payment._id}>
                          <Box className="payment-item">
                            <Box className="payment-info">
                              <Box>
                                <Typography variant="subtitle2" className="payment-amount">
                                  ₦{payment.amount.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" className="payment-ref">
                                  Ref: {payment.reference?.slice(0, 12)}...
                                </Typography>
                              </Box>
                              <Typography variant="caption" className="payment-date">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box className="payment-right">
                              <Chip
                                label={payment.status}
                                size="small"
                                className={`payment-status ${payment.status}`}
                              />
                              <IconButton size="small" className="payment-menu">
                                <MoreVert sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 2 && (
            <Fade in>
              <Card className="content-card">
                <CardContent>
                  <Box className="content-header">
                    <Typography variant="h6">Recent Tickets</Typography>
                    <Button
                      className="view-all-link"
                      onClick={() => navigate('/complaints')}
                    >
                      View All <ArrowForward />
                    </Button>
                  </Box>

                  {tickets.length === 0 ? (
                    <Box className="empty-state">
                      <Typography variant="body1" color="textSecondary">
                        No tickets yet
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="ticket-list">
                      {tickets.slice(0, 5).map((ticket, index) => (
                        <Fade in timeout={900 + index * 100} key={ticket._id}>
                          <Box className="ticket-item">
                            <Box className="ticket-info">
                              <Box className="ticket-header">
                                <Typography variant="subtitle2" className="ticket-title">
                                  {ticket.title}
                                </Typography>
                                <Chip
                                  label={ticket.priority}
                                  size="small"
                                  className={`ticket-priority ${ticket.priority}`}
                                />
                              </Box>
                              <Typography variant="caption" className="ticket-category">
                                {ticket.category}
                              </Typography>
                            </Box>
                            <Box className="ticket-right">
                              <Chip
                                label={ticket.status}
                                size="small"
                                className={`ticket-status ${ticket.status}`}
                              />
                              <Typography variant="caption" className="ticket-date">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>
      </Container>
    </Box>
  );
};

// Dummy data for charts
const dummyData = [
  { month: 'Oct', accommodation: 0, food: 0, utilities: 0 },
  { month: 'Nov', accommodation: 0, food: 0, utilities: 0 },
  { month: 'Dec', accommodation: 0, food: 0, utilities: 0 },
  { month: 'Jan', accommodation: 0, food: 0, utilities: 0 },
  { month: 'Feb', accommodation: 0, food: 0, utilities: 0 },
  { month: 'Mar', accommodation: 0, food: 0, utilities: 0 },
];

export default Dashboard;