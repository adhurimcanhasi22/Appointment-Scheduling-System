import { storage } from '../storage';
import { Appointment } from '@shared/schema';

export class NotificationService {
  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(appointmentId: number): Promise<boolean> {
    try {
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      const client = await storage.getUser(appointment.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
      
      const staff = await storage.getStaff(appointment.staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }
      
      const staffUser = await storage.getUser(staff.userId);
      if (!staffUser) {
        throw new Error('Staff user not found');
      }
      
      const service = await storage.getService(appointment.serviceId);
      if (!service) {
        throw new Error('Service not found');
      }
      
      console.log(`[EMAIL] To: ${client.email}`);
      console.log(`[EMAIL] Subject: Your Bella Salon Appointment Confirmation`);
      console.log(`[EMAIL] Body: 
        Hello ${client.name},
        
        Your appointment has been confirmed!
        
        Details:
        - Service: ${service.name}
        - Date: ${appointment.date}
        - Time: ${appointment.startTime} - ${appointment.endTime}
        - Stylist: ${staffUser.name}
        
        Please arrive 10 minutes before your scheduled appointment time.
        
        If you need to cancel or reschedule, please do so at least 24 hours in advance.
        
        Thank you for choosing Bella Salon!
      `);
      
      // In a real implementation, this would send an actual email using a service like SendGrid
      
      return true;
    } catch (error) {
      console.error('Failed to send appointment confirmation:', error);
      return false;
    }
  }
  
  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(appointmentId: number): Promise<boolean> {
    try {
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      const client = await storage.getUser(appointment.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
      
      const staff = await storage.getStaff(appointment.staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }
      
      const staffUser = await storage.getUser(staff.userId);
      if (!staffUser) {
        throw new Error('Staff user not found');
      }
      
      const service = await storage.getService(appointment.serviceId);
      if (!service) {
        throw new Error('Service not found');
      }
      
      console.log(`[EMAIL] To: ${client.email}`);
      console.log(`[EMAIL] Subject: Reminder: Your Bella Salon Appointment Tomorrow`);
      console.log(`[EMAIL] Body: 
        Hello ${client.name},
        
        This is a friendly reminder about your appointment tomorrow.
        
        Details:
        - Service: ${service.name}
        - Date: ${appointment.date}
        - Time: ${appointment.startTime} - ${appointment.endTime}
        - Stylist: ${staffUser.name}
        
        Please arrive 10 minutes before your scheduled appointment time.
        
        If you need to cancel or reschedule, please do so at least 24 hours in advance.
        
        Thank you for choosing Bella Salon!
      `);
      
      // In a real implementation, this would send an actual email using a service like SendGrid
      
      return true;
    } catch (error) {
      console.error('Failed to send appointment reminder:', error);
      return false;
    }
  }
  
  /**
   * Send appointment update notification
   */
  async sendAppointmentUpdate(appointmentId: number, changeType: 'rescheduled' | 'cancelled' | 'modified'): Promise<boolean> {
    try {
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      const client = await storage.getUser(appointment.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
      
      const staff = await storage.getStaff(appointment.staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }
      
      const staffUser = await storage.getUser(staff.userId);
      if (!staffUser) {
        throw new Error('Staff user not found');
      }
      
      const service = await storage.getService(appointment.serviceId);
      if (!service) {
        throw new Error('Service not found');
      }
      
      let subject = '';
      let message = '';
      
      switch (changeType) {
        case 'rescheduled':
          subject = 'Your Bella Salon Appointment Has Been Rescheduled';
          message = `Your appointment has been rescheduled to ${appointment.date} at ${appointment.startTime}.`;
          break;
        case 'cancelled':
          subject = 'Your Bella Salon Appointment Has Been Cancelled';
          message = 'Your appointment has been cancelled. If you did not request this cancellation, please contact us.';
          break;
        case 'modified':
          subject = 'Your Bella Salon Appointment Has Been Modified';
          message = 'Your appointment details have been modified. Please review the updated information below.';
          break;
      }
      
      console.log(`[EMAIL] To: ${client.email}`);
      console.log(`[EMAIL] Subject: ${subject}`);
      console.log(`[EMAIL] Body: 
        Hello ${client.name},
        
        ${message}
        
        Updated Details:
        - Service: ${service.name}
        - Date: ${appointment.date}
        - Time: ${appointment.startTime} - ${appointment.endTime}
        - Stylist: ${staffUser.name}
        
        If you have any questions, please contact us.
        
        Thank you for choosing Bella Salon!
      `);
      
      // Also notify staff
      console.log(`[EMAIL] To: ${staffUser.email}`);
      console.log(`[EMAIL] Subject: Appointment ${changeType.charAt(0).toUpperCase() + changeType.slice(1)}`);
      console.log(`[EMAIL] Body: 
        Hello ${staffUser.name},
        
        An appointment has been ${changeType}:
        
        Details:
        - Client: ${client.name}
        - Service: ${service.name}
        - Date: ${appointment.date}
        - Time: ${appointment.startTime} - ${appointment.endTime}
        
        Please update your schedule accordingly.
      `);
      
      // In a real implementation, this would send actual emails using a service like SendGrid
      
      return true;
    } catch (error) {
      console.error(`Failed to send appointment ${changeType} notification:`, error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
