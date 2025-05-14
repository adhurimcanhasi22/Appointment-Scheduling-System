import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStaffAppointments, getAppointmentsByDate, updateAppointmentStatus } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@shared/schema';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Edit,
  MessageSquare,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Navigate between dates
  const goToPreviousDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments/date', currentDate],
    queryFn: () => getAppointmentsByDate(currentDate)
  });

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: number, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/date', currentDate] });
      toast({
        title: 'Status updated',
        description: `Appointment status has been updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
    }
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments?.filter(appointment => {
    if (!searchQuery) return true;
    
    const client = appointment.client as { name: string, email: string, phone: string | null };
    const service = appointment.service as { name: string };
    
    return (
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Format time (e.g., "09:00" to "9:00 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Format duration between start and end time
  const formatDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    const durationMinutes = endMinutes - startMinutes;
    
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
    }
  };

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-medium text-neutral-800">Staff Dashboard</h3>
          <p className="text-sm text-neutral-600 mt-1">Manage your schedule and client appointments</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center space-x-1">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="flex items-center space-x-1">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
      </div>
      
      {/* Calendar View Tabs */}
      <Card className="mb-6">
        <Tabs defaultValue="daily" onValueChange={(value) => setViewMode(value as 'daily' | 'weekly' | 'monthly')}>
          <CardHeader className="pb-0 border-b">
            <TabsList className="-mb-px space-x-4">
              <TabsTrigger value="daily" className="data-[state=active]:text-primary data-[state=active]:border-primary">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:text-primary data-[state=active]:border-primary">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:text-primary data-[state=active]:border-primary">
                Monthly
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-4 w-4 text-neutral-600" />
                </Button>
                <h4 className="font-medium text-neutral-800">{formatDisplayDate(currentDate)}</h4>
                <Button variant="ghost" size="icon" onClick={goToNextDay}>
                  <ChevronRight className="h-4 w-4 text-neutral-600" />
                </Button>
              </div>
              <Button variant="link" className="text-primary" onClick={goToToday}>
                Today
              </Button>
            </div>
            
            <TabsContent value="daily" className="mt-0">
              {/* Daily calendar view - Time grid */}
              <div className="relative min-h-[500px] border border-neutral-200 rounded overflow-hidden">
                {/* Time labels */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-neutral-50 border-r border-neutral-200 z-10">
                  <div className="h-12"></div> {/* Header offset */}
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="flex items-start h-16 -mt-2 pl-2 text-sm text-neutral-500">
                      {`${9 + index}:00 ${index >= 3 ? 'PM' : 'AM'}`}
                    </div>
                  ))}
                </div>
                
                {/* Main grid area */}
                <div className="ml-16">
                  {/* Header with staff names */}
                  <div className="grid grid-cols-3 h-12 border-b border-neutral-200">
                    {/* Dynamically render staff names - using placeholder for now */}
                    <div className="flex items-center justify-center p-2 font-medium text-sm text-neutral-700 border-r border-neutral-200">
                      Emma Thompson
                    </div>
                    <div className="flex items-center justify-center p-2 font-medium text-sm text-neutral-700 border-r border-neutral-200">
                      Alex Rivera
                    </div>
                    <div className="flex items-center justify-center p-2 font-medium text-sm text-neutral-700">
                      Sophie Chen
                    </div>
                  </div>
                  
                  {/* Grid background lines */}
                  <div className="grid grid-cols-3 relative">
                    {/* Column dividers */}
                    <div className="absolute top-0 left-1/3 bottom-0 border-l border-neutral-200"></div>
                    <div className="absolute top-0 left-2/3 bottom-0 border-l border-neutral-200"></div>
                    
                    {/* Row dividers - every 30 min */}
                    {Array.from({ length: 18 }).map((_, index) => (
                      <div 
                        key={index}
                        className={`absolute left-0 right-0 top-[${32 * (index + 1)}px] border-t ${index % 2 === 0 ? 'border-neutral-200' : 'border-neutral-200 border-dashed'}`}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Appointment blocks would be rendered dynamically here */}
                  <div className="relative h-[480px]">
                    {/* These would be dynamically generated from appointment data */}
                    {/* Each block would be positioned based on the time and staff */}
                    {appointments?.map((appointment) => {
                      // Calculate position based on time
                      const startTime = appointment.startTime;
                      const [startHours, startMinutes] = startTime.split(':').map(Number);
                      const startPosition = (startHours - 9) * 64 + (startMinutes / 60) * 64;
                      
                      const endTime = appointment.endTime;
                      const [endHours, endMinutes] = endTime.split(':').map(Number);
                      const endPosition = (endHours - 9) * 64 + (endMinutes / 60) * 64;
                      
                      const height = endPosition - startPosition;
                      
                      // Determine column based on staff ID (simplified example)
                      let column = 0;
                      if (appointment.staffId === 2) column = 1;
                      if (appointment.staffId === 3) column = 2;
                      
                      const client = appointment.client as { name: string };
                      const service = appointment.service as { name: string };
                      
                      // Determine color based on service type or status
                      const colors = {
                        confirmed: 'bg-primary/20 border-l-4 border-primary',
                        completed: 'bg-green-100 border-l-4 border-green-500',
                        cancelled: 'bg-neutral-100 border-l-4 border-neutral-400',
                      };
                      
                      const colorClass = colors[appointment.status as keyof typeof colors];
                      
                      return (
                        <div 
                          key={appointment.id}
                          className={`absolute rounded p-2 ${colorClass}`}
                          style={{
                            top: `${startPosition}px`,
                            left: `${column * 33.333}%`,
                            width: 'calc(33.333% - 10px)',
                            height: `${height}px`,
                            marginLeft: '5px'
                          }}
                        >
                          <p className="font-medium text-sm text-neutral-800">{service.name}</p>
                          <p className="text-xs text-neutral-600">{formatTime(startTime)} - {formatTime(endTime)}</p>
                          <p className="text-xs text-neutral-600 mt-1">{client.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-0">
              <div className="p-8 text-center text-neutral-500">
                Weekly view coming soon
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-0">
              <div className="p-8 text-center text-neutral-500">
                Monthly view coming soon
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      
      {/* Appointments Table */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg">Today's Appointments</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50">
                  <TableHead className="w-[250px]">Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">Loading appointments...</TableCell>
                  </TableRow>
                ) : filteredAppointments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">No appointments found</TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments?.map((appointment) => {
                    const client = appointment.client as { name: string, email: string, phone: string | null };
                    const service = appointment.service as { name: string };
                    const staff = appointment.staff as { name: string };
                    
                    return (
                      <TableRow key={appointment.id} className="hover:bg-neutral-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-neutral-200 rounded-full overflow-hidden">
                              {/* If we had client images, they would go here */}
                              <div className="h-full w-full flex items-center justify-center text-neutral-500">
                                {client.name.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-800">{client.name}</div>
                              <div className="text-sm text-neutral-500">{client.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-neutral-800">{service.name}</div>
                          <div className="text-sm text-neutral-500">{formatDuration(appointment.startTime, appointment.endTime)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-neutral-800">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</div>
                          <div className="text-sm text-neutral-500">{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-neutral-800">{staff.name}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                                  disabled={appointment.status === 'completed'}
                                >
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                  disabled={appointment.status === 'cancelled'}
                                  className="text-red-600"
                                >
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredAppointments && filteredAppointments.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-200">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredAppointments.length}</span> of{" "}
                    <span className="font-medium">{appointments?.length}</span> appointments
                  </p>
                </div>
                {/* Pagination would go here if needed */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
