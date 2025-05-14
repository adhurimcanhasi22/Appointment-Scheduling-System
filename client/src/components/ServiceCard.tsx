import { Service } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
  selected?: boolean;
}

export default function ServiceCard({ service, onClick, selected = false }: ServiceCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };

  return (
    <div 
      className={`service-card ${selected ? 'ring-2 ring-primary' : ''}`} 
      onClick={onClick}
    >
      <img 
        src={service.image || "https://placehold.co/600x400?text=Bella+Salon"} 
        alt={service.name} 
        className="w-full h-40 object-cover" 
      />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-neutral-800">{service.name}</h4>
            <p className="text-sm text-neutral-500 mt-1">{formatDuration(service.duration)}</p>
          </div>
          <span className="font-medium text-neutral-800">{formatCurrency(service.price / 100)}</span>
        </div>
        <p className="text-sm text-neutral-600 mt-2">{service.description}</p>
      </div>
    </div>
  );
}
