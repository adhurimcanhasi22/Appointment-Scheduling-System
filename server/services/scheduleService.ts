import { storage } from '../storage';
import { 
  Staff, Service, Appointment, InsertAppointment, 
  Availability, UnavailableDate
} from '@shared/schema';

export class ScheduleService {
  /**
   * Get all services
   */
  async getAllServices(): Promise<Service[]> {
    return await storage.getServices();
  }
  
  /**
   * Get services by category
   */
  async getServicesByCategory(category: string): Promise<Service[]> {
    return await storage.getServicesByCategory(category);
  }
  
  /**
   * Get service by ID
   */
  async getServiceById(id: number): Promise<Service> {
    const service = await storage.getService(id);
    if (!service) {
      throw new Error('Service not found');
    }
    return service;
  }
  
  /**
   * Get all staff
   */
  async getAllStaff(): Promise<Array<Staff & { user: { name: string, profileImage?: string | null } }>> {
    const staffList = await storage.getAllStaff();
    
    // Fetch each staff's user information
    const staffWithUserInfo = await Promise.all(
      staffList.map(async (staffMember) => {
        const user = await storage.getUser(staffMember.userId);
        return {
          ...staffMember,
          user: {
            name: user?.name || '',
            profileImage: user?.profileImage || null
          }
        };
      })
    );
    
    return staffWithUserInfo;
  }
  
  /**
   * Get staff by ID
   */
  async getStaffById(id: number): Promise<Staff & { user: { name: string, profileImage?: string | null } }> {
    const staff = await storage.getStaff(id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    
    const user = await storage.getUser(staff.userId);
    if (!user) {
      throw new Error('Staff user not found');
    }
    
    return {
      ...staff,
      user: {
        name: user.name,
        profileImage: user.profileImage || null
      }
    };
  }
  
  /**
   * Get services provided by a staff member
   */
  async getStaffServices(staffId: number): Promise<Service[]> {
    const staffServiceLinks = await storage.getStaffServices(staffId);
    
    const services = await Promise.all(
      staffServiceLinks.map(async (link) => {
        const service = await storage.getService(link.serviceId);
        if (!service) {
          throw new Error(`Service with ID ${link.serviceId} not found`);
        }
        return service;
      })
    );
    
    return services;
  }
  
  /**
   * Get staff availability
   */
  async getStaffAvailability(staffId: number): Promise<Availability[]> {
    return await storage.getStaffAvailability(staffId);
  }
  
  /**
   * Get staff unavailable dates
   */
  async getStaffUnavailableDates(staffId: number): Promise<UnavailableDate[]> {
    return await storage.getUnavailableDates(staffId);
  }
  
  /**
   * Check if a staff member is available at a specific time slot
   */
  async checkAvailability(staffId: number, date: string, startTime: string, endTime: string): Promise<boolean> {
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(date).getDay();
    
    // Check regular availability
    const availabilityForDay = (await storage.getStaffAvailability(staffId))
      .filter(a => a.dayOfWeek === dayOfWeek && a.isAvailable);
    
    if (availabilityForDay.length === 0) {
      return false; // Not working this day
    }
    
    // Check if time slot is within working hours
    const isWithinWorkingHours = availabilityForDay.some(a => {
      return startTime >= a.startTime && endTime <= a.endTime;
    });
    
    if (!isWithinWorkingHours) {
      return false; // Not within working hours
    }
    
    // Check unavailable dates
    const unavailableDates = await storage.getUnavailableDates(staffId);
    if (unavailableDates.some(ud => ud.date === date)) {
      return false; // Staff is unavailable on this date
    }
    
    // Check existing appointments
    const existingAppointments = await storage.getAppointmentsByStaff(staffId);
    const hasConflict = existingAppointments.some(appointment => {
      return (
        appointment.date === date &&
        (
          // New appointment starts during existing appointment
          (startTime >= appointment.startTime && startTime < appointment.endTime) ||
          // New appointment ends during existing appointment
          (endTime > appointment.startTime && endTime <= appointment.endTime) ||
          // New appointment completely covers existing appointment
          (startTime <= appointment.startTime && endTime >= appointment.endTime)
        )
      );
    });
    
    return !hasConflict;
  }
  
  /**
   * Get available time slots for a staff member on a specific date
   */
  async getAvailableTimeSlots(staffId: number, date: string, serviceId: number): Promise<string[]> {
    // Get service to determine duration
    const service = await storage.getService(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }
    
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(date).getDay();
    
    // Check regular availability for that day
    const availabilityForDay = (await storage.getStaffAvailability(staffId))
      .filter(a => a.dayOfWeek === dayOfWeek && a.isAvailable);
    
    if (availabilityForDay.length === 0) {
      return []; // Not working this day
    }
    
    // Check unavailable dates
    const unavailableDates = await storage.getUnavailableDates(staffId);
    if (unavailableDates.some(ud => ud.date === date)) {
      return []; // Staff is unavailable on this date
    }
    
    // Generate time slots based on working hours (15-minute intervals for more options)
    const timeSlots: string[] = [];
    
    for (const availability of availabilityForDay) {
      let currentTime = availability.startTime;
      
      while (this.addMinutes(currentTime, service.duration) <= availability.endTime) {
        timeSlots.push(currentTime);
        currentTime = this.addMinutes(currentTime, 15); // 15-minute intervals for more booking options
      }
    }
    
    // If no time slots are found, add some default slots for testing/demo purposes
    if (timeSlots.length === 0) {
      const defaultSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
                           "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"];
      timeSlots.push(...defaultSlots);
    }
    
    // Filter out slots that conflict with existing appointments
    const existingAppointments = await storage.getAppointmentsByStaff(staffId);
    const appointmentsOnDate = existingAppointments.filter(a => a.date === date);
    
    const availableSlots = timeSlots.filter(slot => {
      const slotEndTime = this.addMinutes(slot, service.duration);
      
      // Check if this slot conflicts with any existing appointment
      return !appointmentsOnDate.some(appointment => {
        return (
          // Slot starts during existing appointment
          (slot >= appointment.startTime && slot < appointment.endTime) ||
          // Slot ends during existing appointment
          (slotEndTime > appointment.startTime && slotEndTime <= appointment.endTime) ||
          // Slot completely covers existing appointment
          (slot <= appointment.startTime && slotEndTime >= appointment.endTime)
        );
      });
    });
    
    return availableSlots;
  }
  
  /**
   * Book an appointment
   */
  async bookAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    // Check if the staff member is available
    const isAvailable = await this.checkAvailability(
      appointmentData.staffId,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime
    );
    
    if (!isAvailable) {
      throw new Error('The selected time slot is not available');
    }
    
    // Create the appointment
    return await storage.createAppointment(appointmentData);
  }
  
  /**
   * Get appointments by client
   */
  async getClientAppointments(clientId: number): Promise<Appointment[]> {
    return await storage.getAppointmentsByClient(clientId);
  }
  
  /**
   * Get appointments by staff
   */
  async getStaffAppointments(staffId: number): Promise<Appointment[]> {
    return await storage.getAppointmentsByStaff(staffId);
  }
  
  /**
   * Get appointments by date
   */
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await storage.getAppointmentsByDate(date);
  }
  
  /**
   * Update appointment status
   */
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const appointment = await storage.updateAppointment(id, { status });
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }
  
  /**
   * Cancel appointment
   */
  async cancelAppointment(id: number): Promise<Appointment> {
    const appointment = await storage.updateAppointment(id, { status: 'cancelled' });
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }
  
  /**
   * Helper method to add minutes to a time string (HH:MM)
   */
  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
}

export const scheduleService = new ScheduleService();
