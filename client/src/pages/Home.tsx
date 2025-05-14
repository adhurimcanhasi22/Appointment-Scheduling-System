import { useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getServices, getAllStaff } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import ServiceCard from '@/components/ServiceCard';
import StaffCard from '@/components/StaffCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  // Fetch featured services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => getServices()
  });
  
  // Fetch staff
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: () => getAllStaff()
  });
  
  // Filter to just show top 3 services
  const featuredServices = services?.slice(0, 3);
  
  // Filter to just show top 3 staff members
  const featuredStaff = staff?.slice(0, 3);
  
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="h-[500px] bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080")' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/70 to-neutral-900/30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-lg">
              <h1 className="text-4xl font-bold text-white font-heading">Your Beauty Journey Starts Here</h1>
              <p className="mt-4 text-xl text-white">Book your next appointment with our expert stylists and beauty professionals.</p>
              <div className="mt-10">
                <Link href="/book">
                  <Button className="bg-primary hover:bg-primary-dark text-white font-medium rounded-md px-6 py-3 text-lg shadow-md transition duration-200 transform hover:scale-105">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-heading text-neutral-800">Our Services</h2>
            <Link href="/services">
              <Button variant="ghost" className="text-primary hover:text-primary-dark flex items-center">
                View All Services <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
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
            ) : (
              featuredServices?.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onClick={() => window.location.href = `/book?serviceId=${service.id}`}
                />
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Our Team Section */}
      <section className="py-16 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-heading text-neutral-800">Our Team</h2>
            <Link href="/staff">
              <Button variant="ghost" className="text-primary hover:text-primary-dark flex items-center">
                Meet Our Team <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staffLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                  </div>
                </div>
              ))
            ) : (
              featuredStaff?.map((staffMember) => (
                <StaffCard 
                  key={staffMember.id} 
                  staff={staffMember}
                  onClick={() => window.location.href = `/book?staffId=${staffMember.id}`}
                />
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Booking CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Ready to Book Your Next Appointment?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Our expert stylists and beauty professionals are ready to help you look and feel your best.</p>
          <Link href={isAuthenticated ? "/book" : "/login"}>
            <Button className="bg-white text-primary hover:bg-neutral-100 px-8 py-3 text-lg font-medium rounded-md shadow-md">
              {isAuthenticated ? "Book Now" : "Login to Book"}
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-neutral-800 text-center mb-12">What Our Clients Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center text-yellow-400 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-600 mb-4">"I've been going to Bella Salon for years, and I'm always thrilled with the results. The staff is professional, skilled, and friendly!"</p>
              <div className="font-medium">Sarah Johnson</div>
              <div className="text-sm text-neutral-500">Regular Client</div>
            </div>
            
            <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center text-yellow-400 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-600 mb-4">"Emma did an amazing job with my hair color! The online booking system made scheduling super easy, and I love the reminder emails."</p>
              <div className="font-medium">Michael Brown</div>
              <div className="text-sm text-neutral-500">First-time Client</div>
            </div>
            
            <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center text-yellow-400 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-600 mb-4">"The facial with Sophie was absolutely divine! My skin has never looked better. The salon is beautiful and relaxing. Highly recommend!"</p>
              <div className="font-medium">Jennifer Davis</div>
              <div className="text-sm text-neutral-500">Monthly Client</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
