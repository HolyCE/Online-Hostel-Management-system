import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Filter, ChevronDown, Home, Users, DollarSign, Wifi, Snowflake, Wind, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Room {
  _id: string;
  roomNumber: string;
  blockName: string;
  floorNumber: number;
  capacity: number;
  price: number;
  genderRestriction: string;
  amenities: string[];
  status: string;
  availableSlots: number;
  occupants: any[];
  description?: string;
}

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    blockName: '',
    floorNumber: 1,
    capacity: 2,
    price: 150000,
    genderRestriction: 'any',
    amenities: [] as string[],
    description: ''
  });

  const availableAmenities = [
    'bed', 'mattress', 'wardrobe', 'desk', 'chair', 
    'fan', 'ac', 'wifi', 'attached_bathroom'
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/rooms`, { headers });
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const loadingToast = toast.loading('Creating room...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const roomData = {
        ...formData,
        status: 'available',
        availableSlots: formData.capacity
      };
      
      const response = await axios.post(`${API_URL}/rooms`, roomData, { headers });
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`Room ${formData.roomNumber} created successfully!`);
        setShowAddModal(false);
        resetForm();
        fetchRooms();
      }
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    
    setSubmitting(true);
    const loadingToast = toast.loading('Updating room...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const roomData = {
        roomNumber: formData.roomNumber,
        blockName: formData.blockName,
        floorNumber: formData.floorNumber,
        capacity: formData.capacity,
        price: formData.price,
        genderRestriction: formData.genderRestriction,
        amenities: formData.amenities,
        description: formData.description
      };
      
      const response = await axios.put(`${API_URL}/rooms/${editingRoom._id}`, roomData, { headers });
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`Room ${formData.roomNumber} updated successfully!`);
        setShowEditModal(false);
        setEditingRoom(null);
        resetForm();
        fetchRooms();
      }
    } catch (error: any) {
      console.error('Error updating room:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to update room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete Room ${room.roomNumber}? This action cannot be undone.`)) {
      return;
    }
    
    const loadingToast = toast.loading('Deleting room...');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.delete(`${API_URL}/rooms/${room._id}`, { headers });
      
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`Room ${room.roomNumber} deleted successfully!`);
        fetchRooms();
      }
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      blockName: room.blockName,
      floorNumber: room.floorNumber,
      capacity: room.capacity,
      price: room.price,
      genderRestriction: room.genderRestriction,
      amenities: room.amenities || [],
      description: room.description || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      blockName: '',
      floorNumber: 1,
      capacity: 2,
      price: 150000,
      genderRestriction: 'any',
      amenities: [],
      description: ''
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const blocks = [...new Set(rooms.map(r => r.blockName))];
  const statuses = ['available', 'occupied', 'maintenance', 'full'];

  const filteredRooms = rooms.filter(room => {
    if (search && !room.roomNumber.toLowerCase().includes(search.toLowerCase()) && !room.blockName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBlock && room.blockName !== filterBlock) return false;
    if (filterStatus && room.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'occupied': return 'bg-yellow-100 text-yellow-700';
      case 'maintenance': return 'bg-red-100 text-red-700';
      case 'full': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lower.includes('ac')) return <Snowflake className="w-3 h-3" />;
    if (lower.includes('fan')) return <Wind className="w-3 h-3" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Room Management</h1>
          <p className="text-gray-600">Manage all hostel rooms and allocations</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Room
        </button>
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
              placeholder="Search rooms..."
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                <select
                  value={filterBlock}
                  onChange={e => setFilterBlock(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Blocks</option>
                  {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Room Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Block/Floor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Capacity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Gender</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Amenities</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRooms.map(room => (
                <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-black">{room.roomNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{room.blockName} • Floor {room.floorNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{room.availableSlots}/{room.capacity}</td>
                  <td className="px-6 py-4 font-semibold text-black">₦{room.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{room.genderRestriction}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                          {getAmenityIcon(a)}
                          {a.replace('_', ' ')}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-xs text-gray-500">+{room.amenities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(room)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRoom(room)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRooms.length === 0 && (
          <div className="p-12 text-center">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No rooms found</p>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Add New Room</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g., E101"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.blockName}
                    onChange={e => setFormData({ ...formData, blockName: e.target.value.toUpperCase() })}
                    placeholder="e.g., Block E"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                  <input
                    type="number"
                    value={formData.floorNumber}
                    onChange={e => setFormData({ ...formData, floorNumber: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <select
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="1">1 person</option>
                    <option value="2">2 persons</option>
                    <option value="3">3 persons</option>
                    <option value="4">4 persons</option>
                    <option value="6">6 persons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    min="50000"
                    step="5000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender Restriction</label>
                <select
                  value={formData.genderRestriction}
                  onChange={e => setFormData({ ...formData, genderRestriction: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="any">Any</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {availableAmenities.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {amenity.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Room description, special features, etc."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && editingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Edit Room {editingRoom.roomNumber}</h2>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRoom(null);
                    resetForm();
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.blockName}
                    onChange={e => setFormData({ ...formData, blockName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                  <input
                    type="number"
                    value={formData.floorNumber}
                    onChange={e => setFormData({ ...formData, floorNumber: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <select
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="1">1 person</option>
                    <option value="2">2 persons</option>
                    <option value="3">3 persons</option>
                    <option value="4">4 persons</option>
                    <option value="6">6 persons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    min="50000"
                    step="5000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender Restriction</label>
                <select
                  value={formData.genderRestriction}
                  onChange={e => setFormData({ ...formData, genderRestriction: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="any">Any</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {availableAmenities.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {amenity.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRoom(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
