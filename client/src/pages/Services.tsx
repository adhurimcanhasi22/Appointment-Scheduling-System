import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/api/api';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import ServiceCard from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function Services() {
  const [, setLocation] = useLocation();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all services
  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/services', category],
    queryFn: () => getServices(category)
  });
  
  // Filter services based on search term
  const filteredServices = services?.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const categories = ['hair', 'nails', 'facial', 'massage', 'makeup'];
  
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-heading text-neutral-800 mb-4">Our Services</h1>
        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
          Discover our wide range of beauty and wellness services designed to help you look and feel your best.
        </p>
      </div>
      
      {/* Search and filter */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <Input
            type="text"
            placeholder="Search services..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="h-40 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))
        ) : filteredServices?.length ? (
          filteredServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onClick={() => setLocation(`/book?serviceId=${service.id}`)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <h3 className="text-xl font-medium text-neutral-600 mb-3">No services found</h3>
            <p className="text-neutral-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategory(undefined);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Booking CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold font-heading text-neutral-800 mb-4">Ready to Experience Our Services?</h2>
        <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
          Book an appointment today and let our experienced professionals take care of you.
        </p>
        <Link href="/book">
          <Button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg">
            Book Appointment
          </Button>
        </Link>
      </div>
    </div>
  );
}