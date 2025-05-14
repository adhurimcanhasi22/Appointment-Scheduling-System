import { db } from './db';
import { 
  users, services, staff, staffServices, 
  availability, unavailableDates, appointments,
  User, Service, Staff, StaffService, 
  Availability, UnavailableDate, Appointment,
  InsertUser, InsertService, InsertStaff, InsertStaffService,
  InsertAvailability, InsertUnavailableDate, InsertAppointment
} from '@shared/schema';
import type { IStorage } from './storage';
import { eq, and } from 'drizzle-orm';

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(users).values(user).returning();
    return results[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const results = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return results[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.count > 0;
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const results = await db.select().from(services).where(eq(services.id, id));
    return results[0];
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.category, category));
  }

  async createService(service: InsertService): Promise<Service> {
    const results = await db.insert(services).values(service).returning();
    return results[0];
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const results = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return results[0];
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.count > 0;
  }

  // Staff operations
  async getStaff(id: number): Promise<Staff | undefined> {
    const results = await db.select().from(staff).where(eq(staff.id, id));
    return results[0];
  }

  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    const results = await db.select().from(staff).where(eq(staff.userId, userId));
    return results[0];
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async createStaff(staffMember: InsertStaff): Promise<Staff> {
    const results = await db.insert(staff).values(staffMember).returning();
    return results[0];
  }

  async updateStaff(id: number, staffUpdate: Partial<InsertStaff>): Promise<Staff | undefined> {
    const results = await db.update(staff).set(staffUpdate).where(eq(staff.id, id)).returning();
    return results[0];
  }

  async deleteStaff(id: number): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return result.count > 0;
  }

  // Staff services operations
  async getStaffServices(staffId: number): Promise<StaffService[]> {
    return await db.select().from(staffServices).where(eq(staffServices.staffId, staffId));
  }

  async addStaffService(staffService: InsertStaffService): Promise<StaffService> {
    const results = await db.insert(staffServices).values(staffService).returning();
    return results[0];
  }

  async removeStaffService(staffId: number, serviceId: number): Promise<boolean> {
    const result = await db.delete(staffServices)
      .where(and(
        eq(staffServices.staffId, staffId),
        eq(staffServices.serviceId, serviceId)
      ));
    return result.count > 0;
  }

  // Availability operations
  async getStaffAvailability(staffId: number): Promise<Availability[]> {
    return await db.select().from(availability).where(eq(availability.staffId, staffId));
  }

  async setStaffAvailability(availabilityData: InsertAvailability): Promise<Availability> {
    const results = await db.insert(availability).values(availabilityData).returning();
    return results[0];
  }

  async updateStaffAvailability(id: number, availabilityUpdate: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const results = await db.update(availability).set(availabilityUpdate).where(eq(availability.id, id)).returning();
    return results[0];
  }

  async deleteStaffAvailability(id: number): Promise<boolean> {
    const result = await db.delete(availability).where(eq(availability.id, id));
    return result.count > 0;
  }

  // Unavailable dates operations
  async getUnavailableDates(staffId: number): Promise<UnavailableDate[]> {
    return await db.select().from(unavailableDates).where(eq(unavailableDates.staffId, staffId));
  }

  async addUnavailableDate(unavailableDate: InsertUnavailableDate): Promise<UnavailableDate> {
    const results = await db.insert(unavailableDates).values(unavailableDate).returning();
    return results[0];
  }

  async removeUnavailableDate(id: number): Promise<boolean> {
    const result = await db.delete(unavailableDates).where(eq(unavailableDates.id, id));
    return result.count > 0;
  }

  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const results = await db.select().from(appointments).where(eq(appointments.id, id));
    return results[0];
  }

  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.clientId, clientId));
  }

  async getAppointmentsByStaff(staffId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.staffId, staffId));
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.date, date));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const results = await db.insert(appointments).values({
      ...appointment,
      createdAt: new Date()
    }).returning();
    return results[0];
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const results = await db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    return results[0];
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.count > 0;
  }

  // Initialize database with seed data
  async seedData() {
    // Check if we already have users
    const userCount = await db.select().from(users);
    if (userCount.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');
    
    // Create sample users
    const admin = await this.createUser({
      email: "admin@bellasalon.com",
      password: "password123", // In production, this would be hashed
      name: "Admin User",
      phone: "123-456-7890",
      role: "admin"
    });
    
    const client = await this.createUser({
      email: "client@example.com",
      password: "password123",
      name: "John Smith",
      phone: "123-456-7890",
      role: "client"
    });
    
    const staffUser1 = await this.createUser({
      email: "emma@bellasalon.com",
      password: "password123",
      name: "Emma Thompson",
      phone: "123-456-7891",
      role: "staff"
    });
    
    const staffUser2 = await this.createUser({
      email: "alex@bellasalon.com",
      password: "password123",
      name: "Alex Rivera",
      phone: "123-456-7892",
      role: "staff"
    });
    
    const staffUser3 = await this.createUser({
      email: "sophie@bellasalon.com",
      password: "password123",
      name: "Sophie Chen",
      phone: "123-456-7893",
      role: "staff"
    });
    
    // Create sample services
    const haircut = await this.createService({
      name: "Haircut & Style",
      description: "Professional haircut and styling with one of our expert stylists.",
      duration: 45,
      price: 7500, // $75.00
      category: "hair",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const coloring = await this.createService({
      name: "Hair Coloring",
      description: "Full hair coloring service to give you a fresh new look.",
      duration: 90,
      price: 12000, // $120.00
      category: "hair",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const manicure = await this.createService({
      name: "Gel Manicure",
      description: "Long-lasting gel polish with nail care and cuticle treatment.",
      duration: 60,
      price: 4500, // $45.00
      category: "nails",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const facial = await this.createService({
      name: "Signature Facial",
      description: "Customized facial treatment to address your specific skin concerns.",
      duration: 75,
      price: 9500, // $95.00
      category: "facial",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    const beardTrim = await this.createService({
      name: "Beard Trim",
      description: "Professional beard trimming and shaping.",
      duration: 30,
      price: 3000, // $30.00
      category: "hair",
      image: "https://images.unsplash.com/photo-1517941313333-e4d43f13db9e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
    });
    
    // Create staff profiles
    const emma = await this.createStaff({
      userId: staffUser1.id,
      title: "Senior Hair Stylist",
      bio: "Specializes in cutting-edge hair styling and coloring techniques with 8+ years of experience.",
      rating: 480, // 4.8 stars
      reviewCount: 124
    });
    
    const alex = await this.createStaff({
      userId: staffUser2.id,
      title: "Master Barber",
      bio: "Expert in modern and classic barbering techniques, specializing in men's grooming.",
      rating: 500, // 5.0 stars
      reviewCount: 87
    });
    
    const sophie = await this.createStaff({
      userId: staffUser3.id,
      title: "Senior Esthetician",
      bio: "Facial specialist with expertise in skincare treatments and anti-aging techniques.",
      rating: 470, // 4.7 stars
      reviewCount: 142
    });
    
    // Assign services to staff
    await this.addStaffService({ staffId: emma.id, serviceId: haircut.id });
    await this.addStaffService({ staffId: emma.id, serviceId: coloring.id });
    
    await this.addStaffService({ staffId: alex.id, serviceId: haircut.id });
    await this.addStaffService({ staffId: alex.id, serviceId: beardTrim.id });
    
    await this.addStaffService({ staffId: sophie.id, serviceId: facial.id });
    await this.addStaffService({ staffId: sophie.id, serviceId: manicure.id });
    
    // Set staff availability (Sun-Sat, 9AM-8PM) - Emma and Alex work all week
    for (let day = 0; day <= 6; day++) {
      await this.setStaffAvailability({ 
        staffId: emma.id, 
        dayOfWeek: day, 
        startTime: "09:00", 
        endTime: "20:00", 
        isAvailable: true 
      });
      
      await this.setStaffAvailability({ 
        staffId: alex.id, 
        dayOfWeek: day, 
        startTime: "09:00", 
        endTime: "20:00", 
        isAvailable: true 
      });
      
      // Sophie only works Monday-Saturday
      if (day > 0) {
        await this.setStaffAvailability({ 
          staffId: sophie.id, 
          dayOfWeek: day, 
          startTime: "09:00", 
          endTime: "17:00", 
          isAvailable: true 
        });
      }
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Helper function to add days to a date
    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const tomorrowStr = addDays(today, 1).toISOString().split('T')[0];
    
    // Create some sample appointments
    await this.createAppointment({
      clientId: client.id,
      staffId: emma.id,
      serviceId: haircut.id,
      date: todayStr,
      startTime: "10:00",
      endTime: "10:45",
      status: "confirmed",
      notes: "First time client"
    });
    
    await this.createAppointment({
      clientId: client.id,
      staffId: alex.id,
      serviceId: beardTrim.id,
      date: tomorrowStr,
      startTime: "11:00",
      endTime: "11:30",
      status: "confirmed",
      notes: ""
    });

    console.log('Database seeding completed!');
  }
}