import express, { type Request, Response } from "express";
import cors from "cors";
import { notificationService } from "../../server/services/notificationService";

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK', service: 'notification-service' });
});

// Notification routes
app.post('/appointment-confirmation/:appointmentId', async (req: Request, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const success = await notificationService.sendAppointmentConfirmation(appointmentId);
    
    if (success) {
      res.status(200).json({ message: 'Appointment confirmation sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send appointment confirmation' });
    }
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to send notification' 
    });
  }
});

app.post('/appointment-reminder/:appointmentId', async (req: Request, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const success = await notificationService.sendAppointmentReminder(appointmentId);
    
    if (success) {
      res.status(200).json({ message: 'Appointment reminder sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send appointment reminder' });
    }
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to send notification' 
    });
  }
});

app.post('/appointment-update/:appointmentId', async (req: Request, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const { changeType } = req.body;
    
    if (!changeType || !['rescheduled', 'cancelled', 'modified'].includes(changeType)) {
      return res.status(400).json({ message: 'Invalid change type' });
    }
    
    const success = await notificationService.sendAppointmentUpdate(
      appointmentId, 
      changeType as 'rescheduled' | 'cancelled' | 'modified'
    );
    
    if (success) {
      res.status(200).json({ message: 'Appointment update notification sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send appointment update notification' });
    }
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to send notification' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});