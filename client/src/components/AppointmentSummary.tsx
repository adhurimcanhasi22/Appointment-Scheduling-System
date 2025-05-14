import { Service, Staff } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

interface AppointmentSummaryProps {
  service: Service | null;
  staff: (Staff & { user: { name: string; profileImage?: string | null } }) | null;
  date: string;
  time: string;
  className?: string;
}

export default function AppointmentSummary({ 
  service, 
  staff, 
  date, 
  time, 
  className = '' 
}: AppointmentSummaryProps) {
  if (!service || !staff || !date || !time) {
    return null;
  }

  // Format time (e.g. "09:00" to "9:00 AM")
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Calculate end time based on service duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const endTime = calculateEndTime(time, service.duration);
  
  // Format date (e.g. "2023-07-11" to "July 11, 2023")
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`bg-neutral-50 rounded-lg p-4 ${className}`}>
      <h4 className="font-medium text-neutral-800 mb-4">Appointment Summary</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-4">
            <p className="text-sm text-neutral-500">Service</p>
            <p className="font-medium">{service.name}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-neutral-500">Stylist</p>
            <div className="flex items-center mt-1">
              <img 
                src={staff.user.profileImage || "https://placehold.co/150x150?text=Staff"} 
                alt={staff.user.name} 
                className="w-8 h-8 rounded-full object-cover mr-2" 
              />
              <span className="font-medium">{staff.user.name}</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-neutral-500">Duration</p>
            <p className="font-medium">{service.duration} minutes</p>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <p className="text-sm text-neutral-500">Date & Time</p>
            <p className="font-medium">{formatDate(date)} at {formatTime(time)}</p>
          </div>
          
          <div>
            <p className="text-sm text-neutral-500">Price</p>
            <p className="font-medium">{formatCurrency(service.price / 100)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
