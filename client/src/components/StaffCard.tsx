import { Staff } from '@shared/schema';
import { Star, StarHalf } from 'lucide-react';

interface StaffCardProps {
  staff: Staff & { 
    user: { 
      name: string; 
      profileImage?: string | null;
    } 
  };
  onClick?: () => void;
  selected?: boolean;
}

export default function StaffCard({ staff, onClick, selected = false }: StaffCardProps) {
  // Format rating from 0-500 scale to 0-5 scale with half stars
  const formatRating = (rating: number | undefined) => {
    if (!rating) return 0;
    return rating / 100;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }

    // Add empty stars to fill up to 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  return (
    <div 
      className={`staff-card ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={staff.user.profileImage || "https://placehold.co/800x800?text=Staff"} 
          alt={staff.user.name} 
          className="w-full h-48 object-cover" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h4 className="text-white font-medium">{staff.user.name}</h4>
          <p className="text-white/80 text-sm">{staff.title}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center text-sm text-neutral-600">
          <span className="flex space-x-0.5">
            {renderStars(formatRating(staff.rating))}
          </span>
          <span className="ml-1">
            {staff.rating ? (formatRating(staff.rating).toFixed(1)) : "New"} 
            {staff.reviewCount ? ` (${staff.reviewCount} reviews)` : ""}
          </span>
        </div>
        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{staff.bio}</p>
        <div className="mt-3 flex justify-between items-center">
          <button className="text-primary hover:text-primary-dark text-sm font-medium">View Profile</button>
          <button className="px-3 py-1 bg-primary text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
