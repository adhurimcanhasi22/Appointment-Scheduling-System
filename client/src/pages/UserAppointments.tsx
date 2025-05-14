import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getClientAppointments, cancelAppointment } from '@/api/api';
import { Appointment } from '@shared/schema';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, User, Scissors, AlertTriangle } from 'lucide-react';

export default function UserAppointments() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [cancelAppointmentId, setCancelAppointmentId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user appointments
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['/api/appointments/client'],
    queryFn: getClientAppointments,
    enabled: isAuthenticated
  });

  // Filter appointments by status
  const upcomingAppointments = appointments?.filter(
    appointment => ['confirmed'].includes(appointment.status)
  ) || [];
  
  const pastAppointments = appointments?.filter(
    appointment => ['completed', 'cancelled'].includes(appointment.status)
  ) || [];

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!cancelAppointmentId) return;
    
    setIsCancelling(true);
    try {
      await cancelAppointment(cancelAppointmentId);
      refetch();
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your appointment. Please try again.",
        variant: "destructive",
      });
    }
    setIsCancelling(false);
    setCancelAppointmentId(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Render appointment card
  const renderAppointmentCard = (appointment: Appointment, showCancelButton: boolean = false) => {
    return (
      <Card key={appointment.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center text-lg font-medium mb-2">
                <Scissors className="h-5 w-5 text-primary mr-2" />
                {/* Fetch service name with serviceId */}
                Service #{appointment.serviceId}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-neutral-500 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium">{formatDate(appointment.date)}</div>
                    <div className="text-sm text-neutral-500">
                      {appointment.startTime} - {appointment.endTime}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 text-neutral-500 mr-2" />
                  <div>
                    <div className="font-medium">Staff #{appointment.staffId}</div>
                    <div className="text-sm text-neutral-500">Beauty Professional</div>
                  </div>
                </div>
                
                <div className="text-neutral-700">
                  Appointment #{appointment.id}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end justify-between">
              <div>{getStatusBadge(appointment.status)}</div>
              
              {showCancelButton && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="text-red-500 border-red-500 hover:bg-red-50 mt-4 md:mt-0"
                      onClick={() => setCancelAppointmentId(appointment.id)}
                    >
                      Cancel Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="flex items-center text-amber-500 bg-amber-50 p-3 rounded">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Cancellations within 24 hours of the appointment may incur a fee.
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setCancelAppointmentId(null)}
                      >
                        Keep Appointment
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleCancelAppointment}
                        disabled={isCancelling}
                      >
                        {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Yes, Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-heading text-neutral-800">Your Appointments</h1>
        <p className="text-neutral-600 mt-2">View and manage your upcoming and past appointments</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Past
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div>
              {upcomingAppointments.map(appointment => 
                renderAppointmentCard(appointment, true)
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-neutral-500 mb-4">
                  <Calendar className="h-12 w-12 mx-auto text-neutral-300" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Upcoming Appointments</h3>
                <p className="text-neutral-500 mb-6">You don't have any upcoming appointments scheduled.</p>
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  onClick={() => navigate('/book')}
                >
                  Book New Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : pastAppointments.length > 0 ? (
            <div>
              {pastAppointments.map(appointment => 
                renderAppointmentCard(appointment)
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-neutral-500 mb-4">
                  <Clock className="h-12 w-12 mx-auto text-neutral-300" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Past Appointments</h3>
                <p className="text-neutral-500 mb-6">You don't have any past appointments history.</p>
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  onClick={() => navigate('/book')}
                >
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}