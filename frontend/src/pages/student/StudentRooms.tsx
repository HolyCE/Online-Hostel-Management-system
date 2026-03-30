import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Heart, Wifi, Snowflake, Wind, Home, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import RoomDetailModal from '../../components/common/RoomDetailModal';

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
  images: string[];
  description: string;
  occupants: any[];
}

const StudentRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const blocks = [...new Set(rooms.map(r => r.blockName))];
  const genders = ['male', 'female', 'any'];
  const statuses = ['available', 'occupied', 'maintenance'];

  const filteredRooms = rooms.filter(r => {
    if (search && !r.roomNumber.toLowerCase().includes(search.toLowerCase()) && !r.blockName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBlock && r.blockName !== filterBlock) return false;
    if (filterGender && r.genderRestriction !== filterGender && r.genderRestriction !== 'any') return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'occupied': return 'bg-yellow-100 text-yellow-700';
      case 'maintenance': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'available': return 'Available';
      case 'occupied': return 'Partially Occupied';
      case 'maintenance': return 'Under Maintenance';
      default: return status;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lower.includes('ac')) return <Snowflake className="w-3 h-3" />;
    if (lower.includes('fan')) return <Wind className="w-3 h-3" />;
    return null;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowModal(true);
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
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Available Rooms</h1>
            <p className="text-gray-600">{filteredRooms.length} rooms found</p>
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
                placeholder="Search by room number or block..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={filterGender}
                    onChange={e => setFilterGender(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">All</option>
                    {genders.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">All</option>
                    {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleRoomClick(room)}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Room Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {room.images && room.images[0] ? (
                  <img 
                    src={room.images[0]} 
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.className = 'w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(room._id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10 shadow-md"
                >
                  <Heart className={`w-4 h-4 ${favorites.has(room._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                
                {/* Status Badge */}
                <div className="absolute bottom-3 left-3 z-10">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </span>
                </div>
                
                {/* Room Number Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg z-10">
                  <span className="text-white text-xs font-medium">{room.roomNumber}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{room.blockName}</h3>
                    <p className="text-sm text-gray-500">Floor {room.floorNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-black">₦{room.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">per session</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{room.availableSlots}/{room.capacity} slots</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{room.genderRestriction === 'any' ? 'Mixed' : room.genderRestriction}</span>
                  </div>
                </div>
                
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                        {getAmenityIcon(amenity)}
                        {amenity.replace('_', ' ')}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="px-2 py-1 text-xs text-gray-500">+{room.amenities.length - 4}</span>
                    )}
                  </div>
                )}
                
                <button 
                  disabled={room.status !== 'available'}
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    room.status === 'available'
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoomClick(room);
                  }}
                >
                  {room.status === 'available' ? 'View Details' : 'Not Available'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No rooms found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default StudentRooms;
