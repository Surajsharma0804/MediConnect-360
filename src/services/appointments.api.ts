// Appointments API Service
// Maps to: backend/src/appointments/controllers/appointment.controller.ts

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentType = 'video' | 'in_person' | 'phone';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    specializations: string[];
    profileImage?: string;
  };
  scheduledAt: string;
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  videoRoomUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface CreateAppointmentPayload {
  doctorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentPayload {
  scheduledAt?: string;
  durationMinutes?: number;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const appointmentsAPI = {
  /** Get all appointments for the current user */
  getAll: (upcoming?: boolean) =>
    api.get<Appointment[]>('/appointments', {
      params: { upcoming: upcoming ? 'true' : undefined },
    }),

  /** Get a single appointment by ID */
  getById: (id: string) =>
    api.get<Appointment>(`/appointments/${id}`),

  /** Create a new appointment */
  create: (data: CreateAppointmentPayload) =>
    api.post<Appointment>('/appointments', data),

  /** Update an existing appointment */
  update: (id: string, data: UpdateAppointmentPayload) =>
    api.put<Appointment>(`/appointments/${id}`, data),

  /** Cancel an appointment */
  cancel: (id: string, reason?: string) =>
    api.post<Appointment>(`/appointments/${id}/cancel`, { reason }),

  /** Delete (cancel) an appointment */
  delete: (id: string) =>
    api.delete(`/appointments/${id}`),

  /** Get available time slots for a provider on a specific date */
  getAvailableSlots: (providerId: string, date: string, duration?: number) =>
    api.get<TimeSlot[]>('/appointments/available-slots', {
      params: { providerId, date, duration },
    }),

  /** Get the next available slot for a provider */
  getNextAvailable: (providerId: string, duration?: number) =>
    api.get<TimeSlot>('/appointments/next-available', {
      params: { providerId, duration },
    }),
};

export default appointmentsAPI;
