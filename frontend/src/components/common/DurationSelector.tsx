import { Calendar, Clock, CalendarDays, CalendarRange } from 'lucide-react';

export type DurationType = 'weekly' | 'monthly' | 'semester' | 'session';

interface Duration {
  id: DurationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  weeks: number;
}

interface DurationSelectorProps {
  selectedDuration: DurationType;
  onSelectDuration: (duration: DurationType) => void;
}

const durations: Duration[] = [
  {
    id: 'weekly',
    label: '1 Week',
    description: 'Short stay',
    icon: <Calendar className="w-4 h-4" />,
    weeks: 1
  },
  {
    id: 'monthly',
    label: '1 Month',
    description: '4 weeks',
    icon: <CalendarDays className="w-4 h-4" />,
    weeks: 4
  },
  {
    id: 'semester',
    label: '1 Semester',
    description: '12 weeks',
    icon: <Clock className="w-4 h-4" />,
    weeks: 12
  },
  {
    id: 'session',
    label: 'Full Session',
    description: '24 weeks',
    icon: <CalendarRange className="w-4 h-4" />,
    weeks: 24
  }
];

const DurationSelector: React.FC<DurationSelectorProps> = ({ selectedDuration, onSelectDuration }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-black">Accommodation Duration</h3>
        <p className="text-xs text-gray-500">Select your stay period</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {durations.map((duration) => (
          <button
            key={duration.id}
            onClick={() => onSelectDuration(duration.id)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDuration === duration.id
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {duration.icon}
            <span>{duration.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DurationSelector;
