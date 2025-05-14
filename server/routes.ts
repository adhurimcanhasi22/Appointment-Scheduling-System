import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { userService } from "./services/userService";
import { scheduleService } from "./services/scheduleService";
import { notificationService } from "./services/notificationService";
import { storage } from "./storage";
import { z } from "zod";
import { registerUserSchema, loginUserSchema, insertAppointmentSchema } from "@shared/schema";

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const isStaff = async (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await userService.getUserById(req.session.userId);
    if (user.role === 'staff' || user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

declare module 'express-session' {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'beauty-salon-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    })
  );
  
  // API routes
  app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const user = await userService.register(userData);
      
      // Don't return password in response
      const { password, ...userResponse } = user;
      
      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to register user' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const credentials = loginUserSchema.parse(req.body);
      const user = await userService.login(credentials);
      
      // Don't return password in response
      const { password, ...userResponse } = user;
      
      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.status(200).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(401).json({ message: error instanceof Error ? error.message : 'Invalid credentials' });
      }
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: 'Failed to logout' });
      } else {
        res.status(200).json({ message: 'Logged out successfully' });
      }
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const user = await userService.getUserById(req.session.userId!);
      
      // Don't return password in response
      const { password, ...userResponse } = user;
      
      res.status(200).json(userResponse);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'User not found' });
    }
  });

  // Services routes
  app.get('/api/services', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let services;
      if (category) {
        services = await scheduleService.getServicesByCategory(category);
      } else {
        services = await scheduleService.getAllServices();
      }
      
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await scheduleService.getServiceById(id);
      res.status(200).json(service);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'Service not found' });
    }
  });

  // Staff routes
  app.get('/api/staff', async (req, res) => {
    try {
      const staff = await scheduleService.getAllStaff();
      res.status(200).json(staff);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch staff' });
    }
  });

  app.get('/api/staff/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await scheduleService.getStaffById(id);
      res.status(200).json(staffMember);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'Staff not found' });
    }
  });

  app.get('/api/staff/:id/services', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const services = await scheduleService.getStaffServices(id);
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch staff services' });
    }
  });

  app.get('/api/staff/:id/availability', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const availability = await scheduleService.getStaffAvailability(id);
      res.status(200).json(availability);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch staff availability' });
    }
  });

  // Time slot routes
  app.get('/api/availability/timeslots', async (req, res) => {
    try {
      const staffId = parseInt(req.query.staffId as string);
      const date = req.query.date as string;
      const serviceId = parseInt(req.query.serviceId as string);
      
      if (!staffId || !date || !serviceId) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      const timeSlots = await scheduleService.getAvailableTimeSlots(staffId, date, serviceId);
      res.status(200).json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch time slots' });
    }
  });

  // Appointment routes
  app.post('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Ensure the client ID matches the logged-in user unless they're staff
      if (req.session.userRole !== 'staff' && req.session.userRole !== 'admin' && appointmentData.clientId !== req.session.userId) {
        return res.status(403).json({ message: 'You can only book appointments for yourself' });
      }
      
      const appointment = await scheduleService.bookAppointment(appointmentData);
      
      // Send confirmation email
      await notificationService.sendAppointmentConfirmation(appointment.id);
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to book appointment' });
      }
    }
  });

  app.get('/api/appointments/client', isAuthenticated, async (req, res) => {
    try {
      const clientId = req.session.userId!;
      const appointments = await scheduleService.getClientAppointments(clientId);
      
      // Fetch additional details for each appointment
      const detailedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const service = await storage.getService(appointment.serviceId);
          const staffMember = await storage.getStaff(appointment.staffId);
          const staffUser = staffMember ? await storage.getUser(staffMember.userId) : null;
          
          return {
            ...appointment,
            service: service || { name: 'Unknown Service' },
            staff: staffUser ? { name: staffUser.name, profileImage: staffUser.profileImage } : { name: 'Unknown Staff' }
          };
        })
      );
      
      res.status(200).json(detailedAppointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/appointments/staff', isStaff, async (req, res) => {
    try {
      // Get the staff profile of the logged-in user
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const staffMember = await storage.getStaffByUserId(user.id);
      if (!staffMember) {
        return res.status(404).json({ message: 'Staff profile not found' });
      }
      
      const appointments = await scheduleService.getStaffAppointments(staffMember.id);
      
      // Fetch additional details for each appointment
      const detailedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const service = await storage.getService(appointment.serviceId);
          const client = await storage.getUser(appointment.clientId);
          
          return {
            ...appointment,
            service: service || { name: 'Unknown Service' },
            client: client ? { name: client.name, email: client.email, phone: client.phone } : { name: 'Unknown Client' }
          };
        })
      );
      
      res.status(200).json(detailedAppointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/appointments/date/:date', isStaff, async (req, res) => {
    try {
      const date = req.params.date;
      const appointments = await scheduleService.getAppointmentsByDate(date);
      
      // Fetch additional details for each appointment
      const detailedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const service = await storage.getService(appointment.serviceId);
          const client = await storage.getUser(appointment.clientId);
          const staffMember = await storage.getStaff(appointment.staffId);
          const staffUser = staffMember ? await storage.getUser(staffMember.userId) : null;
          
          return {
            ...appointment,
            service: service || { name: 'Unknown Service' },
            client: client ? { name: client.name, email: client.email, phone: client.phone } : { name: 'Unknown Client' },
            staff: staffUser ? { name: staffUser.name } : { name: 'Unknown Staff' }
          };
        })
      );
      
      res.status(200).json(detailedAppointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.put('/api/appointments/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const appointment = await scheduleService.updateAppointmentStatus(id, status);
      
      // Send notification if status is changed to cancelled
      if (status === 'cancelled') {
        await notificationService.sendAppointmentUpdate(id, 'cancelled');
      }
      
      res.status(200).json(appointment);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'Appointment not found' });
    }
  });

  app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the appointment to check permissions
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Check if the user is authorized to cancel this appointment
      if (req.session.userRole !== 'staff' && req.session.userRole !== 'admin' && appointment.clientId !== req.session.userId) {
        return res.status(403).json({ message: 'You are not authorized to cancel this appointment' });
      }
      
      const updatedAppointment = await scheduleService.cancelAppointment(id);
      
      // Send cancellation notification
      await notificationService.sendAppointmentUpdate(id, 'cancelled');
      
      res.status(200).json(updatedAppointment);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'Appointment not found' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
