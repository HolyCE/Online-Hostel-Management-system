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
  LinearProgress as ProgressLinear,
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
        {/* Header Section */}
        <Box className="dashboard-header">
          <Box className="header-left">
            <Box className="welcome-badge">
              <span className="badge-dot"></span>
              <Typography variant="caption" className="badge-text">
                PREMIUM DASHBOARD
              </Typography>
            </Box>
            <Typography variant="h3" className="welcome-title">
              {user?.name?.split(' ')[0] || 'Chisom'}
              <span className="welcome-emoji">✨</span>
            </Typography>
            <Typography variant="body1" className="welcome-subtitle">
              Curated insights for your premium experience
            </Typography>
          </Box>

          <Box className="header-right">
            <Paper className="quick-stats">
              <Box className="quick-stat-item">
                <Typography variant="caption" className="stat-label-small">Status</Typography>
                <Typography variant="h6" className="stat-value-small">
                  {userRoom ? 'Active' : 'Pending'}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem className="stat-divider" />
              <Box className="quick-stat-item">
                <Typography variant="caption" className="stat-label-small">Room</Typography>
                <Typography variant="h6" className="stat-value-small">
                  {userRoom ? userRoom.roomNumber : '—'}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem className="stat-divider" />
              <Box className="quick-stat-item">
                <Typography variant="caption" className="stat-label-small">Level</Typography>
                <Typography variant="h6" className="stat-value-small">
                  {userRoom ? `Floor ${userRoom.floorNumber}` : '—'}
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

        {/* Stats Cards - Luxury Edition */}
        <Grid container spacing={3} className="stats-grid">
          {/* Card 1 - Room Status - Glass Morph */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={300}>
              <Card className="stat-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,107,107,0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-50%',
                  width: '150%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                  transform: 'skewX(-15deg)',
                  animation: 'shimmer 3s infinite',
                },
              }}>
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ 
                    bgcolor: 'rgba(255, 107, 107, 0.15)',
                    boxShadow: '0 8px 16px rgba(255,107,107,0.2)',
                  }}>
                    <Home className="stat-icon" sx={{ color: '#FF6B6B' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Residence Status
                  </Typography>
                  <Typography variant="h4" className="stat-value" sx={{ 
                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {userRoom ? 'Active' : 'Open'}
                  </Typography>
                  {userRoom ? (
                    <Box className="stat-details">
                      <Chip
                        label={`${userRoom.roomNumber} · ${userRoom.blockName}`}
                        size="small"
                        className="stat-chip"
                        sx={{ bgcolor: 'rgba(255,107,107,0.15) !important', color: '#FF6B6B !important' }}
                      />
                      <Box className="progress-bar" sx={{ width: '100%', mt: 1 }}>
                        <Box className="progress-fill" sx={{ width: '75%', background: 'linear-gradient(90deg, #FF6B6B, #FF8E8E)' }} />
                      </Box>
                    </Box>
                  ) : (
                    <Button
                      size="small"
                      className="stat-action-btn"
                      onClick={() => navigate('/rooms')}
                      sx={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E) !important', color: '#fff !important' }}
                    >
                      Secure Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Card 2 - Total Spent - Gold Edition */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={400}>
              <Card className="stat-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,209,102,0.2)',
              }}>
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ 
                    bgcolor: 'rgba(255, 209, 102, 0.15)',
                    boxShadow: '0 8px 16px rgba(255,209,102,0.2)',
                  }}>
                    <AccountBalanceWallet className="stat-icon" sx={{ color: '#FFD166' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Total Investment
                  </Typography>
                  <Typography variant="h4" className="stat-value" sx={{ 
                    background: 'linear-gradient(135deg, #FFD166, #FFE194)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    ₦{stats.totalSpent.toLocaleString() || '0'}
                  </Typography>
                  <Box className="stat-details">
                    <Chip
                      label={`${stats.totalPayments} transactions`}
                      size="small"
                      className="stat-chip"
                      sx={{ bgcolor: 'rgba(255,209,102,0.15) !important', color: '#FFD166 !important' }}
                    />
                    <Typography variant="caption" sx={{ color: '#FFD166' }}>+12.4%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Card 3 - Open Tickets - Emerald Edition */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={500}>
              <Card className="stat-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(78,205,196,0.2)',
              }}>
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ 
                    bgcolor: 'rgba(78, 205, 196, 0.15)',
                    boxShadow: '0 8px 16px rgba(78,205,196,0.2)',
                  }}>
                    <ConfirmationNumber className="stat-icon" sx={{ color: '#4ECDC4' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Active Tickets
                  </Typography>
                  <Typography variant="h4" className="stat-value" sx={{ 
                    background: 'linear-gradient(135deg, #4ECDC4, #7FDFD8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {stats.pendingTickets || '0'}
                  </Typography>
                  <Box className="stat-details">
                    <Chip
                      label={`${stats.resolvedTickets} resolved`}
                      size="small"
                      className="stat-chip"
                      sx={{ bgcolor: 'rgba(78,205,196,0.15) !important', color: '#4ECDC4 !important' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingDown sx={{ color: '#4ECDC4', fontSize: 16 }} />
                      <Typography variant="caption" sx={{ color: '#4ECDC4' }}>-23%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Card 4 - Session Ends - Purple Edition */}
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <Card className="stat-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(108,92,231,0.2)',
              }}>
                <CardContent>
                  <Box className="stat-icon-wrapper" sx={{ 
                    bgcolor: 'rgba(108, 92, 231, 0.15)',
                    boxShadow: '0 8px 16px rgba(108,92,231,0.2)',
                  }}>
                    <AccessTime className="stat-icon" sx={{ color: '#6C5CE7' }} />
                  </Box>
                  <Typography variant="body2" className="stat-label">
                    Time Remaining
                  </Typography>
                  <Typography variant="h4" className="stat-value" sx={{ 
                    background: 'linear-gradient(135deg, #6C5CE7, #9A8CFF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {stats.daysRemaining}d
                  </Typography>
                  <Box className="stat-details">
                    <Box className="progress-bar" sx={{ width: '100%', bgcolor: 'rgba(108,92,231,0.2)' }}>
                      <Box className="progress-fill" sx={{ 
                        width: `${(stats.daysRemaining / 180) * 100}%`, 
                        background: 'linear-gradient(90deg, #6C5CE7, #9A8CFF)',
                        height: '8px',
                        borderRadius: '4px',
                      }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Charts & Overview Section - Premium Layout */}
        <Grid container spacing={3} className="overview-grid">
          {/* Left chart - 2/3 width with glass effect */}
          <Grid item xs={12} lg={8}>
            <Fade in timeout={700}>
              <Card className="chart-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <CardContent>
                  <Box className="chart-header">
                    <Typography variant="h6" className="chart-title" sx={{ 
                      background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #6C5CE7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Financial Analytics
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
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={stats.monthlySpending.length ? stats.monthlySpending : dummyData}>
                        <defs>
                          <linearGradient id="accommodationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="foodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="utilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD166" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: 'rgba(26,26,35,0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
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

          {/* Right mini stats - 1/3 width with luxury feel */}
          <Grid item xs={12} lg={4}>
            <Fade in timeout={800}>
              <Card className="stats-mini-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <CardContent>
                  <Typography variant="h6" className="card-title" gutterBottom sx={{ 
                    background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Premium Overview
                  </Typography>
                  
                  <Box className="mini-stat-item">
                    <Box className="mini-stat-icon" sx={{ 
                      bgcolor: 'rgba(255, 107, 107, 0.15)',
                      boxShadow: '0 4px 12px rgba(255,107,107,0.2)',
                    }}>
                      <MeetingRoom sx={{ color: '#FF6B6B', fontSize: 28 }} />
                    </Box>
                    <Box className="mini-stat-content">
                      <Typography variant="body2" className="mini-stat-label">
                        Occupancy Rate
                      </Typography>
                      <Typography variant="h5" className="mini-stat-value" sx={{ color: '#FF6B6B' }}>
                        {stats.occupancyRate}%
                      </Typography>
                      <ProgressLinear 
                        variant="determinate" 
                        value={stats.occupancyRate} 
                        sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          bgcolor: 'rgba(255,107,107,0.2)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #FF6B6B, #FF8E8E)',
                          }
                        }} 
                      />
                    </Box>
                  </Box>

                  <Box className="mini-stat-item">
                    <Box className="mini-stat-icon" sx={{ 
                      bgcolor: 'rgba(78, 205, 196, 0.15)',
                      boxShadow: '0 4px 12px rgba(78,205,196,0.2)',
                    }}>
                      <Group sx={{ color: '#4ECDC4', fontSize: 28 }} />
                    </Box>
                    <Box className="mini-stat-content">
                      <Typography variant="body2" className="mini-stat-label">
                        Roommates
                      </Typography>
                      <Typography variant="h5" className="mini-stat-value" sx={{ color: '#4ECDC4' }}>
                        {roommates.length}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {roommates.slice(0, 3).map((mate, i) => (
                          <Avatar key={i} sx={{ width: 24, height: 24, bgcolor: '#4ECDC4' }}>
                            {mate.name?.charAt(0)}
                          </Avatar>
                        ))}
                        {roommates.length > 3 && (
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            +{roommates.length - 3}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box className="mini-stat-item">
                    <Box className="mini-stat-icon" sx={{ 
                      bgcolor: 'rgba(255, 209, 102, 0.15)',
                      boxShadow: '0 4px 12px rgba(255,209,102,0.2)',
                    }}>
                      <Payment sx={{ color: '#FFD166', fontSize: 28 }} />
                    </Box>
                    <Box className="mini-stat-content">
                      <Typography variant="body2" className="mini-stat-label">
                        Next Payment
                      </Typography>
                      <Typography variant="h5" className="mini-stat-value" sx={{ color: '#FFD166' }}>
                        {payments.length > 0 ? '₦' + payments[0]?.amount?.toLocaleString() : '—'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Box className="quick-actions">
                    <Button
                      fullWidth
                      variant="outlined"
                      className="quick-action-button"
                      onClick={() => navigate('/payments')}
                      startIcon={<Payment />}
                      sx={{ 
                        borderColor: 'rgba(255,107,107,0.3)',
                        color: '#FF6B6B',
                        '&:hover': {
                          borderColor: '#FF6B6B',
                          background: 'rgba(255,107,107,0.1)',
                        }
                      }}
                    >
                      Make Payment
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      className="quick-action-button"
                      onClick={() => navigate('/complaints/new')}
                      startIcon={<Report />}
                      sx={{ 
                        borderColor: 'rgba(78,205,196,0.3)',
                        color: '#4ECDC4',
                        '&:hover': {
                          borderColor: '#4ECDC4',
                          background: 'rgba(78,205,196,0.1)',
                        }
                      }}
                    >
                      Report Issue
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Tabs Section - Luxury Edition */}
        <Box className="tabs-section">
          <Paper className="tabs-header" sx={{ 
            background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%) !important',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <Tabs value={activeTab} onChange={handleTabChange} className="tabs">
              <Tab 
                icon={<MeetingRoom />} 
                label="Available Rooms" 
                sx={{ 
                  '&.Mui-selected': { 
                    color: '#FF6B6B !important',
                    '& .MuiTab-iconWrapper': { color: '#FF6B6B' }
                  }
                }} 
              />
              <Tab 
                icon={<Receipt />} 
                label="Payment History"
                sx={{ 
                  '&.Mui-selected': { 
                    color: '#4ECDC4 !important',
                    '& .MuiTab-iconWrapper': { color: '#4ECDC4' }
                  }
                }} 
              />
              <Tab 
                icon={<Report />} 
                label="Support Tickets"
                sx={{ 
                  '&.Mui-selected': { 
                    color: '#6C5CE7 !important',
                    '& .MuiTab-iconWrapper': { color: '#6C5CE7' }
                  }
                }} 
              />
            </Tabs>
          </Paper>

          {/* Available Rooms Tab - Luxury Cards */}
          {activeTab === 0 && (
            <Fade in>
              <Card className="content-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%) !important',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <CardContent>
                  <Box className="content-header">
                    <Typography variant="h6" sx={{ 
                      background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Available Rooms
                    </Typography>
                    <Box className="content-actions">
                      <TextField
                        placeholder="Search premium rooms..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
                            </InputAdornment>
                          ),
                        }}
                        className="search-field"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,107,107,0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#FF6B6B' },
                          }
                        }}
                      />
                      <Button
                        className="view-all-link"
                        onClick={() => navigate('/rooms')}
                        sx={{ color: '#FF6B6B' }}
                      >
                        View All <ArrowForward />
                      </Button>
                    </Box>
                  </Box>

                  {availableRooms.length === 0 ? (
                    <Box className="empty-state">
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        No premium rooms available at the moment
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {availableRooms.map((room, index) => (
                        <Grid item xs={12} sm={6} md={4} key={room._id}>
                          <Fade in timeout={900 + index * 100}>
                            <Box className="room-card" sx={{ 
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              '&:hover': {
                                borderColor: '#FF6B6B',
                                boxShadow: '0 20px 40px rgba(255,107,107,0.2)',
                              }
                            }}>
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
                                  label="Premium"
                                  size="small"
                                  className="room-status"
                                  sx={{ 
                                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E) !important',
                                    color: '#fff !important',
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              <Box className="room-info">
                                <Box className="room-header">
                                  <Typography variant="subtitle1" className="room-number" sx={{ color: '#FF6B6B' }}>
                                    {room.roomNumber}
                                  </Typography>
                                  <Typography variant="subtitle1" className="room-price" sx={{ color: '#4ECDC4' }}>
                                    ₦{room.price.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" className="room-location">
                                  <LocationOn sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />
                                  {room.blockName}, Floor {room.floorNumber}
                                </Typography>
                                <Box className="room-amenities">
                                  {room.amenities?.slice(0, 3).map(amenity => (
                                    <Chip
                                      key={amenity}
                                      label={amenity}
                                      size="small"
                                      className="amenity-chip"
                                      sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.05) !important',
                                        color: 'rgba(255,255,255,0.7) !important',
                                      }}
                                    />
                                  ))}
                                </Box>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  className="view-room-btn"
                                  onClick={() => navigate(`/rooms/${room._id}`)}
                                  sx={{ 
                                    borderColor: 'rgba(255,107,107,0.3)',
                                    color: '#FF6B6B',
                                    '&:hover': {
                                      borderColor: '#FF6B6B',
                                      background: 'rgba(255,107,107,0.1)',
                                    }
                                  }}
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
              <Card className="content-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%) !important',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <CardContent>
                  <Box className="content-header">
                    <Typography variant="h6" sx={{ 
                      background: 'linear-gradient(135deg, #4ECDC4, #FFD166)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Transaction History
                    </Typography>
                    <Button
                      className="view-all-link"
                      onClick={() => navigate('/payments')}
                      sx={{ color: '#4ECDC4' }}
                    >
                      View All <ArrowForward />
                    </Button>
                  </Box>

                  {payments.length === 0 ? (
                    <Box className="empty-state">
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        No transaction history yet
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="payment-list">
                      {payments.slice(0, 5).map((payment, index) => (
                        <Fade in timeout={900 + index * 100} key={payment._id}>
                          <Box className="payment-item" sx={{ 
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            '&:hover': {
                              borderColor: '#4ECDC4',
                            }
                          }}>
                            <Box className="payment-info">
                              <Box>
                                <Typography variant="subtitle2" className="payment-amount" sx={{ color: '#4ECDC4' }}>
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
                                sx={{ 
                                  bgcolor: payment.status === 'success' ? 'rgba(78,205,196,0.15) !important' : 'rgba(255,209,102,0.15) !important',
                                  color: payment.status === 'success' ? '#4ECDC4 !important' : '#FFD166 !important',
                                }}
                              />
                              <IconButton size="small" className="payment-menu">
                                <MoreVert sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
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
              <Card className="content-card" sx={{ 
                background: 'linear-gradient(145deg, rgba(26,26,35,0.9) 0%, rgba(18,18,24,0.95) 100%) !important',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <CardContent>
                  <Box className="content-header">
                    <Typography variant="h6" sx={{ 
                      background: 'linear-gradient(135deg, #6C5CE7, #9A8CFF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Support Tickets
                    </Typography>
                    <Button
                      className="view-all-link"
                      onClick={() => navigate('/complaints')}
                      sx={{ color: '#6C5CE7' }}
                    >
                      View All <ArrowForward />
                    </Button>
                  </Box>

                  {tickets.length === 0 ? (
                    <Box className="empty-state">
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        No support tickets yet
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="ticket-list">
                      {tickets.slice(0, 5).map((ticket, index) => (
                        <Fade in timeout={900 + index * 100} key={ticket._id}>
                          <Box className="ticket-item" sx={{ 
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            '&:hover': {
                              borderColor: '#6C5CE7',
                            }
                          }}>
                            <Box className="ticket-info">
                              <Box className="ticket-header">
                                <Typography variant="subtitle2" className="ticket-title">
                                  {ticket.title}
                                </Typography>
                                <Chip
                                  label={ticket.priority}
                                  size="small"
                                  className={`ticket-priority ${ticket.priority}`}
                                  sx={{ 
                                    bgcolor: ticket.priority === 'high' ? 'rgba(255,107,107,0.15) !important' : 
                                           ticket.priority === 'medium' ? 'rgba(255,209,102,0.15) !important' : 
                                           'rgba(78,205,196,0.15) !important',
                                    color: ticket.priority === 'high' ? '#FF6B6B !important' : 
                                           ticket.priority === 'medium' ? '#FFD166 !important' : 
                                           '#4ECDC4 !important',
                                  }}
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
                                sx={{ 
                                  bgcolor: ticket.status === 'resolved' ? 'rgba(78,205,196,0.15) !important' : 
                                          ticket.status === 'in_progress' ? 'rgba(108,92,231,0.15) !important' : 
                                          'rgba(255,209,102,0.15) !important',
                                  color: ticket.status === 'resolved' ? '#4ECDC4 !important' : 
                                          ticket.status === 'in_progress' ? '#6C5CE7 !important' : 
                                          '#FFD166 !important',
                                }}
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

      {/* Add keyframe animation for shimmer effect */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
        `}
      </style>
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