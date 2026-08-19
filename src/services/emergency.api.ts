// Emergency API Service
// Maps to: backend/src/emergency/controllers/sos.controller.ts + emergency-contact.controller.ts + medical-id.controller.ts

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SOSAlert {
  id: string;
  userId: string;
  status: 'active' | 'cancelled' | 'resolved';
  location?: GeoLocation;
  emergencyType?: string;
  notes?: string;
  contacts_notified: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notifyOnSOS: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalID {
  id: string;
  userId: string;
  bloodType?: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyNotes?: string;
  organDonor?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerSOSPayload {
  emergencyType?: string;
  location?: GeoLocation;
  notes?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const emergencyAPI = {
  // ─── SOS ──────────────────────────────────────────────────────────────
  
  /** Trigger an emergency SOS alert */
  triggerSOS: (data: TriggerSOSPayload) =>
    api.post<SOSAlert>('/emergency/sos', data),

  /** Cancel an active SOS alert */
  cancelSOS: () =>
    api.post<{ message: string }>('/emergency/sos/cancel'),

  /** Get current SOS status */
  getSOSStatus: () =>
    api.get<SOSAlert | null>('/emergency/sos/status'),

  /** Share live location during SOS */
  shareLocation: (location: GeoLocation) =>
    api.post('/emergency/sos/location', { location }),

  // ─── Emergency Contacts ───────────────────────────────────────────────

  /** Get all emergency contacts */
  getContacts: () =>
    api.get<EmergencyContact[]>('/emergency/contacts'),

  /** Get a single emergency contact */
  getContact: (id: string) =>
    api.get<EmergencyContact>(`/emergency/contacts/${id}`),

  /** Create a new emergency contact */
  createContact: (data: Omit<EmergencyContact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    api.post<EmergencyContact>('/emergency/contacts', data),

  /** Update an emergency contact */
  updateContact: (id: string, data: Partial<EmergencyContact>) =>
    api.put<EmergencyContact>(`/emergency/contacts/${id}`, data),

  /** Delete an emergency contact */
  deleteContact: (id: string) =>
    api.delete(`/emergency/contacts/${id}`),

  // ─── Medical ID ───────────────────────────────────────────────────────

  /** Get current user's Medical ID */
  getMedicalID: () =>
    api.get<MedicalID>('/emergency/medical-id'),

  /** Create or update Medical ID */
  updateMedicalID: (data: Partial<MedicalID>) =>
    api.put<MedicalID>('/emergency/medical-id', data),
};

export default emergencyAPI;
