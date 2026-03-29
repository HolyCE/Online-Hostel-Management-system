import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, Snowflake, Wind, Users, DollarSign, Home, Bed, Bath, Tv, Coffee, Shield, Calendar, CalendarDays, Clock, CalendarRange } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type DurationType = 'weekly' | 'monthly' | 'semester' | 'session';

interface Room {
  _id: string;
  roomNumber: string;
  blockName: string;
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
  description: string;
}

interface RoomDetailModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

const durations = [
  { id: 'weekly' as DurationType, label: '1 Week', icon: Calendar, weeks: 1, suffix: 'week' },
  { id: 'monthly' as DurationType, label: '1 Month', icon: CalendarDays, weeks: 4, suffix: 'month' },
  { id: 'semester' as DurationType, label: '1 Semester', icon: Clock, weeks: 12, suffix: 'semester' },
  { id: 'session' as DurationType, label: 'Full Session', icon: CalendarRange, weeks: 24, suffix: 'session' }
];

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ room, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('session');

  if (!room) return null;

  const getPriceForDuration = (duration: DurationType): number => {
    switch(duration) {
      case 'weekly': return room.prices?.weekly || Math.round(room.basePrice / 24);
      case 'monthly': return room.prices?.monthly || Math.round(room.basePrice / 6);
      case 'semester': return room.prices?.semester || Math.round(room.basePrice / 2);
      default: return room.basePrice;
    }
  };

  const handleProceedToPayment = () => {
    const price = getPriceForDuration(selectedDuration);
    const durationLabel = durations.find(d => d.id === selectedDuration)?.label;
    
    setLoading(true);
    
    // Show loading toast
    toast.loading('Preparing payment...', { id: 'payment-prep' });
    
    sessionStorage.setItem('selectedRoom', JSON.stringify({
      id: room._id,
      roomNumber: room.roomNumber,
      blockName: room.blockName,
      price: price,
      capacity: room.capacity,
      duration: selectedDuration,
      basePrice: room.basePrice
    }));
    
    // Dismiss loading toast
    toast.dismiss('payment-prep');
    
    navigate('/dashboard/payments', { 
      state: { 
        selectedRoom: room,
        selectedDuration,
        amount: price,
        durationLabel
      } 
    });
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('ac')) return <Snowflake className="w-4 h-4" />;
    if (lower.includes('fan')) return <Wind className="w-4 h-4" />;
    if (lower.includes('bed')) return <Bed className="w-4 h-4" />;
    if (lower.includes('bath')) return <Bath className="w-4 h-4" />;
    if (lower.includes('tv')) return <Tv className="w-4 h-4" />;
    if (lower.includes('coffee')) return <Coffee className="w-4 h-4" />;
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-black">Room {room.roomNumber}</h2>
                  <p className="text-gray-600 mt-1">{room.blockName} • Floor {room.floorNumber}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                  <Users className="w-5 h-5 text-black mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="text-lg font-semibold text-black">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                  <Home className="w-5 h-5 text-black mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-lg font-semibold text-black capitalize">{room.genderRestriction === 'any' ? 'Mixed' : room.genderRestriction}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                  <Shield className="w-5 h-5 text-black mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-black">{room.status === 'available' ? 'Available' : 'Occupied'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                  <Calendar className="w-5 h-5 text-black mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p className="text-lg font-semibold text-black">{room.availableSlots}/{room.capacity}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">Select Duration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {durations.map((duration) => {
                    const price = getPriceForDuration(duration.id);
                    const Icon = duration.icon;
                    const isSelected = selectedDuration === duration.id;
                    return (
                      <button
                        key={duration.id}
                        onClick={() => setSelectedDuration(duration.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-black' : 'text-gray-500'}`} />
                        <p className={`font-semibold ${isSelected ? 'text-black' : 'text-gray-700'}`}>{duration.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{duration.weeks} weeks</p>
                        <p className="text-sm font-bold text-black mt-2">₦{price.toLocaleString()}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {room.description && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{room.description}</p>
                </div>
              )}

              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm text-gray-700 capitalize">{amenity.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {room.status === 'available' ? (
                  <button
                    onClick={handleProceedToPayment}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Pay ₦${getPriceForDuration(selectedDuration).toLocaleString()} for ${durations.find(d => d.id === selectedDuration)?.label}`}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Room Not Available
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-black rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoomDetailModal;
