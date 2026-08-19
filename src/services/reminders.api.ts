// Reminders API Service
// Maps to: backend/src/reminders/controllers/

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReminderType = 'medication' | 'appointment' | 'lab_test' | 'exercise' |
  'water' | 'meal' | 'checkup' | 'custom';

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  description?: string;
  frequency: ReminderFrequency;
  scheduledTime: string;
  daysOfWeek?: number[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notifyVia: ('push' | 'email' | 'sms')[];
  snoozeMinutes?: number;
  metadata?: Record<string, unknown>;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const remindersAPI = {
  /** Get all reminders */
  getAll: (type?: ReminderType, active?: boolean) =>
    api.get<Reminder[]>('/reminders', {
      params: { type, active },
    }),

  /** Get a single reminder */
  getById: (id: string) =>
    api.get<Reminder>(`/reminders/${id}`),

  /** Create a new reminder */
  create: (data: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt'>) =>
    api.post<Reminder>('/reminders', data),

  /** Update a reminder */
  update: (id: string, data: Partial<Reminder>) =>
    api.put<Reminder>(`/reminders/${id}`, data),

  /** Delete a reminder */
  delete: (id: string) =>
    api.delete(`/reminders/${id}`),

  /** Toggle reminder on/off */
  toggle: (id: string) =>
    api.post<Reminder>(`/reminders/${id}/toggle`),

  /** Snooze a reminder */
  snooze: (id: string, minutes: number) =>
    api.post<Reminder>(`/reminders/${id}/snooze`, { minutes }),

  /** Mark a reminder as done (e.g., took medication) */
  markDone: (id: string) =>
    api.post(`/reminders/${id}/done`),
};

export default remindersAPI;
