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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Divider,
  AvatarGroup,
  Tooltip,
  Zoom,
  Fade,
  Grow,
  Slide,
} from '@mui/material';
import {
  MeetingRoom,
  Payment,
  Report,
  Search,
  FilterList,
  GridView,
  ViewList,
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
  MoreVert,
  Refresh,
  Download,
  Share,
  Notifications,
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
  AccessTime,
  EventAvailable,
  EventBusy,
  Assessment,
  Dashboard as DashboardIcon,
  Person,
  Group,
  Room,
  Receipt,
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
  Dry,
  Iron,
  Microwave,
  Coffee,
  Tapas,
  Liquor,
  WineBar,
  SportsBar,
  Nightlife,
  Casino,
  GolfCourse,
  Spa,
  Deck,
  Landscape,
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
  RVHookup,
  GolfCourse as Golf,
  Tennis,
  SportsBasketball,
  SportsSoccer,
  SportsTennis,
  SportsVolleyball,
  SportsGymnastics,
  SportsHandball,
  SportsRugby,
  SportsBaseball,
  SportsFootball,
  SportsHockey,
  SportsCricket,
  SportsMma,
  SportsKabaddi,
  SportsEsports,
  SportsBar as Sports,
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
  ComposedChart,
  Scatter,
} from 'recharts';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Sample data for hostel management
const spendingData = [
  { month: 'AUG', accommodation: 45000, food: 12500, utilities: 8500, total: 66000 },
  { month: 'SEP', accommodation: 45000, food: 13200, utilities: 8200, total: 66400 },
  { month: 'OCT', accommodation: 45000, food: 12800, utilities: 8900, total: 66700 },
  { month: 'NOV', accommodation: 45000, food: 13500, utilities: 9100, total: 67600 },
  { month: 'DEC', accommodation: 45000, food: 14200, utilities: 9500, total: 68700 },
];

const categoryData = [
  { name: 'Accommodation Fee', value: 45000, color: '#6366F1', icon: '🏠', change: '+0%' },
  { name: 'Food & Dining', value: 14200, color: '#8B5CF6', icon: '🍽️', change: '+12%' },
  { name: 'Utilities', value: 9500, color: '#EC4899', icon: '💡', change: '+8%' },
  { name: 'Laundry', value: 3200, color: '#14B8A6', icon: '🧺', change: '+5%' },
  { name: 'Activities', value: 2800, color: '#F97316', icon: '🎮', change: '+15%' },
];

const roomStatsData = [
  { status: 'Available Rooms', count: 24, change: '+3', trend: 'up', color: '#10B981' },
  { status: 'Occupied Rooms', count: 156, change: '+12', trend: 'up', color: '#6366F1' },
  { status: 'Maintenance', count: 8, change: '-2', trend: 'down', color: '#F59E0B' },
  { status: 'Cleaning', count: 12, change: '+1', trend: 'up', color: '#8B5CF6' },
];

const recentBookings = [
  { id: '#BK-2024-001', student: 'John Doe', room: 'B204', amount: 45000, status: 'confirmed', date: '2024-02-24', checkIn: '2024-03-01', checkOut: '2024-05-31' },
  { id: '#BK-2024-002', student: 'Jane Smith', room: 'A108', amount: 55000, status: 'pending', date: '2024-02-23', checkIn: '2024-03-05', checkOut: '2024-06-05' },
  { id: '#BK-2024-003', student: 'Mike Johnson', room: 'C315', amount: 38000, status: 'confirmed', date: '2024-02-22', checkIn: '2024-03-10', checkOut: '2024-06-10' },
  { id: '#BK-2024-004', student: 'Sarah Williams', room: 'D401', amount: 62000, status: 'completed', date: '2024-02-21', checkIn: '2024-02-01', checkOut: '2024-04-30' },
  { id: '#BK-2024-005', student: 'Alex Brown', room: 'E203', amount: 41000, status: 'pending', date: '2024-02-20', checkIn: '2024-03-15', checkOut: '2024-06-15' },
  { id: '#BK-2024-006', student: 'Emily Davis', room: 'F102', amount: 48000, status: 'confirmed', date: '2024-02-19', checkIn: '2024-03-20', checkOut: '2024-06-20' },
];

const maintenanceRequests = [
  { id: '#MT-001', student: 'John Doe', room: 'B204', issue: 'Broken AC', priority: 'high', status: 'in-progress', date: '2024-02-24' },
  { id: '#MT-002', student: 'Jane Smith', room: 'A108', issue: 'Leaking Pipe', priority: 'urgent', status: 'pending', date: '2024-02-23' },
  { id: '#MT-003', student: 'Mike Johnson', room: 'C315', issue: 'Light not working', priority: 'low', status: 'resolved', date: '2024-02-22' },
  { id: '#MT-004', student: 'Sarah Williams', room: 'D401', issue: 'WiFi issue', priority: 'medium', status: 'in-progress', date: '2024-02-21' },
  { id: '#MT-005', student: 'Alex Brown', room: 'E203', issue: 'Door lock broken', priority: 'high', status: 'pending', date: '2024-02-20' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [selectedChart, setSelectedChart] = useState('all');
  const [showStats, setShowStats] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // User's actual data from backend
  const [userRoom, setUserRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    totalPayments: 0,
    daysRemaining: 180,
    roomNumber: null,
    blockName: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [roomRes, roomsRes, paymentsRes, ticketsRes] = await Promise.all([
        axios.get(`${API_URL}/rooms/student/my-room`).catch(() => ({ data: { data: null } })),
        axios.get(`${API_URL}/rooms/available`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/payments/my-payments`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/tickets/my-tickets`).catch(() => ({ data: { data: [] } })),
      ]);

      const room = roomRes.data.data;
      const available = roomsRes.data.data || [];
      const paymentsList = paymentsRes.data.data || [];
      const ticketsList = ticketsRes.data.data || [];

      setUserRoom(room);
      setAvailableRooms(available.filter(r => r.status === 'available').slice(0, 6));
      setPayments(paymentsList);
      setTickets(ticketsList);

      const totalSpent = paymentsList
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalSpent,
        pendingTickets: ticketsList.filter(t => t.status === 'pending').length,
        resolvedTickets: ticketsList.filter(t => t.status === 'resolved').length,
        totalPayments: paymentsList.length,
        daysRemaining: room ? calculateDaysRemaining(room) : 0,
        roomNumber: room?.roomNumber || null,
        blockName: room?.blockName || null,
      });

    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (room) => {
    // Mock calculation - in reality, would use session dates
    return 165;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredRooms = availableRooms.filter(room =>
    room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.blockName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box className="loading-screen">
        <Box className="loading-content">
          <Box className="loading-spinner">
            <Box className="spinner-ring"></Box>
            <Box className="spinner-ring"></Box>
            <Box className="spinner-ring"></Box>
          </Box>
          <Typography variant="h5" className="loading-text">
            Loading your hostel dashboard...
          </Typography>
          <Typography variant="body2" className="loading-subtext">
            Preparing your accommodation overview
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="dashboard">
      {/* Animated Background */}
      <Box className="dashboard-bg">
        <Box className="bg-gradient"></Box>
        <Box className="bg-particles">
          {[...Array(30)].map((_, i) => (
            <Box key={i} className={`particle particle-${i % 5}`} />
          ))}
        </Box>
      </Box>

      <Container maxWidth="xl" className="dashboard-container">
        {/* Header Section */}
        <Box className="dashboard-header">
          <Box className="header-left">
            <Box className="welcome-badge">
              <span className="badge-dot"></span>
              <Typography variant="body2" className="badge-text">
                STUDENT DASHBOARD
              </Typography>
            </Box>
            <Typography variant="h3" className="welcome-title">
              Hello, {user?.name || 'Barbara'}! 
              <span className="title-emoji">🏠</span>
            </Typography>
            <Typography variant="body1" className="welcome-subtitle">
              Here's what's happening in your hostel this {timeRange}.
            </Typography>
          </Box>

          <Box className="header-right">
            <Box className="time-range-selector">
              <Button 
                className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button 
                className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button 
                className={`time-btn ${timeRange === 'semester' ? 'active' : ''}`}
                onClick={() => setTimeRange('semester')}
              >
                Semester
              </Button>
            </Box>

            <Box className="header-actions">
              <Tooltip title="Refresh Data">
                <IconButton className="action-btn">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton className="action-btn">
                  <Badge badgeContent={stats.pendingTickets} color="error">
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

        {/* Stats Cards Section - Student Specific */}
        <Grid container spacing={3} className="stats-grid">
          <Grid item xs={12} md={4}>
            <Zoom in timeout={300}>
              <Card className="stat-card room-status">
                <Box className="card-gradient"></Box>
                <CardContent className="stat-content">
                  <Box className="stat-icon-wrapper">
                    <Box className="stat-icon">
                      <Home />
                    </Box>
                  </Box>
                  <Box className="stat-info">
                    <Typography variant="body2" className="stat-label">
                      Room Status
                    </Typography>
                    <Typography variant="h3" className="stat-value">
                      {userRoom ? 'Allocated' : 'No Room'}
                    </Typography>
                    <Box className="stat-trend">
                      {userRoom ? (
                        <>
                          <Box className="trend-indicator up">
                            <CheckCircle />
                            <Typography variant="body2">{userRoom.roomNumber}</Typography>
                          </Box>
                          <Typography variant="caption" className="trend-period">
                            {userRoom.blockName}, Floor {userRoom.floorNumber}
                          </Typography>
                        </>
                      ) : (
                        <Button 
                          size="small" 
                          className="apply-btn"
                          onClick={() => navigate('/rooms')}
                        >
                          Apply Now
                          <ArrowForward />
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} md={4}>
            <Zoom in timeout={400}>
              <Card className="stat-card total-spent">
                <Box className="card-gradient"></Box>
                <CardContent className="stat-content">
                  <Box className="stat-icon-wrapper">
                    <Box className="stat-icon">
                      <AccountBalanceWallet />
                    </Box>
                  </Box>
                  <Box className="stat-info">
                    <Typography variant="body2" className="stat-label">
                      Total Spent
                    </Typography>
                    <Typography variant="h3" className="stat-value">
                      ₦{stats.totalSpent.toLocaleString()}
                    </Typography>
                    <Box className="stat-trend">
                      <Box className="trend-indicator up">
                        <TrendingUp />
                        <Typography variant="body2'>+12.5%</Typography>
                      </Box>
                      <Typography variant="caption" className="trend-period">
                        This semester
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} md={4}>
            <Zoom in timeout={500}>
              <Card className="stat-card session-progress">
                <Box className="card-gradient"></Box>
                <CardContent className="stat-content">
                  <Box className="stat-icon-wrapper">
                    <Box className="stat-icon">
                      <CalendarToday />
                    </Box>
                  </Box>
                  <Box className="stat-info">
                    <Typography variant="body2" className="stat-label">
                      Session Progress
                    </Typography>
                    <Typography variant="h3" className="stat-value">
                      {stats.daysRemaining} days
                    </Typography>
                    <Box className="stat-trend">
                      <Box className="trend-indicator">
                        <AccessTime />
                        <Typography variant="body2">Remaining</Typography>
                      </Box>
                      <Typography variant="caption" className="trend-period">
                        of 180 days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Charts Section - Spending Breakdown */}
        <Grid container spacing={3} className="charts-section">
          <Grid item xs={12} lg={8}>
            <Grow in timeout={600}>
              <Card className="chart-card spending-chart">
                <CardContent>
                  <Box className="chart-header">
                    <Box>
                      <Typography variant="h5" className="chart-title">
                        Spending Overview
                      </Typography>
                      <Typography variant="body2" className="chart-subtitle">
                        This month vs last month
                      </Typography>
                    </Box>
                    <Box className="chart-actions">
                      <Button 
                        className={`chart-action-btn ${selectedChart === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedChart('all')}
                      >
                        All
                      </Button>
                      <Button 
                        className={`chart-action-btn ${selectedChart === 'accommodation' ? 'active' : ''}`}
                        onClick={() => setSelectedChart('accommodation')}
                      >
                        Accommodation
                      </Button>
                      <Button 
                        className={`chart-action-btn ${selectedChart === 'food' ? 'active' : ''}`}
                        onClick={() => setSelectedChart('food')}
                      >
                        Food
                      </Button>
                    </Box>
                  </Box>
                  <Box className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={spendingData}>
                        <defs>
                          <linearGradient id="accommodationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="foodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="utilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="month" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)' }}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)' }}
                        />
                        <ChartTooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                          }}
                          labelStyle={{ color: 'white' }}
                        />
                        {selectedChart === 'all' ? (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="accommodation" 
                              stackId="1"
                              stroke="#6366F1"
                              strokeWidth={2}
                              fill="url(#accommodationGradient)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="food" 
                              stackId="1"
                              stroke="#8B5CF6"
                              strokeWidth={2}
                              fill="url(#foodGradient)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="utilities" 
                              stackId="1"
                              stroke="#EC4899"
                              strokeWidth={2}
                              fill="url(#utilitiesGradient)" 
                            />
                          </>
                        ) : (
                          <Area 
                            type="monotone" 
                            dataKey={selectedChart} 
                            stroke={selectedChart === 'accommodation' ? '#6366F1' : selectedChart === 'food' ? '#8B5CF6' : '#EC4899'}
                            strokeWidth={3}
                            fill={`url(#${selectedChart}Gradient)`}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Grow in timeout={700}>
              <Card className="chart-card category-chart">
                <CardContent>
                  <Typography variant="h5" className="chart-title">
                    Expense Breakdown
                  </Typography>
                  <Typography variant="body2" className="chart-subtitle">
                    This month vs last month
                  </Typography>
                  <Box className="category-list">
                    {categoryData.map((item, index) => (
                      <Fade in timeout={800 + index * 100} key={item.name}>
                        <Box className="category-item">
                          <Box className="category-info">
                            <Box className="category-icon" sx={{ bgcolor: `${item.color}20` }}>
                              <span>{item.icon}</span>
                            </Box>
                            <Box className="category-details">
                              <Typography variant="body2" className="category-name">
                                {item.name}
                              </Typography>
                              <Box className="category-progress">
                                <Box 
                                  className="progress-bar" 
                                  sx={{ 
                                    width: `${(item.value / 50000) * 100}%`,
                                    bgcolor: item.color,
                                  }} 
                                />
                              </Box>
                            </Box>
                          </Box>
                          <Box className="category-value-section">
                            <Typography variant="h6" className="category-value">
                              ₦{item.value.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" className={`category-change ${item.change.includes('+') ? 'up' : 'down'}`}>
                              {item.change}
                            </Typography>
                          </Box>
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Quick Actions & Stats Section */}
        <Grid container spacing={3} className="quick-actions-section">
          <Grid item xs={12} md={6}>
            <Slide direction="right" in timeout={800}>
              <Card className="quick-actions-card">
                <CardContent>
                  <Typography variant="h5" className="quick-actions-title">
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2} className="quick-actions-grid">
                    <Grid item xs={6} sm={3}>
                      <Button 
                        className="quick-action-btn"
                        onClick={() => navigate('/rooms')}
                      >
                        <Box className="quick-action-icon">
                          <MeetingRoom />
                        </Box>
                        <Typography variant="body2">Browse Rooms</Typography>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Button 
                        className="quick-action-btn"
                        onClick={() => navigate('/payments')}
                      >
                        <Box className="quick-action-icon">
                          <Payment />
                        </Box>
                        <Typography variant="body2">Make Payment</Typography>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Button 
                        className="quick-action-btn"
                        onClick={() => navigate('/complaints')}
                      >
                        <Box className="quick-action-icon">
                          <Report />
                        </Box>
                        <Typography variant="body2">Report Issue</Typography>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Button 
                        className="quick-action-btn"
                        onClick={() => navigate('/profile')}
                      >
                        <Box className="quick-action-icon">
                          <Person />
                        </Box>
                        <Typography variant="body2">My Profile</Typography>
                      </Button>
                    </Grid>
                  </Grid>

                  <Box className="roommate-section">
                    <Typography variant="subtitle1" className="roommate-title">
                      Roommates
                    </Typography>
                    <AvatarGroup max={4} className="roommate-avatars">
                      <Avatar src="https://i.pravatar.cc/150?img=1" />
                      <Avatar src="https://i.pravatar.cc/150?img=2" />
                      <Avatar src="https://i.pravatar.cc/150?img=3" />
                      <Avatar src="https://i.pravatar.cc/150?img=4" />
                      <Avatar src="https://i.pravatar.cc/150?img=5" />
                    </AvatarGroup>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={900}>
              <Card className="hostel-stats-card">
                <CardContent>
                  <Typography variant="h5" className="hostel-stats-title">
                    Hostel Overview
                  </Typography>
                  <Grid container spacing={2} className="hostel-stats-grid">
                    {roomStatsData.map((item, index) => (
                      <Grid item xs={6} key={item.status}>
                        <Fade in timeout={1000 + index * 100}>
                          <Box className="hostel-stat-item">
                            <Box className="hostel-stat-header">
                              <Box 
                                className="hostel-stat-dot" 
                                sx={{ bgcolor: item.color }}
                              />
                              <Typography variant="body2" className="hostel-stat-label">
                                {item.status}
                              </Typography>
                            </Box>
                            <Box className="hostel-stat-value">
                              <Typography variant="h4" className="stat-main">
                                {item.count}
                              </Typography>
                              <Box className={`stat-change ${item.trend}`}>
                                {item.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                                <Typography variant="caption">{item.change}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        </Grid>

        {/* Tabs for Recent Activity */}
        <Box className="tabs-section">
          <Paper className="tabs-container">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className="dashboard-tabs"
              variant="fullWidth"
            >
              <Tab icon={<Receipt />} label="Recent Bookings" />
              <Tab icon={<Report />} label="Maintenance Requests" />
              <Tab icon={<Payment />} label="Payment History" />
            </Tabs>
          </Paper>

          {/* Recent Bookings Tab */}
          {activeTab === 0 && (
            <Fade in>
              <Card className="recent-list-card">
                <CardContent>
                  <Box className="list-header">
                    <Typography variant="h6">Recent Bookings</Typography>
                    <Button className="view-all-btn" onClick={() => navigate('/bookings')}>
                      View All <ArrowForward />
                    </Button>
                  </Box>
                  <Box className="table-container">
                    <table className="recent-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Student</th>
                          <th>Room</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking, index) => (
                          <Fade in timeout={1200 + index * 100} key={booking.id}>
                            <tr className="table-row">
                              <td>
                                <Typography variant="body2" className="booking-id">
                                  {booking.id}
                                </Typography>
                              </td>
                              <td>
                                <Box className="customer-info">
                                  <Avatar className="customer-avatar">
                                    {booking.student.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {booking.student}
                                  </Typography>
                                </Box>
                              </td>
                              <td>
                                <Typography variant="body2" className="room-number">
                                  {booking.room}
                                </Typography>
                              </td>
                              <td>
                                <Typography variant="body2" className="booking-amount">
                                  ₦{booking.amount.toLocaleString()}
                                </Typography>
                              </td>
                              <td>
                                <Chip
                                  label={booking.status}
                                  size="small"
                                  className={`booking-status ${booking.status}`}
                                />
                              </td>
                              <td>
                                <Typography variant="body2" className="booking-date">
                                  {booking.checkIn}
                                </Typography>
                              </td>
                              <td>
                                <Typography variant="body2" className="booking-date">
                                  {booking.checkOut}
                                </Typography>
                              </td>
                            </tr>
                          </Fade>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Maintenance Requests Tab */}
          {activeTab === 1 && (
            <Fade in>
              <Card className="recent-list-card">
                <CardContent>
                  <Box className="list-header">
                    <Typography variant="h6">Maintenance Requests</Typography>
                    <Button className="view-all-btn" onClick={() => navigate('/complaints')}>
                      View All <ArrowForward />
                    </Button>
                  </Box>
                  <Box className="table-container">
                    <table className="recent-table">
                      <thead>
                        <tr>
                          <th>Request ID</th>
                          <th>Student</th>
                          <th>Room</th>
                          <th>Issue</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceRequests.map((request, index) => (
                          <Fade in timeout={1200 + index * 100} key={request.id}>
                            <tr className="table-row">
                              <td>
                                <Typography variant="body2" className="request-id">
                                  {request.id}
                                </Typography>
                              </td>
                              <td>
                                <Box className="customer-info">
                                  <Avatar className="customer-avatar">
                                    {request.student.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {request.student}
                                  </Typography>
                                </Box>
                              </td>
                              <td>
                                <Typography variant="body2" className="room-number">
                                  {request.room}
                                </Typography>
                              </td>
                              <td>
                                <Typography variant="body2">
                                  {request.issue}
                                </Typography>
                              </td>
                              <td>
                                <Chip
                                  label={request.priority}
                                  size="small"
                                  className={`priority-${request.priority}`}
                                />
                              </td>
                              <td>
                                <Chip
                                  label={request.status}
                                  size="small"
                                  className={`request-status ${request.status}`}
                                />
                              </td>
                              <td>
                                <Typography variant="body2" className="request-date">
                                  {request.date}
                                </Typography>
                              </td>
                            </tr>
                          </Fade>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Payment History Tab */}
          {activeTab === 2 && (
            <Fade in>
              <Card className="recent-list-card">
                <CardContent>
                  <Box className="list-header">
                    <Typography variant="h6">Payment History</Typography>
                    <Button className="view-all-btn" onClick={() => navigate('/payments')}>
                      View All <ArrowForward />
                    </Button>
                  </Box>
                  {payments.length === 0 ? (
                    <Box className="empty-state">
                      <img 
                        src="https://illustrations.popsy.co/amber/payment.svg" 
                        alt="No payments"
                        className="empty-image"
                      />
                      <Typography variant="h6" className="empty-title">
                        No payments yet
                      </Typography>
                      <Typography variant="body2" className="empty-text">
                        Make your first payment to get started
                      </Typography>
                      <Button
                        variant="contained"
                        className="empty-button"
                        onClick={() => navigate('/rooms')}
                      >
                        Browse Rooms
                      </Button>
                    </Box>
                  ) : (
                    <Box className="table-container">
                      <table className="recent-table">
                        <thead>
                          <tr>
                            <th>Reference</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Method</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.slice(0, 5).map((payment, index) => (
                            <Fade in timeout={1200 + index * 100} key={payment._id}>
                              <tr className="table-row">
                                <td>
                                  <Typography variant="body2" className="payment-ref">
                                    {payment.reference?.slice(0, 10)}...
                                  </Typography>
                                </td>
                                <td>
                                  <Typography variant="body2" className="payment-amount">
                                    ₦{payment.amount?.toLocaleString()}
                                  </Typography>
                                </td>
                                <td>
                                  <Chip
                                    label={payment.status}
                                    size="small"
                                    className={`payment-status ${payment.status}`}
                                  />
                                </td>
                                <td>
                                  <Typography variant="body2" className="payment-date">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                  </Typography>
                                </td>
                                <td>
                                  <Typography variant="body2" className="payment-method">
                                    {payment.paymentMethod || 'Card'}
                                  </Typography>
                                </td>
                              </tr>
                            </Fade>
                          ))}
                        </tbody>
                      </table>
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

export default Dashboard;
