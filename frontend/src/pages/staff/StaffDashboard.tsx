import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, Clock, CheckCircle, AlertTriangle, 
  MessageSquare, User, Calendar, ChevronRight,
  X, Send, Home
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  student: { name: string; email: string };
  room: { roomNumber: string; blockName: string };
  assignedTo?: { name: string };
  createdAt: string;
  resolvedAt?: string;
  comments: any[];
}

const StaffDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/tickets/admin/all`, { headers });
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/tickets/${id}`, { status }, { headers });
      fetchTickets();
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  const addComment = async () => {
    if (!selectedTicket || !comment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/tickets/${selectedTicket._id}/comments`, 
        { comment },
        { headers }
      );
      setComment('');
      fetchTickets();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const stats = [
    { label: 'Assigned', value: tickets.length, icon: Wrench },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length, icon: Clock },
    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle },
    { label: 'Emergency', value: tickets.filter(t => t.priority === 'emergency').length, icon: AlertTriangle },
  ];

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'low': return 'bg-gray-100 text-black';
      case 'medium': return 'bg-gray-200 text-black';
      case 'high': return 'bg-gray-300 text-black';
      case 'emergency': return 'bg-gray-400 text-white';
      default: return 'bg-gray-100 text-black';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-gray-100 text-black';
      case 'assigned': return 'bg-gray-200 text-black';
      case 'in_progress': return 'bg-gray-300 text-black';
      case 'resolved': return 'bg-gray-400 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-100 text-black';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Staff Dashboard</h1>
        <p className="text-gray-600">Manage your assigned maintenance tasks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-8 h-8 text-black" />
              <span className="text-3xl font-bold text-black">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">Assigned Tickets</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {tickets.map(ticket => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-black">{ticket.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.student?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      {ticket.room?.roomNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tickets assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">{selectedTicket.title}</h2>
                <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-black mb-2">Description</h3>
                <p className="text-gray-600">{selectedTicket.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-black mb-1">Student</h3>
                  <p className="text-gray-600">{selectedTicket.student?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Room</h3>
                  <p className="text-gray-600">{selectedTicket.room?.roomNumber} - {selectedTicket.room?.blockName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Category</h3>
                  <p className="text-gray-600 capitalize">{selectedTicket.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Submitted</h3>
                  <p className="text-gray-600">{formatDate(selectedTicket.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-black mb-2">Comments</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedTicket.comments?.map((c, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-black">{c.user?.name || 'Staff'}</span>
                        <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{c.comment}</p>
                    </div>
                  ))}
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex gap-2">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <button
                    onClick={addComment}
                    disabled={!comment.trim()}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedTicket.status === 'pending' && (
                  <button
                    onClick={() => updateTicketStatus(selectedTicket._id, 'in_progress')}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                  >
                    Start Working
                  </button>
                )}
                {selectedTicket.status === 'in_progress' && (
                  <button
                    onClick={() => updateTicketStatus(selectedTicket._id, 'resolved')}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;