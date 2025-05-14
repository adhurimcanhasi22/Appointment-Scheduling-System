import { useQuery } from '@tanstack/react-query';
import { getAllStaff } from '@/api/api';
import { useState } from 'react';
import { useLocation } from 'wouter';
import StaffCard from '@/components/StaffCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Staff() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all staff
  const { data: staff, isLoading } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: () => getAllStaff()
  });
  
  // Filter staff based on search term
  const filteredStaff = staff?.filter(staffMember => 
    staffMember.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    staffMember.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staffMember.bio && staffMember.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-heading text-neutral-800 mb-4">Meet Our Team</h1>
        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
          Our talented professionals are passionate about beauty and dedicated to helping you look and feel your best.
        </p>
      </div>
      
      {/* Search */}
      <div className="mb-10">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <Input
            type="text"
            placeholder="Search by name or specialty..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Staff grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
              </div>
            </div>
          ))
        ) : filteredStaff?.length ? (
          filteredStaff.map((staffMember) => (
            <StaffCard 
              key={staffMember.id} 
              staff={staffMember}
              onClick={() => setLocation(`/book?staffId=${staffMember.id}`)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <h3 className="text-xl font-medium text-neutral-600 mb-3">No staff members found</h3>
            <p className="text-neutral-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
      
      {/* Team Values Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold font-heading text-neutral-800 mb-2">Passion</h3>
          <p className="text-neutral-600">
            We are passionate about beauty and dedicated to providing exceptional service.
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m8 14 2.5 2.5L16 10"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold font-heading text-neutral-800 mb-2">Expertise</h3>
          <p className="text-neutral-600">
            Our team regularly updates their skills through ongoing education and training.
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold font-heading text-neutral-800 mb-2">Client Focus</h3>
          <p className="text-neutral-600">
            We prioritize understanding your needs and preferences to deliver personalized care.
          </p>
        </div>
      </div>
    </div>
  );
}