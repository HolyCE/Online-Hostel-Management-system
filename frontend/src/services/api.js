import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Room Services
export const roomService = {
  getAllRooms: () => api.get('/rooms'),
  getAvailableRooms: () => api.get('/rooms/available'),
  getMyRoom: () => api.get('/rooms/my-room'),
  applyForRoom: () => api.post('/rooms/apply'),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  
  // Admin only
  createRoom: (roomData) => api.post('/rooms', roomData),
  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  adminAllocateRoom: (data) => api.post('/rooms/admin-allocate', data),
};

// Payment Services
export const paymentService = {
  initializePayment: (data) => api.post('/payments/initialize', data),
  verifyPayment: (reference) => api.get(`/payments/verify/${reference}`),
  getMyPayments: () => api.get('/payments/my-payments'),
  
  // Admin only
  getAllPayments: (params) => api.get('/payments/admin/all', { params }),
};

// Ticket Services (Complaints)
export const ticketService = {
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  addComment: (id, comment) => api.post(`/tickets/${id}/comments`, { comment }),
  
  // Admin only
  getAllTickets: (params) => api.get('/tickets/admin/all', { params }),
  updateTicketStatus: (id, data) => api.put(`/tickets/${id}`, data),
};

// Admin Services
export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getWaitingList: () => api.get('/admin/waiting-list'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  generateReport: (data) => api.post('/admin/reports', data),
};

// User Services
export const userService = {
  getAllUsers: () => api.get('/users'),
  getUserProfile: () => api.get('/users/profile'),
  updateUserProfile: (data) => api.put('/users/profile', data),
  getUserById: (id) => api.get(`/users/${id}`),
};

export default api;
