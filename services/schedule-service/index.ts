import express, { type Request, Response } from "express";
import { z } from "zod";
import cors from "cors";
import { insertAppointmentSchema } from "../../shared/schema";
import { scheduleService } from "../../server/services/scheduleService";

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK', service: 'schedule-service' });
});

// Service routes
app.get('/services', async (_, res: Response) => {
  try {
    const services = await scheduleService.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch services' 
    });
  }
});

app.get('/services/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const services = await scheduleService.getServicesByCategory(category);
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch services by category' 
    });
  }
});

app.get('/services/:id', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id);
    const service = await scheduleService.getServiceById(serviceId);
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch service' 
    });
  }
});

// Staff routes
app.get('/staff', async (_, res: Response) => {
  try {
    const staffList = await scheduleService.getAllStaff();
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff list' 
    });
  }
});

app.get('/staff/:id', async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.id);
    const staff = await scheduleService.getStaffById(staffId);
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff member' 
    });
  }
});

app.get('/staff/:staffId/services', async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const services = await scheduleService.getStaffServices(staffId);
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff services' 
    });
  }
});

// Availability routes
app.get('/availability/timeslots', async (req: Request, res: Response) => {
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
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch time slots' 
    });
  }
});

// Appointment routes
app.post('/appointments', async (req: Request, res: Response) => {
  try {
    const appointmentData = insertAppointmentSchema.parse(req.body);
    
    // Check availability
    const isAvailable = await scheduleService.checkAvailability(
      appointmentData.staffId,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime
    );
    
    if (!isAvailable) {
      return res.status(400).json({ message: 'The selected time slot is not available' });
    }
    
    // Create appointment
    const appointment = await scheduleService.bookAppointment(appointmentData);
    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to create appointment' 
      });
    }
  }
});

app.get('/appointments/client/:clientId', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const appointments = await scheduleService.getClientAppointments(clientId);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch client appointments' 
    });
  }
});

app.get('/appointments/staff/:staffId', async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const appointments = await scheduleService.getStaffAppointments(staffId);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff appointments' 
    });
  }
});

app.get('/appointments/date/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const appointments = await scheduleService.getAppointmentsByDate(date);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch appointments by date' 
    });
  }
});

app.patch('/appointments/:id/status', async (req: Request, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const appointment = await scheduleService.updateAppointmentStatus(appointmentId, status);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update appointment status' 
    });
  }
});

app.delete('/appointments/:id', async (req: Request, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const appointment = await scheduleService.cancelAppointment(appointmentId);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to cancel appointment' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Schedule service running on port ${PORT}`);
});