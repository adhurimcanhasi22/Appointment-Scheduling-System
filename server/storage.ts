import {
  User, InsertUser, 
  Service, InsertService, 
  Staff, InsertStaff, 
  StaffService, InsertStaffService, 
  Availability, InsertAvailability, 
  UnavailableDate, InsertUnavailableDate, 
  Appointment, InsertAppointment
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Staff operations
  getStaff(id: number): Promise<Staff | undefined>;
  getStaffByUserId(userId: number): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;
  
  // Staff services operations
  getStaffServices(staffId: number): Promise<StaffService[]>;
  addStaffService(staffService: InsertStaffService): Promise<StaffService>;
  removeStaffService(staffId: number, serviceId: number): Promise<boolean>;
  
  // Availability operations
  getStaffAvailability(staffId: number): Promise<Availability[]>;
  setStaffAvailability(availability: InsertAvailability): Promise<Availability>;
  updateStaffAvailability(id: number, availability: Partial<InsertAvailability>): Promise<Availability | undefined>;
  deleteStaffAvailability(id: number): Promise<boolean>;
  
  // Unavailable dates operations
  getUnavailableDates(staffId: number): Promise<UnavailableDate[]>;
  addUnavailableDate(unavailableDate: InsertUnavailableDate): Promise<UnavailableDate>;
  removeUnavailableDate(id: number): Promise<boolean>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByClient(clientId: number): Promise<Appointment[]>;
  getAppointmentsByStaff(staffId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private staffs: Map<number, Staff>;
  private staffServices: Map<number, StaffService>;
  private availabilities: Map<number, Availability>;
  private unavailableDates: Map<number, UnavailableDate>;
  private appointments: Map<number, Appointment>;
  
  private userIdCounter: number;
  private serviceIdCounter: number;
  private staffIdCounter: number;
  private staffServiceIdCounter: number;
  private availabilityIdCounter: number;
  private unavailableDateIdCounter: number;
  private appointmentIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.staffs = new Map();
    this.staffServices = new Map();
    this.availabilities = new Map();
    this.unavailableDates = new Map();
    this.appointments = new Map();
    
    this.userIdCounter = 1;
    this.serviceIdCounter = 1;
    this.staffIdCounter = 1;
    this.staffServiceIdCounter = 1;
    this.availabilityIdCounter = 1;
    this.unavailableDateIdCounter = 1;
    this.appointmentIdCounter = 1;
    
    // Add sample data for testing
    this.seedData();
  }
  
  private seedData() {
    // Create sample users
    const admin = this.createUser({
      email: "admin@bellasalon.com",
      password: "password123", // In production, this would be hashed
      name: "Admin User",
      phone: "123-456-7890",
      role: "admin"
    });
    
    const client = this.createUser({
      email: "client@example.com",
      password: "password123",
      name: "John Smith",
      phone: "123-456-7890",
      role: "client"
    });
    
    const staffUser1 = this.createUser({
      email: "emma@bellasalon.com",
      password: "password123",
      name: "Emma Thompson",
      phone: "123-456-7891",
      role: "staff"
    });
    
    const staffUser2 = this.createUser({
      email: "alex@bellasalon.com",
      password: "password123",
      name: "Alex Rivera",
      phone: "123-456-7892",
      role: "staff"
    });
    
    const staffUser3 = this.createUser({
      email: "sophie@bellasalon.com",
      password: "password123",
      name: "Sophie Chen",
      phone: "123-456-7893",
      role: "staff"
    });
    
    // Create sample services
    const haircut = this.createService({
      name: "Haircut & Style",
      description: "Professional haircut and styling with one of our expert stylists.",
      duration: 45,
      price: 7500, // $75.00
      category: "hair",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const coloring = this.createService({
      name: "Hair Coloring",
      description: "Full hair coloring service to give you a fresh new look.",
      duration: 90,
      price: 12000, // $120.00
      category: "hair",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const manicure = this.createService({
      name: "Gel Manicure",
      description: "Long-lasting gel polish with nail care and cuticle treatment.",
      duration: 60,
      price: 4500, // $45.00
      category: "nails",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const facial = this.createService({
      name: "Signature Facial",
      description: "Customized facial treatment to address your specific skin concerns.",
      duration: 75,
      price: 9500, // $95.00
      category: "facial",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const beardTrim = this.createService({
      name: "Beard Trim",
      description: "Professional beard trimming and shaping.",
      duration: 30,
      price: 3000, // $30.00
      category: "hair",
      image: "https://images.unsplash.com/photo-1517941313333-e4d43f13db9e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    // Create staff profiles
    const emma = this.createStaff({
      userId: staffUser1.id,
      title: "Senior Hair Stylist",
      bio: "Specializes in cutting-edge hair styling and coloring techniques with 8+ years of experience.",
      rating: 480, // 4.8 stars
      reviewCount: 124
    });
    
    const alex = this.createStaff({
      userId: staffUser2.id,
      title: "Master Barber",
      bio: "Expert in modern and classic barbering techniques, specializing in men's grooming.",
      rating: 500, // 5.0 stars
      reviewCount: 87
    });
    
    const sophie = this.createStaff({
      userId: staffUser3.id,
      title: "Senior Esthetician",
      bio: "Facial specialist with expertise in skincare treatments and anti-aging techniques.",
      rating: 470, // 4.7 stars
      reviewCount: 142
    });
    
    // Assign services to staff
    this.addStaffService({ staffId: emma.id, serviceId: haircut.id });
    this.addStaffService({ staffId: emma.id, serviceId: coloring.id });
    
    this.addStaffService({ staffId: alex.id, serviceId: haircut.id });
    this.addStaffService({ staffId: alex.id, serviceId: beardTrim.id });
    
    this.addStaffService({ staffId: sophie.id, serviceId: facial.id });
    this.addStaffService({ staffId: sophie.id, serviceId: manicure.id });
    
    // Set staff availability (Sun-Sat, 9AM-8PM) - Emma and Alex work all week
    for (let day = 0; day <= 6; day++) {
      this.setStaffAvailability({ staffId: emma.id, dayOfWeek: day, startTime: "09:00", endTime: "20:00", isAvailable: true });
      this.setStaffAvailability({ staffId: alex.id, dayOfWeek: day, startTime: "09:00", endTime: "20:00", isAvailable: true });
      
      // Sophie only works Monday-Saturday
      if (day > 0) {
        this.setStaffAvailability({ staffId: sophie.id, dayOfWeek: day, startTime: "09:00", endTime: "17:00", isAvailable: true });
      }
    }
    
    // Create some sample appointments
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    this.createAppointment({
      clientId: client.id,
      staffId: emma.id,
      serviceId: haircut.id,
      date: todayStr,
      startTime: "10:00",
      endTime: "10:45",
      status: "confirmed",
      notes: "First time client"
    });
    
    this.createAppointment({
      clientId: client.id,
      staffId: alex.id,
      serviceId: beardTrim.id,
      date: todayStr,
      startTime: "11:00",
      endTime: "11:30",
      status: "completed",
      notes: ""
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.category === category);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }
  
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) return undefined;
    
    const updatedService: Service = { ...existingService, ...service };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
  
  // Staff operations
  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staffs.get(id);
  }
  
  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    for (const staff of this.staffs.values()) {
      if (staff.userId === userId) {
        return staff;
      }
    }
    return undefined;
  }
  
  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staffs.values());
  }
  
  async createStaff(staff: InsertStaff): Promise<Staff> {
    const id = this.staffIdCounter++;
    const newStaff: Staff = { ...staff, id };
    this.staffs.set(id, newStaff);
    return newStaff;
  }
  
  async updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined> {
    const existingStaff = this.staffs.get(id);
    if (!existingStaff) return undefined;
    
    const updatedStaff: Staff = { ...existingStaff, ...staff };
    this.staffs.set(id, updatedStaff);
    return updatedStaff;
  }
  
  async deleteStaff(id: number): Promise<boolean> {
    return this.staffs.delete(id);
  }
  
  // Staff services operations
  async getStaffServices(staffId: number): Promise<StaffService[]> {
    return Array.from(this.staffServices.values()).filter(ss => ss.staffId === staffId);
  }
  
  async addStaffService(staffService: InsertStaffService): Promise<StaffService> {
    const id = this.staffServiceIdCounter++;
    const newStaffService: StaffService = { ...staffService, id };
    this.staffServices.set(id, newStaffService);
    return newStaffService;
  }
  
  async removeStaffService(staffId: number, serviceId: number): Promise<boolean> {
    for (const [id, ss] of this.staffServices.entries()) {
      if (ss.staffId === staffId && ss.serviceId === serviceId) {
        return this.staffServices.delete(id);
      }
    }
    return false;
  }
  
  // Availability operations
  async getStaffAvailability(staffId: number): Promise<Availability[]> {
    return Array.from(this.availabilities.values()).filter(a => a.staffId === staffId);
  }
  
  async setStaffAvailability(availability: InsertAvailability): Promise<Availability> {
    const id = this.availabilityIdCounter++;
    const newAvailability: Availability = { ...availability, id };
    this.availabilities.set(id, newAvailability);
    return newAvailability;
  }
  
  async updateStaffAvailability(id: number, availability: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const existingAvailability = this.availabilities.get(id);
    if (!existingAvailability) return undefined;
    
    const updatedAvailability: Availability = { ...existingAvailability, ...availability };
    this.availabilities.set(id, updatedAvailability);
    return updatedAvailability;
  }
  
  async deleteStaffAvailability(id: number): Promise<boolean> {
    return this.availabilities.delete(id);
  }
  
  // Unavailable dates operations
  async getUnavailableDates(staffId: number): Promise<UnavailableDate[]> {
    return Array.from(this.unavailableDates.values()).filter(ud => ud.staffId === staffId);
  }
  
  async addUnavailableDate(unavailableDate: InsertUnavailableDate): Promise<UnavailableDate> {
    const id = this.unavailableDateIdCounter++;
    const newUnavailableDate: UnavailableDate = { ...unavailableDate, id };
    this.unavailableDates.set(id, newUnavailableDate);
    return newUnavailableDate;
  }
  
  async removeUnavailableDate(id: number): Promise<boolean> {
    return this.unavailableDates.delete(id);
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(a => a.clientId === clientId);
  }
  
  async getAppointmentsByStaff(staffId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(a => a.staffId === staffId);
  }
  
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(a => a.date === date);
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const newAppointment: Appointment = { 
      ...appointment, 
      id, 
      createdAt: new Date() 
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) return undefined;
    
    const updatedAppointment: Appointment = { ...existingAppointment, ...appointment };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
}

// Import PostgreSQL storage implementation
import { PostgresStorage } from './pgStorage';

// Use PostgreSQL storage for production, and MemStorage for dev if needed
const pgStorage = new PostgresStorage();

// Seed the database with initial data if needed
pgStorage.seedData().catch(err => {
  console.error('Failed to seed database:', err);
});

export const storage = pgStorage;
