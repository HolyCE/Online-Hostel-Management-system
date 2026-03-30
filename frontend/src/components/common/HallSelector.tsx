import { motion } from 'framer-motion';
import { Building2, Users, BedDouble } from 'lucide-react';

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

interface HallSelectorProps {
  halls: Hall[];
  selectedHall: Hall | null;
  onSelectHall: (hall: Hall) => void;
  loading: boolean;
}

const HallSelector: React.FC<HallSelectorProps> = ({ halls, selectedHall, onSelectHall, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (halls.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-black mb-2">No Halls Available</h3>
        <p className="text-gray-600">Please check back later for available accommodations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black">Select a Hall</h2>
        <p className="text-sm text-gray-500">{halls.length} halls available</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall, index) => (
          <motion.div
            key={hall._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectHall(hall)}
            className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden hover:shadow-lg ${
              selectedHall?._id === hall._id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Hall Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              {hall.images && hall.images[0] ? (
                <img 
                  src={hall.images[0]} 
                  alt={hall.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.className = 'w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  hall.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {hall.gender === 'male' ? "Men's Hall" : "Women's Hall"}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-black mb-1">{hall.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{hall.description || 'A comfortable living space designed for students'}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BedDouble className="w-4 h-4" />
                  <span>{hall.totalRooms} Rooms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{hall.availableRooms} Available</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Occupancy</span>
                  <span>{hall.occupancyRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-black rounded-full h-1.5" 
                    style={{ width: `${hall.occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HallSelector;
 
