import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, Users, BedDouble, Ticket, DollarSign, Clock, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ReportData {
  financial: {
    totalRevenue: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    averagePaymentAmount: number;
    monthlyData: Array<{ month: string; revenue: number; count: number }>;
    bySession: Array<{ session: string; total: number; count: number }>;
  };
  occupancy: {
    totalRooms: number;
    totalCapacity: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
    byHall: Array<{ hallName: string; totalRooms: number; occupiedRooms: number; occupancyRate: number }>;
    byBlock: Array<{ blockName: string; totalRooms: number; occupiedRooms: number }>;
  };
  maintenance: {
    totalTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
    averageResolutionTime: string;
    byCategory: Array<{ category: string; total: number; resolved: number; avgTime: string }>;
    byPriority: Array<{ priority: string; count: number; resolved: number }>;
  };
}

const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAllReportData();
  }, []);

  const fetchAllReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch financial data
      const paymentsRes = await axios.get(`${API_URL}/payments/admin/all`, { headers });
      const payments = paymentsRes.data.data || [];
      
      const successful = payments.filter((p: any) => p.status === 'success');
      const pending = payments.filter((p: any) => p.status === 'pending');
      const failed = payments.filter((p: any) => p.status === 'failed');
      const totalRevenue = successful.reduce((sum: number, p: any) => sum + p.amount, 0);
      
      // Monthly data
      const monthlyData: { [key: string]: { revenue: number; count: number } } = {};
      successful.forEach((p: any) => {
        const date = new Date(p.paymentDate || p.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, count: 0 };
        }
        monthlyData[monthKey].revenue += p.amount;
        monthlyData[monthKey].count++;
      });
      
      // Session data
      const sessionData: { [key: string]: { total: number; count: number } } = {};
      successful.forEach((p: any) => {
        if (!sessionData[p.sessionYear]) {
          sessionData[p.sessionYear] = { total: 0, count: 0 };
        }
        sessionData[p.sessionYear].total += p.amount;
        sessionData[p.sessionYear].count++;
      });
      
      // Fetch occupancy data
      const roomsRes = await axios.get(`${API_URL}/rooms`, { headers });
      const rooms = roomsRes.data.data || [];
      
      const totalRooms = rooms.length;
      const totalCapacity = rooms.reduce((sum: number, r: any) => sum + r.capacity, 0);
      const occupiedRooms = rooms.filter((r: any) => r.status === 'occupied' || r.status === 'full').length;
      const availableRooms = rooms.filter((r: any) => r.status === 'available').length;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
      
      // Hall occupancy
      const halls = await axios.get(`${API_URL}/halls`, { headers });
      const hallData = halls.data.data || [];
      const byHall = hallData.map((hall: any) => ({
        hallName: hall.name,
        totalRooms: hall.totalRooms || 0,
        occupiedRooms: hall.totalRooms - hall.availableRooms,
        occupancyRate: hall.occupancyRate || 0
      }));
      
      // Block occupancy
      const blockMap: { [key: string]: { totalRooms: number; occupiedRooms: number } } = {};
      rooms.forEach((room: any) => {
        const block = room.blockName;
        if (!blockMap[block]) {
          blockMap[block] = { totalRooms: 0, occupiedRooms: 0 };
        }
        blockMap[block].totalRooms++;
        if (room.status === 'occupied' || room.status === 'full') {
          blockMap[block].occupiedRooms++;
        }
      });
      
      const byBlock = Object.entries(blockMap).map(([blockName, data]) => ({
        blockName,
        totalRooms: data.totalRooms,
        occupiedRooms: data.occupiedRooms
      }));
      
      // Fetch maintenance data
      const ticketsRes = await axios.get(`${API_URL}/tickets/admin/all`, { headers });
      const tickets = ticketsRes.data.data || [];
      
      const totalTickets = tickets.length;
      const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved').length;
      const pendingTickets = tickets.filter((t: any) => t.status === 'pending').length;
      
      // Calculate average resolution time
      const resolvedWithTime = tickets.filter((t: any) => t.resolvedAt && t.createdAt);
      let avgTimeHours = 0;
      if (resolvedWithTime.length > 0) {
        const totalTime = resolvedWithTime.reduce((sum: number, t: any) => {
          return sum + (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime());
        }, 0);
        avgTimeHours = totalTime / resolvedWithTime.length / (1000 * 60 * 60);
      }
      
      // Category breakdown
      const categoryMap: { [key: string]: { total: number; resolved: number; times: number[] } } = {};
      tickets.forEach((t: any) => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = { total: 0, resolved: 0, times: [] };
        }
        categoryMap[t.category].total++;
        if (t.status === 'resolved') {
          categoryMap[t.category].resolved++;
          if (t.resolvedAt && t.createdAt) {
            const resolutionTime = new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime();
            categoryMap[t.category].times.push(resolutionTime);
          }
        }
      });
      
      const byCategory = Object.entries(categoryMap).map(([category, data]) => {
        let avgTime = 'N/A';
        if (data.times.length > 0) {
          const avgMs = data.times.reduce((a, b) => a + b, 0) / data.times.length;
          const avgHours = avgMs / (1000 * 60 * 60);
          avgTime = avgHours < 24 ? `${avgHours.toFixed(1)} hours` : `${(avgHours / 24).toFixed(1)} days`;
        }
        return {
          category,
          total: data.total,
          resolved: data.resolved,
          avgTime
        };
      });
      
      // Priority breakdown
      const priorityMap: { [key: string]: { count: number; resolved: number } } = {};
      tickets.forEach((t: any) => {
        if (!priorityMap[t.priority]) {
          priorityMap[t.priority] = { count: 0, resolved: 0 };
        }
        priorityMap[t.priority].count++;
        if (t.status === 'resolved') {
          priorityMap[t.priority].resolved++;
        }
      });
      
      const byPriority = Object.entries(priorityMap).map(([priority, data]) => ({
        priority,
        count: data.count,
        resolved: data.resolved
      }));
      
      setReportData({
        financial: {
          totalRevenue,
          successfulPayments: successful.length,
          pendingPayments: pending.length,
          failedPayments: failed.length,
          averagePaymentAmount: successful.length > 0 ? totalRevenue / successful.length : 0,
          monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
            month,
            revenue: data.revenue,
            count: data.count
          })).sort((a, b) => a.month.localeCompare(b.month)),
          bySession: Object.entries(sessionData).map(([session, data]) => ({
            session,
            total: data.total,
            count: data.count
          })).sort((a, b) => b.session.localeCompare(a.session))
        },
        occupancy: {
          totalRooms,
          totalCapacity,
          occupiedRooms,
          availableRooms,
          occupancyRate,
          byHall,
          byBlock
        },
        maintenance: {
          totalTickets,
          resolvedTickets,
          pendingTickets,
          averageResolutionTime: avgTimeHours < 24 ? `${avgTimeHours.toFixed(1)} hours` : `${(avgTimeHours / 24).toFixed(1)} days`,
          byCategory,
          byPriority
        }
      });
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const rows = data.map(item => headers.map(header => {
      const value = item[header.toLowerCase().replace(/ /g, '_')];
      return value !== undefined ? value : '';
    }));
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateFinancialReport = () => {
    if (!reportData) return;
    setGenerating(true);
    toast.loading('Generating financial report...', { id: 'report' });
    
    try {
      const data = [
        { metric: 'Total Revenue', value: `₦${reportData.financial.totalRevenue.toLocaleString()}` },
        { metric: 'Successful Payments', value: reportData.financial.successfulPayments },
        { metric: 'Pending Payments', value: reportData.financial.pendingPayments },
        { metric: 'Failed Payments', value: reportData.financial.failedPayments },
        { metric: 'Average Payment Amount', value: `₦${reportData.financial.averagePaymentAmount.toLocaleString()}` }
      ];
      
      exportToCSV(data, 'financial_report_summary', ['Metric', 'Value']);
      
      // Also export monthly data
      if (reportData.financial.monthlyData.length > 0) {
        exportToCSV(
          reportData.financial.monthlyData,
          'financial_report_monthly',
          ['Month', 'Revenue', 'Count']
        );
      }
      
      toast.success('Financial report generated successfully!', { id: 'report' });
    } catch (error) {
      toast.error('Failed to generate financial report', { id: 'report' });
    } finally {
      setGenerating(false);
      setSelectedReport(null);
    }
  };

  const generateOccupancyReport = () => {
    if (!reportData) return;
    setGenerating(true);
    toast.loading('Generating occupancy report...', { id: 'report' });
    
    try {
      const summary = [
        { metric: 'Total Rooms', value: reportData.occupancy.totalRooms },
        { metric: 'Total Capacity', value: reportData.occupancy.totalCapacity },
        { metric: 'Occupied Rooms', value: reportData.occupancy.occupiedRooms },
        { metric: 'Available Rooms', value: reportData.occupancy.availableRooms },
        { metric: 'Occupancy Rate', value: `${reportData.occupancy.occupancyRate.toFixed(1)}%` }
      ];
      
      exportToCSV(summary, 'occupancy_report_summary', ['Metric', 'Value']);
      
      if (reportData.occupancy.byHall.length > 0) {
        exportToCSV(
          reportData.occupancy.byHall,
          'occupancy_report_by_hall',
          ['Hall Name', 'Total Rooms', 'Occupied Rooms', 'Occupancy Rate']
        );
      }
      
      toast.success('Occupancy report generated successfully!', { id: 'report' });
    } catch (error) {
      toast.error('Failed to generate occupancy report', { id: 'report' });
    } finally {
      setGenerating(false);
      setSelectedReport(null);
    }
  };

  const generateMaintenanceReport = () => {
    if (!reportData) return;
    setGenerating(true);
    toast.loading('Generating maintenance report...', { id: 'report' });
    
    try {
      const summary = [
        { metric: 'Total Tickets', value: reportData.maintenance.totalTickets },
        { metric: 'Resolved Tickets', value: reportData.maintenance.resolvedTickets },
        { metric: 'Pending Tickets', value: reportData.maintenance.pendingTickets },
        { metric: 'Average Resolution Time', value: reportData.maintenance.averageResolutionTime }
      ];
      
      exportToCSV(summary, 'maintenance_report_summary', ['Metric', 'Value']);
      
      if (reportData.maintenance.byCategory.length > 0) {
        exportToCSV(
          reportData.maintenance.byCategory,
          'maintenance_report_by_category',
          ['Category', 'Total', 'Resolved', 'Average Time']
        );
      }
      
      if (reportData.maintenance.byPriority.length > 0) {
        exportToCSV(
          reportData.maintenance.byPriority,
          'maintenance_report_by_priority',
          ['Priority', 'Count', 'Resolved']
        );
      }
      
      toast.success('Maintenance report generated successfully!', { id: 'report' });
    } catch (error) {
      toast.error('Failed to generate maintenance report', { id: 'report' });
    } finally {
      setGenerating(false);
      setSelectedReport(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black mb-2">Reports</h1>
        <p className="text-gray-600">Generate and download system reports</p>
      </motion.div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Report Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-black">Financial Report</h3>
          </div>
          {reportData && (
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-semibold text-black">₦{reportData.financial.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Successful Payments:</span>
                <span className="font-semibold text-black">{reportData.financial.successfulPayments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Payment:</span>
                <span className="font-semibold text-black">₦{reportData.financial.averagePaymentAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
          <p className="text-gray-500 text-sm mb-4">Generate payment summary and revenue reports</p>
          <button 
            onClick={generateFinancialReport}
            disabled={generating}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Generate Report
          </button>
        </div>

        {/* Occupancy Report Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BedDouble className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-black">Occupancy Report</h3>
          </div>
          {reportData && (
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Rooms:</span>
                <span className="font-semibold text-black">{reportData.occupancy.totalRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupancy Rate:</span>
                <span className="font-semibold text-black">{reportData.occupancy.occupancyRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Rooms:</span>
                <span className="font-semibold text-black">{reportData.occupancy.availableRooms}</span>
              </div>
            </div>
          )}
          <p className="text-gray-500 text-sm mb-4">View hall occupancy and room allocation statistics</p>
          <button 
            onClick={generateOccupancyReport}
            disabled={generating}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Generate Report
          </button>
        </div>

        {/* Maintenance Report Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-black">Maintenance Report</h3>
          </div>
          {reportData && (
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tickets:</span>
                <span className="font-semibold text-black">{reportData.maintenance.totalTickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resolved:</span>
                <span className="font-semibold text-black">{reportData.maintenance.resolvedTickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Resolution:</span>
                <span className="font-semibold text-black">{reportData.maintenance.averageResolutionTime}</span>
              </div>
            </div>
          )}
          <p className="text-gray-500 text-sm mb-4">Track ticket resolution times and maintenance trends</p>
          <button 
            onClick={generateMaintenanceReport}
            disabled={generating}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      {/* Detailed Preview Section */}
      {reportData && (
        <div className="mt-8 space-y-8">
          {/* Financial Details */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">₦{reportData.financial.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-xl font-bold text-blue-600">{reportData.financial.successfulPayments}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">{reportData.financial.pendingPayments}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-xl font-bold text-red-600">{reportData.financial.failedPayments}</p>
                </div>
              </div>
              
              {reportData.financial.monthlyData.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-black mb-3">Monthly Breakdown</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.financial.monthlyData.map((month, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{month.month}</span>
                        <span className="text-sm font-medium text-black">₦{month.revenue.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">{month.count} payments</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Occupancy Details */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Occupancy Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Rooms</p>
                  <p className="text-xl font-bold text-black">{reportData.occupancy.totalRooms}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Occupied</p>
                  <p className="text-xl font-bold text-black">{reportData.occupancy.occupiedRooms}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-xl font-bold text-black">{reportData.occupancy.availableRooms}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-xl font-bold text-green-600">{reportData.occupancy.occupancyRate.toFixed(1)}%</p>
                </div>
              </div>
              
              {reportData.occupancy.byHall.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-black mb-3">Hall Breakdown</h3>
                  <div className="space-y-2">
                    {reportData.occupancy.byHall.map((hall, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-black">{hall.hallName}</span>
                        <div className="flex gap-4">
                          <span className="text-sm text-gray-600">{hall.occupiedRooms}/{hall.totalRooms} rooms</span>
                          <span className="text-sm font-medium text-blue-600">{hall.occupancyRate.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Details */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Maintenance Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-xl font-bold text-black">{reportData.maintenance.totalTickets}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-xl font-bold text-green-600">{reportData.maintenance.resolvedTickets}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">{reportData.maintenance.pendingTickets}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Resolution</p>
                  <p className="text-xl font-bold text-blue-600">{reportData.maintenance.averageResolutionTime}</p>
                </div>
              </div>
              
              {reportData.maintenance.byCategory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-black mb-3">By Category</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.maintenance.byCategory.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-black capitalize">{cat.category}</span>
                        <div className="flex gap-4">
                          <span className="text-sm text-gray-600">{cat.resolved}/{cat.total} resolved</span>
                          <span className="text-xs text-gray-500">{cat.avgTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
