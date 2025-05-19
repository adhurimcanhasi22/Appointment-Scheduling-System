import express, { type Request, Response } from "express";
import { z } from "zod";
import cors from "cors";
import { registerUserSchema, loginUserSchema } from "../../shared/schema";
import { userService } from "../../server/services/userService";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

// User routes
app.post('/register', async (req: Request, res: Response) => {
  try {
    const userData = registerUserSchema.parse(req.body);
    const user = await userService.register(userData);
    
    // Don't return password in response
    const { password, ...userResponse } = user;
    
    res.status(201).json(userResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to register user' 
      });
    }
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const credentials = loginUserSchema.parse(req.body);
    const user = await userService.login(credentials);
    
    // Don't return password in response
    const { password, ...userResponse } = user;
    
    res.status(200).json(userResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(401).json({ 
        message: error instanceof Error ? error.message : 'Invalid credentials' 
      });
    }
  }
});

app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return password in response
    const { password, ...userResponse } = user;
    
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to get user' 
    });
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const userData = req.body;
    
    const updatedUser = await userService.updateUser(userId, userData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return password in response
    const { password, ...userResponse } = updatedUser;
    
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update user' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});