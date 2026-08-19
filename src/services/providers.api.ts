// Providers API Service (Hospitals, Doctors, Reviews)
// Maps to: backend/src/providers/controllers/provider.controller.ts + provider-review.controller.ts

import api, { type PaginatedResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProviderStatus = 'active' | 'inactive' | 'on_leave' | 'suspended';
export type ProviderType = 'doctor' | 'nurse_practitioner' | 'physician_assistant' | 'therapist' |
  'psychiatrist' | 'psychologist' | 'nutritionist' | 'physical_therapist' | 'specialist';

export interface Provider {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  type: ProviderType;
  specializations: string[];
  licenseNumber?: string;
  npiNumber?: string;
  certifications?: string[];
  languages?: string[];
  bio?: string;
  education?: string;
  yearsOfExperience: number;
  profileImage?: string;
  phone?: string;
  officeAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  totalReviews: number;
  totalConsultations: number;
  availability?: Record<string, unknown>;
  consultationDuration: number;
  consultationFee?: number;
  acceptsNewPatients: boolean;
  offersVideoConsultation: boolean;
  offersInPersonConsultation: boolean;
  offersHomeVisit: boolean;
  insuranceAccepted?: string[];
  conditionsTreated?: string[];
  proceduresPerformed?: string[];
  status: ProviderStatus;
  isVerified: boolean;
  verifiedAt?: string;
  awards?: Array<{ name: string; year: number; organization: string }>;
  publications?: Array<{ title: string; journal: string; year: number; url?: string }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

export interface ProviderSearchFilters {
  specialization?: string;
  insurance?: string;
  minRating?: number;
  acceptingNew?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  languages?: string;
  city?: string;
  type?: ProviderType;
  limit?: number;
  offset?: number;
}

export interface ProviderReview {
  id: string;
  providerId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  comment?: string;
}

// ─── Provider API ─────────────────────────────────────────────────────────────

export const providersAPI = {
  /** Get all providers (paginated) */
  getAll: (limit?: number, offset?: number) =>
    api.get<Provider[]>('/providers', {
      params: { limit, offset },
    }),

  /** Search providers with filters */
  search: (filters: ProviderSearchFilters) =>
    api.get<Provider[]>('/providers/search', {
      params: {
        specialization: filters.specialization,
        insurance: filters.insurance,
        minRating: filters.minRating,
        acceptingNew: filters.acceptingNew,
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius: filters.radius,
        languages: filters.languages,
        limit: filters.limit,
        offset: filters.offset,
      },
    }),

  /** Find providers near a location */
  findNearby: (latitude: number, longitude: number, radius?: number, limit?: number) =>
    api.get<Provider[]>('/providers/nearby', {
      params: { latitude, longitude, radius, limit },
    }),

  /** Get list of all specializations */
  getSpecializations: () =>
    api.get<string[]>('/providers/specializations'),

  /** Get a single provider by ID */
  getById: (id: string) =>
    api.get<Provider>(`/providers/${id}`),

  /** Create a new provider (admin) */
  create: (data: Partial<Provider>) =>
    api.post<Provider>('/providers', data),

  /** Update a provider (admin) */
  update: (id: string, data: Partial<Provider>) =>
    api.put<Provider>(`/providers/${id}`, data),

  /** Delete a provider (admin) */
  delete: (id: string) =>
    api.delete(`/providers/${id}`),

  // ─── Reviews ──────────────────────────────────────────────────────────

  /** Get reviews for a provider */
  getReviews: (providerId: string, limit?: number, offset?: number) =>
    api.get<ProviderReview[]>(`/providers/${providerId}/reviews`, {
      params: { limit, offset },
    }),

  /** Get a single review */
  getReview: (providerId: string, reviewId: string) =>
    api.get<ProviderReview>(`/providers/${providerId}/reviews/${reviewId}`),

  /** Create a review for a provider */
  createReview: (providerId: string, data: CreateReviewPayload) =>
    api.post<ProviderReview>(`/providers/${providerId}/reviews`, data),

  /** Update a review */
  updateReview: (providerId: string, reviewId: string, data: UpdateReviewPayload) =>
    api.put<ProviderReview>(`/providers/${providerId}/reviews/${reviewId}`, data),

  /** Delete a review */
  deleteReview: (providerId: string, reviewId: string) =>
    api.delete(`/providers/${providerId}/reviews/${reviewId}`),

  /** Mark a review as helpful */
  markReviewHelpful: (providerId: string, reviewId: string) =>
    api.post(`/providers/${providerId}/reviews/${reviewId}/helpful`),
};

export default providersAPI;
