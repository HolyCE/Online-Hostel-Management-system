import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Download, Eye, CheckCircle, XCircle, Clock, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Payment {
  _id: string;
  reference: string;
  student: { name: string; email: string; matricNumber: string };
  amount: number;
  status: string;
  paymentDate: string;
  paymentMethod: string;
  sessionYear: string;
  semester: string;
  createdAt: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/payments/admin/all`, { headers });
      const data = response.data.data || [];
      setPayments(data);
      
      const successful = data.filter((p: Payment) => p.status === 'success');
      const pending = data.filter((p: Payment) => p.status === 'pending');
      const failed = data.filter((p: Payment) => p.status === 'failed');
      const totalRevenue = successful.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      
      setStats({
        totalRevenue,
        successfulCount: successful.length,
        pendingCount: pending.length,
        failedCount: failed.length
      });
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: Payment[], filename: string) => {
    // Define CSV headers
    const headers = [
      'Reference',
      'Student Name',
      'Student Email',
      'Matric Number',
      'Amount (₦)',
      'Status',
      'Payment Date',
      'Payment Method',
      'Session Year',
      'Semester'
    ];

    // Convert data to CSV rows
    const rows = data.map(payment => [
      payment.reference,
      payment.student?.name || 'N/A',
      payment.student?.email || 'N/A',
      payment.student?.matricNumber || 'N/A',
      payment.amount.toString(),
      payment.status,
      payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString(),
      payment.paymentMethod || 'N/A',
      payment.sessionYear,
      payment.semester
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    setExporting(true);
    try {
      const filename = `payments_all_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(filteredPayments, filename);
      toast.success(`Exported ${filteredPayments.length} payment records`);
    } catch (error) {
      toast.error('Failed to export payments');
    } finally {
      setExporting(false);
      setShowExportOptions(false);
    }
  };

  const handleExportFiltered = () => {
    setExporting(true);
    try {
      let filteredData = [...payments];
      
      // Apply filters
      if (filterStatus) {
        filteredData = filteredData.filter(p => p.status === filterStatus);
      }
      if (filterSession) {
        filteredData = filteredData.filter(p => p.sessionYear === filterSession);
      }
      if (filterStartDate) {
        filteredData = filteredData.filter(p => new Date(p.paymentDate || p.createdAt) >= new Date(filterStartDate));
      }
      if (filterEndDate) {
        filteredData = filteredData.filter(p => new Date(p.paymentDate || p.createdAt) <= new Date(filterEndDate));
      }
      if (search) {
        filteredData = filteredData.filter(p => 
          p.reference.toLowerCase().includes(search.toLowerCase()) || 
          p.student?.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const filename = `payments_filtered_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(filteredData, filename);
      toast.success(`Exported ${filteredData.length} filtered payment records`);
    } catch (error) {
      toast.error('Failed to export filtered payments');
    } finally {
      setExporting(false);
      setShowExportOptions(false);
    }
  };

  const handleExportSuccessOnly = () => {
    setExporting(true);
    try {
      const successPayments = payments.filter(p => p.status === 'success');
      const filename = `payments_success_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(successPayments, filename);
      toast.success(`Exported ${successPayments.length} successful payment records`);
    } catch (error) {
      toast.error('Failed to export successful payments');
    } finally {
      setExporting(false);
      setShowExportOptions(false);
    }
  };

  const sessions = [...new Set(payments.map(p => p.sessionYear))].sort().reverse();
  const statuses = ['success', 'pending', 'failed'];

  const filteredPayments = payments.filter(payment => {
    if (search && !payment.reference.toLowerCase().includes(search.toLowerCase()) && !payment.student?.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && payment.status !== filterStatus) return false;
    if (filterSession && payment.sessionYear !== filterSession) return false;
    if (filterStartDate && new Date(payment.paymentDate || payment.createdAt) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(payment.paymentDate || payment.createdAt) > new Date(filterEndDate)) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Payment Management</h1>
          <p className="text-gray-600">Track and manage all student payments</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
              <div className="p-2">
                <button
                  onClick={handleExportAll}
                  disabled={exporting}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export All Payments
                </button>
                <button
                  onClick={handleExportFiltered}
                  disabled={exporting}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Export with Current Filters
                </button>
                <button
                  onClick={handleExportSuccessOnly}
                  disabled={exporting}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Export Successful Only
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => setShowExportOptions(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <p className="text-green-600 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-700 mb-2">₦{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-500">All time</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <p className="text-blue-600 text-sm mb-1">Successful</p>
          <p className="text-3xl font-bold text-blue-700 mb-2">{stats.successfulCount}</p>
          <p className="text-xs text-blue-500">Transactions</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <p className="text-yellow-600 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-700 mb-2">{stats.pendingCount}</p>
          <p className="text-xs text-yellow-500">Awaiting confirmation</p>
        </div>
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <p className="text-red-600 text-sm mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-700 mb-2">{stats.failedCount}</p>
          <p className="text-xs text-red-500">Need attention</p>
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
              placeholder="Search by reference or student..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Status</option>
                  {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                <select
                  value={filterSession}
                  onChange={e => setFilterSession(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Sessions</option>
                  {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={e => setFilterStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={e => setFilterEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Session</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map(payment => (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-black">{payment.reference?.slice(0, 12)}...</td>
                  <td className="px-6 py-4 text-sm text-black">{payment.student?.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-black">₦{payment.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate || payment.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.sessionYear}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toast(`Payment Reference: ${payment.reference}\nAmount: ₦${payment.amount}\nStatus: ${payment.status}`, { icon: '📄' })}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payment records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
