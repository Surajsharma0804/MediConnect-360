// Insurance API Service
// Maps to: backend/src/insurance/controllers/

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InsuranceCard {
  id: string;
  userId: string;
  insurerName: string;
  planName: string;
  policyNumber: string;
  groupNumber?: string;
  memberId: string;
  subscriberName: string;
  relationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: string;
  expirationDate?: string;
  copay?: number;
  deductible?: number;
  deductibleMet?: number;
  outOfPocketMax?: number;
  outOfPocketMet?: number;
  frontImageUrl?: string;
  backImageUrl?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceClaim {
  id: string;
  userId: string;
  insuranceCardId: string;
  claimNumber?: string;
  providerId?: string;
  serviceDate: string;
  serviceDescription: string;
  totalAmount: number;
  coveredAmount?: number;
  patientResponsibility?: number;
  status: 'submitted' | 'in_review' | 'approved' | 'denied' | 'partially_approved' | 'paid';
  denialReason?: string;
  eobUrl?: string;
  provider?: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const insuranceAPI = {
  // ─── Insurance Cards ──────────────────────────────────────────────────

  /** Get all insurance cards */
  getCards: () =>
    api.get<InsuranceCard[]>('/insurance/cards'),

  /** Get a single insurance card */
  getCard: (id: string) =>
    api.get<InsuranceCard>(`/insurance/cards/${id}`),

  /** Add a new insurance card */
  addCard: (data: Partial<InsuranceCard>) =>
    api.post<InsuranceCard>('/insurance/cards', data),

  /** Update an insurance card */
  updateCard: (id: string, data: Partial<InsuranceCard>) =>
    api.put<InsuranceCard>(`/insurance/cards/${id}`, data),

  /** Delete an insurance card */
  deleteCard: (id: string) =>
    api.delete(`/insurance/cards/${id}`),

  /** Upload insurance card image (front/back) */
  uploadCardImage: (id: string, side: 'front' | 'back', file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('side', side);
    return api.upload<{ imageUrl: string }>(`/insurance/cards/${id}/image`, formData);
  },

  // ─── Claims ───────────────────────────────────────────────────────────

  /** Get all insurance claims */
  getClaims: (status?: string) =>
    api.get<InsuranceClaim[]>('/insurance/claims', {
      params: { status },
    }),

  /** Get a single claim */
  getClaim: (id: string) =>
    api.get<InsuranceClaim>(`/insurance/claims/${id}`),

  /** Submit a new claim */
  submitClaim: (data: Partial<InsuranceClaim>) =>
    api.post<InsuranceClaim>('/insurance/claims', data),

  /** Check coverage for a procedure */
  checkCoverage: (insuranceCardId: string, procedureCode: string) =>
    api.get<{ covered: boolean; estimatedCoverage: number; copay: number; notes?: string }>('/insurance/coverage', {
      params: { insuranceCardId, procedureCode },
    }),
};

export default insuranceAPI;
