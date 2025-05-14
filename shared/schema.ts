import { pgTable, text, serial, integer, boolean, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Handles both clients and staff
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 20 }).notNull().default("client"), // client, staff, admin
  profileImage: text("profile_image"),
});

// Services offered by the salon
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // stored in cents
  category: varchar("category", { length: 50 }).notNull(), // hair, nails, facial, massage, makeup
  image: text("image"),
});

// Staff profiles (extends user)
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 100 }).notNull(), // e.g., Senior Hair Stylist
  bio: text("bio"),
  rating: integer("rating"), // Out of 500 (for decimal precision)
  reviewCount: integer("review_count").default(0),
});

// Services that each staff member can provide
export const staffServices = pgTable("staff_services", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => staff.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
});

// Staff availability
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => staff.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "17:00"
  isAvailable: boolean("is_available").notNull().default(true),
});

// Custom dates when staff is unavailable (vacation, etc.)
export const unavailableDates = pgTable("unavailable_dates", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => staff.id),
  date: varchar("date", { length: 10 }).notNull(), // "2023-07-11"
  reason: text("reason"),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id),
  staffId: integer("staff_id").notNull().references(() => staff.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  date: varchar("date", { length: 10 }).notNull(), // "2023-07-11"
  startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "10:00"
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // confirmed, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true });
export const insertStaffServiceSchema = createInsertSchema(staffServices).omit({ id: true });
export const insertAvailabilitySchema = createInsertSchema(availability).omit({ id: true });
export const insertUnavailableDateSchema = createInsertSchema(unavailableDates).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });

// Extension schemas for validation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type StaffService = typeof staffServices.$inferSelect;
export type InsertStaffService = z.infer<typeof insertStaffServiceSchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type UnavailableDate = typeof unavailableDates.$inferSelect;
export type InsertUnavailableDate = z.infer<typeof insertUnavailableDateSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
