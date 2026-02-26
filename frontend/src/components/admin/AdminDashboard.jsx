import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService, roomService, paymentService, ticketService } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    overview: {
      totalStudents: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      occupancyRate: '0%',
      totalPayments: 0,
      pendingPayments: 0,
      totalTickets: 0,
      pendingTickets: 0,
      waitingList: 0
    },
    recentActivities: [],
    payments: [],
    tickets: []
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all admin data
      const [statsRes, paymentsRes, ticketsRes] = await Promise.all([
        adminService.getDashboardStats(),
        paymentService.getAllPayments({ limit: 10 }),
        ticketService.getAllTickets({ limit: 10 })
      ]);

      setStats({
        overview: statsRes.data.data.overview,
        recentActivities: statsRes.data.data.recentActivities || [],
        payments: paymentsRes.data.data || [],
        tickets: ticketsRes.data.data || []
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="welcome-text">Welcome back, {user?.name}</p>
          </div>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Refresh Data
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Key Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-label">Total Students</div>
              <div className="stat-value">{stats.overview.totalStudents}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛏️</div>
            <div className="stat-content">
              <div className="stat-label">Occupancy Rate</div>
              <div className="stat-value">{stats.overview.occupancyRate}</div>
              <div className="stat-detail">
                {stats.overview.occupiedRooms}/{stats.overview.totalRooms} rooms
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">₦{stats.overview.totalPayments?.toLocaleString()}</div>
              <div className="stat-detail">{stats.overview.pendingPayments} pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-content">
              <div className="stat-label">Open Tickets</div>
              <div className="stat-value">{stats.overview.pendingTickets}</div>
              <div className="stat-detail">{stats.overview.totalTickets} total</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="quick-stats-grid">
          <div className="quick-stat">
            <span className="quick-stat-label">Available Rooms</span>
            <span className="quick-stat-value">{stats.overview.availableRooms}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">Waiting List</span>
            <span className="quick-stat-value">{stats.overview.waitingList}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">Payment Compliance</span>
            <span className="quick-stat-value">
              {((stats.overview.totalStudents - stats.overview.pendingPayments) / stats.overview.totalStudents * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="table-container">
          <h2>Recent Payments</h2>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.student?.name || 'N/A'}</td>
                  <td>₦{payment.amount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.reference?.slice(0, 8)}...</td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Tickets */}
        <div className="table-container">
          <h2>Recent Complaints</h2>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td>{ticket.student?.name || 'N/A'}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.category}</td>
                  <td>
                    <span className={`badge badge-${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activities */}
        {stats.recentActivities.length > 0 && (
          <div className="activities-container">
            <h2>Recent Activities</h2>
            <div className="activities-list">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-user">{activity.user?.name || 'System'}</span>
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-details">{activity.details}</span>
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
