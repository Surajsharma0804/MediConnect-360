// Family API Service
// Maps to: backend/src/family/controllers/

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FamilyRelationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'grandparent' |
  'grandchild' | 'guardian' | 'dependent' | 'other';

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: FamilyRelationship;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  insuranceCardId?: string;
  emergencyContact?: boolean;
  phone?: string;
  email?: string;
  profileImage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const familyAPI = {
  /** Get all family members */
  getAll: () =>
    api.get<FamilyMember[]>('/family/members'),

  /** Get a single family member */
  getById: (id: string) =>
    api.get<FamilyMember>(`/family/members/${id}`),

  /** Add a new family member */
  create: (data: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    api.post<FamilyMember>('/family/members', data),

  /** Update a family member */
  update: (id: string, data: Partial<FamilyMember>) =>
    api.put<FamilyMember>(`/family/members/${id}`, data),

  /** Delete a family member */
  delete: (id: string) =>
    api.delete(`/family/members/${id}`),

  /** Get health summary for a family member */
  getHealthSummary: (memberId: string) =>
    api.get<{
      recentAppointments: unknown[];
      activeMedications: unknown[];
      latestVitals: unknown;
      upcomingReminders: unknown[];
    }>(`/family/members/${memberId}/health-summary`),
};

export default familyAPI;
