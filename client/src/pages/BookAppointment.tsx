import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getServices, getAllStaff, createAppointment, getServiceById, getStaffById } from '@/api/api';
import { Service, Staff } from '@shared/schema';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

import BookingSteps from '@/components/BookingSteps';
import ServiceCard from '@/components/ServiceCard';
import StaffCard from '@/components/StaffCard';
import Calendar from '@/components/Calendar';
import TimeSlots from '@/components/TimeSlots';
import AppointmentSummary from '@/components/AppointmentSummary';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { calculateEndTime } from '@/lib/utils';

export default function BookAppointment() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Parse URL query parameters
  const params = new URLSearchParams(window.location.search);
  const serviceIdParam = params.get('serviceId');
  const staffIdParam = params.get('staffId');
  
  // Booking state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff & { user: { name: string, profileImage?: string | null } } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notes, setNotes] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  
  // Contact information (pre-filled from user if available)
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  
  useEffect(() => {
    // If user is logged in, prefill the form
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to book an appointment",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);
  
  // Handle URL parameters to pre-select service or staff
  useEffect(() => {
    const loadFromUrlParams = async () => {
      // Load service if serviceId is provided in URL
      if (serviceIdParam) {
        try {
          const serviceId = parseInt(serviceIdParam);
          if (!isNaN(serviceId)) {
            const service = await getServiceById(serviceId);
            if (service) {
              setSelectedService(service);
              setSelectedCategory(service.category);
              if (!staffIdParam) {
                setCurrentStep(2); // Move to step 2 if only service is selected
              }
            }
          }
        } catch (error) {
          console.error("Error loading service from URL param:", error);
        }
      }
      
      // Load staff if staffId is provided in URL
      if (staffIdParam) {
        try {
          const staffId = parseInt(staffIdParam);
          if (!isNaN(staffId)) {
            const staffMember = await getStaffById(staffId);
            if (staffMember) {
              setSelectedStaff(staffMember);
              if (serviceIdParam) {
                setCurrentStep(2); // Move to step 2 if both service and staff are selected
              }
            }
          }
        } catch (error) {
          console.error("Error loading staff from URL param:", error);
        }
      }
    };
    
    if (isAuthenticated) {
      loadFromUrlParams();
    }
  }, [serviceIdParam, staffIdParam, isAuthenticated]);
  
  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => getServices()
  });
  
  // Fetch staff
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: () => getAllStaff()
  });
  
  // Filter services by category
  const filteredServices = selectedCategory === 'all'
    ? services
    : services?.filter(service => service.category === selectedCategory);
  
  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: (appointmentData: {
      clientId: number;
      staffId: number;
      serviceId: number;
      date: string;
      startTime: string;
      endTime: string;
      notes?: string;
    }) => createAppointment(appointmentData),
    onSuccess: () => {
      navigate('/booking-success');
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Could not book appointment",
        variant: "destructive",
      });
    }
  });
  
  // Go to next step
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!selectedService) {
        toast({
          title: "Service required",
          description: "Please select a service to continue",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!selectedStaff) {
        toast({
          title: "Staff required",
          description: "Please select a staff member to continue",
          variant: "destructive",
        });
        return;
      }
      if (!selectedTime) {
        toast({
          title: "Time required",
          description: "Please select an appointment time to continue",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Go to previous step
  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Format date as string (YYYY-MM-DD)
  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Handle appointment submission
  const handleBookAppointment = () => {
    if (!selectedService || !selectedStaff || !selectedTime || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the booking policies",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate end time based on service duration
    const endTime = calculateEndTime(selectedTime, selectedService.duration);
    
    // Create appointment
    bookAppointmentMutation.mutate({
      clientId: user.id,
      staffId: selectedStaff.id,
      serviceId: selectedService.id,
      date: formatDateString(selectedDate),
      startTime: selectedTime,
      endTime,
      notes: notes || undefined
    });
  };
  
  return (
    <section className="py-16 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-neutral-800">Book Your Appointment</h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Follow these simple steps to schedule your next beauty treatment with one of our talented professionals.
          </p>
        </div>
        
        {/* Booking Steps */}
        <div className="max-w-4xl mx-auto">
          <BookingSteps 
            currentStep={currentStep} 
            onStepClick={(step) => {
              // Only allow going back to previous steps
              if (step < currentStep) {
                setCurrentStep(step);
              }
            }} 
          />
          
          {/* Step 1: Select Service */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-medium text-neutral-800 mb-4">Select a Service</h3>
                
                {/* Categories */}
                <Tabs
                  defaultValue={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                  className="mb-6"
                >
                  <TabsList className="flex overflow-x-auto pb-2 space-x-2">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      All Services
                    </TabsTrigger>
                    <TabsTrigger 
                      value="hair"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Hair
                    </TabsTrigger>
                    <TabsTrigger 
                      value="nails"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Nails
                    </TabsTrigger>
                    <TabsTrigger 
                      value="facial"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Facial
                    </TabsTrigger>
                    <TabsTrigger 
                      value="massage"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Massage
                    </TabsTrigger>
                    <TabsTrigger 
                      value="makeup"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Makeup
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* Service Cards */}
                {servicesLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : filteredServices && filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        selected={selectedService?.id === service.id}
                        onClick={() => setSelectedService(service)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No services found in this category</p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={goToNextStep}
                    className="bg-primary hover:bg-primary-dark text-white"
                    disabled={!selectedService}
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Select Staff & Date */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-medium text-neutral-800">Select Staff & Date</h3>
                    <p className="text-sm text-neutral-600 mt-1">Choose your preferred stylist and appointment date</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary-dark text-sm font-medium flex items-center" 
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
                  </Button>
                </div>
                
                {/* Staff Selection */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-neutral-800 mb-4">Choose your stylist</h4>
                  
                  {staffLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  ) : staff && staff.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {staff.map((staffMember) => (
                        <StaffCard
                          key={staffMember.id}
                          staff={staffMember}
                          selected={selectedStaff?.id === staffMember.id}
                          onClick={() => setSelectedStaff(staffMember)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No staff members available</p>
                    </div>
                  )}
                </div>
                
                {/* Calendar Section */}
                {selectedStaff && (
                  <div>
                    <h4 className="text-lg font-medium text-neutral-800 mb-4">Select a date & time</h4>
                    
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Calendar */}
                      <div className="lg:w-2/3">
                        <Calendar 
                          selectedDate={selectedDate}
                          onDateSelect={setSelectedDate}
                          minDate={new Date()} // Can't book in the past
                        />
                      </div>
                      
                      {/* Time Slots */}
                      <div className="lg:w-1/3">
                        {selectedService && selectedStaff && (
                          <TimeSlots
                            staffId={selectedStaff.id}
                            serviceId={selectedService.id}
                            date={formatDateString(selectedDate)}
                            onSelectTime={setSelectedTime}
                            selectedTime={selectedTime}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    onClick={goToNextStep}
                    className="bg-primary hover:bg-primary-dark text-white"
                    disabled={!selectedStaff || !selectedTime}
                  >
                    Continue to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Confirm & Checkout */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-medium text-neutral-800">Confirm Appointment</h3>
                    <p className="text-sm text-neutral-600 mt-1">Please review and confirm your appointment details</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary-dark text-sm font-medium flex items-center" 
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Date & Time
                  </Button>
                </div>
                
                {/* Appointment Summary */}
                <AppointmentSummary
                  service={selectedService}
                  staff={selectedStaff}
                  date={formatDateString(selectedDate)}
                  time={selectedTime}
                  className="mb-6"
                />
                
                {/* Contact Information */}
                <div className="mb-6">
                  <h4 className="font-medium text-neutral-800 mb-4">Contact Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-neutral-700 mb-1">Full Name</Label>
                      <Input 
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2"
                        placeholder="Enter your full name" 
                        disabled={!!user}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-neutral-700 mb-1">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2"
                        placeholder="Enter your email"
                        disabled={!!user}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-neutral-700 mb-1">Phone Number</Label>
                      <Input 
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Special Requests */}
                <div className="mb-6">
                  <h4 className="font-medium text-neutral-800 mb-4">Special Requests (Optional)</h4>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 h-24"
                    placeholder="Any special requests or notes for your stylist?"
                  />
                </div>
                
                {/* Booking Policies */}
                <div className="mb-6">
                  <h4 className="font-medium text-neutral-800 mb-4">Booking Policies</h4>
                  <div className="bg-neutral-50 p-4 rounded-md text-sm text-neutral-600">
                    <p className="mb-2">By confirming this appointment, you agree to our booking policies:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Cancellations must be made at least 24 hours in advance to avoid a cancellation fee.</li>
                      <li>Please arrive 10 minutes before your scheduled appointment time.</li>
                      <li>Late arrivals may result in reduced service time or rescheduling.</li>
                    </ul>
                  </div>
                  <div className="mt-4 flex items-start">
                    <Checkbox 
                      id="agreeTerms" 
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      className="mt-1 mr-2"
                    />
                    <Label htmlFor="agreeTerms" className="text-sm text-neutral-700">
                      I agree to the booking policies and terms of service
                    </Label>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    onClick={handleBookAppointment}
                    className="bg-primary hover:bg-primary-dark text-white"
                    disabled={bookAppointmentMutation.isPending || !agreedToTerms}
                  >
                    {bookAppointmentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                      </>
                    ) : (
                      <>
                        Confirm Appointment <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
