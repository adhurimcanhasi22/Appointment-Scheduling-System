import { apiRequest } from '@/lib/queryClient';
import type {
  User, Service, Staff, Appointment,
  RegisterUser, LoginUser
} from '@shared/schema';

// User API
export const registerUser = async (userData: RegisterUser): Promise<User> => {
  const res = await apiRequest('POST', '/api/auth/register', userData);
  return res.json();
};

export const loginUser = async (credentials: LoginUser): Promise<User> => {
  const res = await apiRequest('POST', '/api/auth/login', credentials);
  return res.json();
};

export const logoutUser = async (): Promise<void> => {
  await apiRequest('POST', '/api/auth/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await apiRequest('GET', '/api/auth/user');
  return res.json();
};

// Services API
export const getServices = async (category?: string): Promise<Service[]> => {
  const url = category ? `/api/services?category=${category}` : '/api/services';
  const res = await apiRequest('GET', url);
  return res.json();
};

export const getServiceById = async (id: number): Promise<Service> => {
  const res = await apiRequest('GET', `/api/services/${id}`);
  return res.json();
};

// Staff API
export const getAllStaff = async (): Promise<Array<Staff & { user: { name: string, profileImage?: string | null } }>> => {
  const res = await apiRequest('GET', '/api/staff');
  return res.json();
};

export const getStaffById = async (id: number): Promise<Staff & { user: { name: string, profileImage?: string | null } }> => {
  const res = await apiRequest('GET', `/api/staff/${id}`);
  return res.json();
};

export const getStaffServices = async (staffId: number): Promise<Service[]> => {
  const res = await apiRequest('GET', `/api/staff/${staffId}/services`);
  return res.json();
};

// Availability API
export const getAvailableTimeSlots = async (staffId: number, date: string, serviceId: number): Promise<string[]> => {
  const res = await apiRequest('GET', `/api/availability/timeslots?staffId=${staffId}&date=${date}&serviceId=${serviceId}`);
  return res.json();
};

// Appointment API
export const createAppointment = async (appointmentData: {
  clientId: number;
  staffId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<Appointment> => {
  const res = await apiRequest('POST', '/api/appointments', appointmentData);
  return res.json();
};

export const getClientAppointments = async (): Promise<Appointment[]> => {
  const res = await apiRequest('GET', '/api/appointments/client');
  return res.json();
};

export const getStaffAppointments = async (): Promise<Appointment[]> => {
  const res = await apiRequest('GET', '/api/appointments/staff');
  return res.json();
};

export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  const res = await apiRequest('GET', `/api/appointments/date/${date}`);
  return res.json();
};

export const updateAppointmentStatus = async (id: number, status: 'confirmed' | 'completed' | 'cancelled'): Promise<Appointment> => {
  const res = await apiRequest('PUT', `/api/appointments/${id}/status`, { status });
  return res.json();
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
  const res = await apiRequest('DELETE', `/api/appointments/${id}`);
  return res.json();
};
