import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, DollarSign, BedDouble, Building2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import RoomDetailModal from '../../components/common/RoomDetailModal';
import HallSelector from '../../components/common/HallSelector';
import DurationSelector, { DurationType } from '../../components/common/DurationSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Room {
  _id: string;
  roomNumber: string;
  blockName: string;
  hall: { _id: string; name: string };
  floorNumber: number;
  capacity: number;
  basePrice: number;
  prices: {
    weekly: number;
    monthly: number;
    semester: number;
    session: number;
  };
  genderRestriction: string;
  amenities: string[];
  status: string;
  availableSlots: number;
  images: string[];
  description: string;
  occupants: any[];
}

interface Hall {
  _id: string;
  name: string;
  gender: string;
  code: string;
  description: string;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  totalCapacity: number;
  occupancyRate: number;
  images: string[];
}

const StudentRooms = () => {
  const { user } = useAuth();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingHalls, setLoadingHalls] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('session');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHalls();
  }, [user]);

  useEffect(() => {
    if (selectedHall) {
      fetchRoomsByHall(selectedHall._id);
    } else {
      setRooms([]);
    }
  }, [selectedHall]);

  const fetchHalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const genderFilter = user?.gender === 'male' ? 'male' : 'female';
      const response = await axios.get(`${API_URL}/halls?gender=${genderFilter}`, { headers });
      setHalls(response.data.data || []);
      
      if (response.data.data.length === 0) {
        toast.error(`No ${genderFilter} halls available at the moment. Please check back later.`);
      }
    } catch (error: any) {
      console.error('Error fetching halls:', error);
      toast.error(error.response?.data?.message || 'Failed to load halls. Please refresh the page.');
    } finally {
      setLoadingHalls(false);
    }
  };

  const fetchRoomsByHall = async (hallId: string) => {
    setLoadingRooms(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/halls/${hallId}/rooms`, { headers });
      const roomsData = response.data.data || [];
      setRooms(roomsData);
      
      if (roomsData.length === 0) {
        toast.error(`No rooms available in ${selectedHall?.name} at the moment. Please try another hall.`);
      } else {
        const availableRooms = roomsData.filter((r: Room) => r.status === 'available').length;
        toast.success(`${selectedHall?.name} has ${availableRooms} available room${availableRooms !== 1 ? 's' : ''}.`);
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      toast.error(error.response?.data?.message || 'Failed to load rooms. Please try again.');
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomClick = (room: Room) => {
    if (room.status !== 'available') {
      toast.error(`Room ${room.roomNumber} is ${room.status}. Please select an available room.`);
      return;
    }
    setSelectedRoom(room);
    setShowModal(true);
  };

  const getPriceForDuration = (room: Room): number => {
    switch(selectedDuration) {
      case 'weekly': return room.prices?.weekly || Math.round(room.basePrice / 24);
      case 'monthly': return room.prices?.monthly || Math.round(room.basePrice / 6);
      case 'semester': return room.prices?.semester || Math.round(room.basePrice / 2);
      default: return room.basePrice;
    }
  };

  const getDurationLabel = () => {
    switch(selectedDuration) {
      case 'weekly': return 'per week';
      case 'monthly': return 'per month';
      case 'semester': return 'per semester';
      default: return 'per session';
    }
  };

  if (loadingHalls) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading halls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Find Your Room</h1>
        <p className="text-gray-600">Select a hall to view available rooms</p>
      </div>

      <div className="mb-8">
        <HallSelector
          halls={halls}
          selectedHall={selectedHall}
          onSelectHall={setSelectedHall}
          loading={loadingHalls}
        />
      </div>

      {selectedHall && (
        <DurationSelector
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
        />
      )}

      {selectedHall && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">
              Rooms in {selectedHall.name}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({rooms.filter(r => r.status === 'available').length} available)
              </span>
            </h2>
          </div>

          {loadingRooms ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <BedDouble className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Rooms Available</h3>
              <p className="text-gray-600">No rooms are currently available in {selectedHall.name}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room, index) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleRoomClick(room)}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border transition-all cursor-pointer ${
                    room.status === 'available'
                      ? 'border-gray-200 hover:shadow-lg'
                      : 'border-gray-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-500" />
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        room.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {room.status === 'available' ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
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
                        <p className="text-xl font-bold text-black">₦{getPriceForDuration(room).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{getDurationLabel()}</p>
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
                    
                    <button 
                      disabled={room.status !== 'available'}
                      className={`w-full py-2 rounded-lg font-medium transition-all ${
                        room.status === 'available'
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (room.status === 'available') handleRoomClick(room);
                      }}
                    >
                      {room.status === 'available' ? 'View Details' : 'Not Available'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <RoomDetailModal
        room={selectedRoom}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default StudentRooms;
