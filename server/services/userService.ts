import { storage } from '../storage';
import { RegisterUser, LoginUser, User, InsertUser } from '@shared/schema';
import { ZodError } from 'zod';

export class UserService {
  /**
   * Register a new user
   */
  async register(userData: RegisterUser): Promise<User> {
    // Check if user with email already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // In a real app, we would hash the password here
    const { confirmPassword, ...userToCreate } = userData;
    
    // Create the user
    return await storage.createUser(userToCreate);
  }
  
  /**
   * Authenticate a user
   */
  async login(credentials: LoginUser): Promise<User> {
    const user = await storage.getUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In a real app, we would verify the hashed password here
    if (user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }
    
    return user;
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    const user = await storage.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  
  /**
   * Update user profile
   */
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const updatedUser = await storage.updateUser(id, userData);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }
}

export const userService = new UserService();
