import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ChevronDown, MessageSquare, AlertCircle, AlertTriangle, 
  Info, Clock, CheckCircle, X, Send, User, Calendar, Home, Check, 
  XCircle, RefreshCw, Eye 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  student: { _id: string; name: string; email: string; matricNumber: string };
  room: { _id: string; roomNumber: string; blockName: string };
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: { name: string };
  comments: Comment[];
}

interface Comment {
  _id: string;
  user: { _id: string; name: string; role: string };
  comment: string;
  createdAt: string;
}

const AdminTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      // Increase limit to get all tickets
      const response = await axios.get(`${API_URL}/tickets/admin/all?limit=100`, { headers });
      const data = response.data.data || [];
      setTickets(data);
      
      const pending = data.filter((t: Ticket) => t.status === 'pending').length;
      const inProgress = data.filter((t: Ticket) => t.status === 'in_progress' || t.status === 'assigned').length;
      const resolved = data.filter((t: Ticket) => t.status === 'resolved' || t.status === 'closed').length;
      
      setStats({ pending, inProgress, resolved });
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    setUpdating(true);
    const loadingToast = toast.loading('Updating ticket status...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.put(
        `${API_URL}/tickets/${ticketId}`,
        { status: newStatus },
        { headers }
      );
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`Ticket status updated to ${newStatus}`);
        fetchTickets();
        
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
      }
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    
    const loadingToast = toast.loading('Adding comment...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(
        `${API_URL}/tickets/${selectedTicket._id}/comments`,
        { comment: newComment },
        { headers }
      );
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success('Comment added successfully');
        setNewComment('');
        fetchTickets();
        
        // Refresh selected ticket
        const updatedTicket = await axios.get(`${API_URL}/tickets/${selectedTicket._id}`, { headers });
        if (updatedTicket.data.success) {
          setSelectedTicket(updatedTicket.data.data);
        }
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const statuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
  const priorities = ['low', 'medium', 'high', 'emergency'];

  const filteredTickets = tickets.filter(ticket => {
    if (search && !ticket.title.toLowerCase().includes(search.toLowerCase()) && !ticket.student?.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && ticket.status !== filterStatus) return false;
    if (filterPriority && ticket.priority !== filterPriority) return false;
    return true;
  });

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
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'emergency': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'assigned': return <User className="w-3 h-3" />;
      case 'in_progress': return <RefreshCw className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'closed': return <Check className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-purple-100 text-purple-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Ticket Management</h1>
          <p className="text-gray-600">Manage and resolve student complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <p className="text-yellow-600 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-700 mb-2">{stats.pending}</p>
          <p className="text-xs text-yellow-500">Awaiting assignment</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <p className="text-blue-600 text-sm mb-1">In Progress</p>
          <p className="text-3xl font-bold text-blue-700 mb-2">{stats.inProgress}</p>
          <p className="text-xs text-blue-500">Being worked on</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <p className="text-green-600 text-sm mb-1">Resolved</p>
          <p className="text-3xl font-bold text-green-700 mb-2">{stats.resolved}</p>
          <p className="text-xs text-green-500">Completed this period</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 text-black hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Status</option>
                  {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Priority</option>
                  {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Ticket</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.map(ticket => (
                <tr key={ticket._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {
                  setSelectedTicket(ticket);
                  setShowDetailModal(true);
                }}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-black">{ticket.title}</p>
                    <p className="text-xs text-gray-500">Room {ticket.room?.roomNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">{ticket.student?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{ticket.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(ticket.priority)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(ticket.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(ticket.createdAt)}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTickets.length === 0 && (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tickets found</p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal (same as before) */}
      {/* ... (keep the existing modal code) ... */}
    </div>
  );
};

export default AdminTickets;
