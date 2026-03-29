import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, MessageSquare, AlertCircle, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Comment {
  _id: string;
  user: { name: string; role: string };
  comment: string;
  createdAt: string;
}

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
  comments: Comment[];
}

const StudentTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electrical',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/tickets/my-tickets`, { headers });
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/tickets`, formData, { headers });
      setShowForm(false);
      fetchTickets();
      setFormData({
        title: '',
        description: '',
        category: 'electrical',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selected || !newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/tickets/${selected._id}/comments`, 
        { comment: newComment },
        { headers }
      );
      setNewComment('');
      fetchTickets();
      const updated = tickets.find(t => t._id === selected._id);
      if (updated) setSelected(updated);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'low': return <Info className="w-3 h-3" />;
      case 'medium': return <AlertCircle className="w-3 h-3" />;
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'emergency': return <AlertTriangle className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

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
      year: 'numeric',
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
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">My Tickets</h1>
          <p className="text-gray-600">{tickets.length} tickets submitted</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tickets yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          tickets.map(ticket => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(ticket)}
              className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-black">{ticket.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityIcon(ticket.priority)}
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Room: {ticket.room?.roomNumber}</span>
                    <span>•</span>
                    <span>Submitted: {formatDate(ticket.createdAt)}</span>
                    {ticket.assignedTo && (
                      <>
                        <span>•</span>
                        <span>Assigned to: {ticket.assignedTo.name}</span>
                      </>
                    )}
                  </div>
                </div>
                {ticket.comments?.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">{ticket.comments.length}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Create New Ticket</h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="furniture">Furniture</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="internet">Internet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(selected.priority)}`}>
                    Priority: {selected.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selected.status)}`}>
                    Status: {selected.status.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-black">
                    Category: {selected.category}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selected.description}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-black mb-3">Comments</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selected.comments?.map(comment => (
                      <div key={comment._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-black">{comment.user.name}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.comment}</p>
                      </div>
                    ))}
                    {(!selected.comments || selected.comments.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                    )}
                  </div>
                </div>
                
                {selected.status !== 'resolved' && selected.status !== 'closed' && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex gap-2">
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentTickets;