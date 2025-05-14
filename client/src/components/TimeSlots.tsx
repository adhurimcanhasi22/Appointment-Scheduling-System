import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvailableTimeSlots } from '@/api/api';
import { Loader2 } from 'lucide-react';

interface TimeSlotsProps {
  staffId: number;
  serviceId: number;
  date: string;
  onSelectTime: (time: string) => void;
  selectedTime?: string;
}

export default function TimeSlots({ 
  staffId, 
  serviceId, 
  date, 
  onSelectTime, 
  selectedTime 
}: TimeSlotsProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedTime);
  
  // Reset selection when date/staff/service changes
  useEffect(() => {
    setSelected(undefined);
    onSelectTime('');
  }, [date, staffId, serviceId, onSelectTime]);
  
  const { data: timeSlots, isLoading, error } = useQuery({
    queryKey: ['/api/availability/timeslots', staffId, date, serviceId],
    queryFn: () => getAvailableTimeSlots(staffId, date, serviceId),
    enabled: !!staffId && !!date && !!serviceId
  });
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  const handleSelectTime = (time: string) => {
    setSelected(time);
    onSelectTime(time);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <h5 className="font-medium mb-4">Available Times</h5>
        <div className="text-sm text-red-500">Failed to load time slots</div>
      </div>
    );
  }
  
  if (!timeSlots || timeSlots.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <h5 className="font-medium mb-4">Available Times</h5>
        <div className="text-sm text-neutral-800 mb-2">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div className="text-sm text-neutral-500 py-4 text-center">No available time slots for this date</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <h5 className="font-medium mb-4">Available Times</h5>
      <div className="text-sm text-neutral-800 mb-2">
        {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((time) => (
          <div
            key={time}
            className={`time-slot cursor-pointer ${selected === time ? 'time-slot-selected' : ''}`}
            onClick={() => handleSelectTime(time)}
          >
            {formatTime(time)}
          </div>
        ))}
      </div>
    </div>
  );
}
