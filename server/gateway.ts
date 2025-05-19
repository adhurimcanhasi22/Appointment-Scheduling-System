import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import fetch from "node-fetch";
import { log } from "./vite";

// Define service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const SCHEDULE_SERVICE_URL = process.env.SCHEDULE_SERVICE_URL || 'http://localhost:3002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'beauty-salon-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  })
);

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to check if user is staff
const isStaff = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const userResponse = await fetch(`${USER_SERVICE_URL}/users/${req.session.userId}`);
    if (!userResponse.ok) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await userResponse.json() as { role: string };
    if (user.role === 'staff' || user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// API routes
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Authentication routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${USER_SERVICE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    // Set session
    req.session.userId = data.id;
    req.session.userRole = data.role;
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to register user' 
    });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${USER_SERVICE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    // Set session
    req.session.userId = data.id;
    req.session.userRole = data.role;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to login' 
    });
  }
});

app.get('/api/auth/user', async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const response = await fetch(`${USER_SERVICE_URL}/users/${req.session.userId}`);
    
    if (!response.ok) {
      return res.status(response.status).json(await response.json());
    }
    
    const user = await response.json() as Record<string, any>;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to get current user' 
    });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// User routes
app.get('/api/users/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${USER_SERVICE_URL}/users/${req.params.id}`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to get user' 
    });
  }
});

app.put('/api/users/:id', isAuthenticated, async (req: Request, res: Response) => {
  // Ensure users can only update their own profile unless they're an admin
  if (req.session.userId !== parseInt(req.params.id) && req.session.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const response = await fetch(`${USER_SERVICE_URL}/users/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update user' 
    });
  }
});

// Service routes
app.get('/api/services', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    let url = `${SCHEDULE_SERVICE_URL}/services`;
    
    if (category) {
      url = `${SCHEDULE_SERVICE_URL}/services/category/${category}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch services' 
    });
  }
});

app.get('/api/services/:id', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/services/${req.params.id}`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch service' 
    });
  }
});

// Staff routes
app.get('/api/staff', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/staff`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff list' 
    });
  }
});

app.get('/api/staff/:id', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/staff/${req.params.id}`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff member' 
    });
  }
});

app.get('/api/staff/:staffId/services', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/staff/${req.params.staffId}/services`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff services' 
    });
  }
});

// Availability routes
app.get('/api/availability/timeslots', async (req: Request, res: Response) => {
  try {
    const { staffId, date, serviceId } = req.query;
    
    if (!staffId || !date || !serviceId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const url = `${SCHEDULE_SERVICE_URL}/availability/timeslots?staffId=${staffId}&date=${date}&serviceId=${serviceId}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch time slots' 
    });
  }
});

// Appointment routes
app.post('/api/appointments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Add client ID to appointment data
    const appointmentData = {
      ...req.body,
      clientId: req.session.userId
    };
    
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    // Send confirmation notification
    try {
      await fetch(`${NOTIFICATION_SERVICE_URL}/appointment-confirmation/${data.id}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to send appointment confirmation:', error);
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create appointment' 
    });
  }
});

app.get('/api/appointments/client', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const clientId = req.session.userId;
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/appointments/client/${clientId}`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch client appointments' 
    });
  }
});

app.get('/api/appointments/staff', isStaff, async (req: Request, res: Response) => {
  try {
    const staffId = req.query.staffId || req.session.userId;
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/appointments/staff/${staffId}`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch staff appointments' 
    });
  }
});

app.get('/api/appointments/date/:date', isStaff, async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/appointments/date/${req.params.date}`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch appointments by date' 
    });
  }
});

app.patch('/api/appointments/:id/status', isStaff, async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/appointments/${req.params.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    // Send update notification
    try {
      await fetch(`${NOTIFICATION_SERVICE_URL}/appointment-update/${req.params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeType: 'modified' })
      });
    } catch (error) {
      console.error('Failed to send appointment update notification:', error);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update appointment status' 
    });
  }
});

app.delete('/api/appointments/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SCHEDULE_SERVICE_URL}/appointments/${req.params.id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    // Send cancellation notification
    try {
      await fetch(`${NOTIFICATION_SERVICE_URL}/appointment-update/${req.params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeType: 'cancelled' })
      });
    } catch (error) {
      console.error('Failed to send appointment cancellation notification:', error);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to cancel appointment' 
    });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});

// Create HTTP server
const server = createServer(app);

export { app, server };