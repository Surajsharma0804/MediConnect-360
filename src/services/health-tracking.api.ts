// Health Tracking API Service
// Maps to: backend/src/health-tracking/controllers/health-tracking.controller.ts

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackingType =
  | 'fitness' | 'sleep' | 'mood' | 'pain' | 'symptom'
  | 'medication_adherence' | 'weight' | 'nutrition' | 'water'
  | 'menstrual' | 'blood_pressure' | 'blood_glucose' | 'heart_rate';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface HealthTracking {
  id: string;
  userId: string;
  trackingType: TrackingType;
  trackedAt: string;

  // Fitness
  steps?: number;
  distance?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  exerciseMinutes?: number;
  exerciseType?: string;

  // Sleep
  sleepStart?: string;
  sleepEnd?: string;
  sleepDurationMinutes?: number;
  deepSleepMinutes?: number;
  lightSleepMinutes?: number;
  remSleepMinutes?: number;
  awakeMinutes?: number;
  sleepQuality?: SleepQuality;

  // Mood
  moodLevel?: MoodLevel;
  moodFactors?: string[];
  moodNotes?: string;

  // Pain
  painLevel?: PainLevel;
  painLocation?: string;
  painType?: string;
  painTriggers?: string[];
  painNotes?: string;

  // Symptom
  symptomName?: string;
  symptomSeverity?: number;
  symptomDetails?: Record<string, unknown>;

  // Medication Adherence
  medicationName?: string;
  medicationTaken?: boolean;
  medicationScheduledTime?: string;
  medicationActualTime?: string;
  medicationSkipReason?: string;

  // Weight
  weight?: number;
  weightUnit?: string;
  bodyFatPercentage?: number;
  muscleMass?: number;
  bmi?: number;

  // Nutrition
  caloriesConsumed?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
  meals?: Array<{ name: string; time: string; calories: number; description: string }>;

  // Water
  waterIntakeMl?: number;
  waterGoalMl?: number;

  // Blood Pressure
  systolicBP?: number;
  diastolicBP?: number;
  pulseBPM?: number;

  // Blood Glucose
  bloodGlucose?: number;
  glucoseMeasurementType?: string;

  // Heart Rate
  heartRate?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;

  // General
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  wearableData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackingPayload {
  trackingType: TrackingType;
  trackedAt?: string;
  [key: string]: unknown;
}

export interface UpdateTrackingPayload {
  [key: string]: unknown;
}

export interface TrackingStats {
  type: TrackingType;
  count: number;
  average?: number;
  min?: number;
  max?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  data?: Array<{ date: string; value: number }>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const healthTrackingAPI = {
  /** Create a new tracking entry */
  create: (data: CreateTrackingPayload) =>
    api.post<HealthTracking>('/health-tracking', data),

  /** Get all tracking entries with optional filters */
  getAll: (params?: {
    type?: TrackingType;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) =>
    api.get<HealthTracking[]>('/health-tracking', {
      params: {
        type: params?.type,
        startDate: params?.startDate,
        endDate: params?.endDate,
        limit: params?.limit,
      },
    }),

  /** Get stats for a specific tracking type within a date range */
  getStats: (type: TrackingType, startDate: string, endDate: string) =>
    api.get<TrackingStats>('/health-tracking/stats', {
      params: { type, startDate, endDate },
    }),

  /** Get a single tracking entry by ID */
  getById: (id: string) =>
    api.get<HealthTracking>(`/health-tracking/${id}`),

  /** Update a tracking entry */
  update: (id: string, data: UpdateTrackingPayload) =>
    api.put<HealthTracking>(`/health-tracking/${id}`, data),

  /** Delete a tracking entry */
  delete: (id: string) =>
    api.delete(`/health-tracking/${id}`),
};

export default healthTrackingAPI;
