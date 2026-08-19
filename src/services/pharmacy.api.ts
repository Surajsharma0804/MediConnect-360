// Pharmacy & Medications API Service
// Maps to: backend/src/pharmacy/controllers/*.controller.ts

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Pharmacy {
  id: string;
  name: string;
  chain?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  hours?: Record<string, { open: string; close: string }>;
  services?: string[];
  is24Hour: boolean;
  acceptsInsurance: boolean;
  hasDelivery: boolean;
  hasDriveThrough: boolean;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  userId: string;
  providerId: string;
  pharmacyId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refillsRemaining: number;
  status: 'active' | 'completed' | 'cancelled' | 'on_hold';
  startDate: string;
  endDate?: string;
  instructions?: string;
  sideEffects?: string[];
  provider?: { firstName: string; lastName: string; title?: string };
  createdAt: string;
  updatedAt: string;
}

export interface DrugPrice {
  id: string;
  drugName: string;
  genericName?: string;
  strength: string;
  form: string;
  pharmacyId: string;
  price: number;
  insurancePrice?: number;
  quantity: number;
  pharmacy?: Pharmacy;
}

export interface EPrescription {
  id: string;
  patientId: string;
  prescriberId: string;
  pharmacyId?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    quantity: number;
    refills: number;
    instructions?: string;
  }>;
  status: 'pending' | 'sent' | 'received' | 'filled' | 'cancelled';
  sentAt?: string;
  filledAt?: string;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const pharmacyAPI = {
  // ─── Pharmacies ───────────────────────────────────────────────────────

  /** Get all pharmacies or filter by location */
  getAll: (filters?: { latitude?: number; longitude?: number; radiusMiles?: number }) =>
    api.get<Pharmacy[]>('/api/pharmacy', { params: filters }),

  /** Search pharmacies by name */
  search: (name: string) =>
    api.get<Pharmacy[]>('/api/pharmacy/search', { params: { name } }),

  /** Get pharmacy chains */
  getChains: () =>
    api.get<string[]>('/api/pharmacy/chains'),

  /** Get a single pharmacy */
  getById: (id: string) =>
    api.get<Pharmacy>(`/api/pharmacy/${id}`),

  // ─── Drug Prices ──────────────────────────────────────────────────────

  /** Search drug prices */
  searchDrugPrices: (drugName: string, zipCode?: string) =>
    api.get<DrugPrice[]>('/api/pharmacy/drug-prices/search', {
      params: { drugName, zipCode },
    }),

  /** Compare drug prices across pharmacies */
  comparePrices: (drugName: string, strength: string, form: string) =>
    api.get<DrugPrice[]>('/api/pharmacy/drug-prices/compare', {
      params: { drugName, strength, form },
    }),

  // ─── E-Prescriptions ─────────────────────────────────────────────────

  /** Get all prescriptions for current user */
  getPrescriptions: (status?: string) =>
    api.get<EPrescription[]>('/api/pharmacy/e-prescriptions', {
      params: { status },
    }),

  /** Get a single prescription */
  getPrescription: (id: string) =>
    api.get<EPrescription>(`/api/pharmacy/e-prescriptions/${id}`),

  /** Request a prescription refill */
  requestRefill: (prescriptionId: string, pharmacyId?: string) =>
    api.post(`/api/pharmacy/e-prescriptions/${prescriptionId}/refill`, { pharmacyId }),
};

export default pharmacyAPI;
