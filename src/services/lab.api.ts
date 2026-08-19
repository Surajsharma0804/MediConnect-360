// Lab Diagnostics API Service
// Maps to: backend/src/lab-diagnostics/controllers/

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'scheduled' | 'sample_collected' | 'processing' |
  'completed' | 'cancelled';

export interface LabTestOrder {
  id: string;
  userId: string;
  providerId?: string;
  testName: string;
  testCode?: string;
  category: string;
  status: OrderStatus;
  scheduledAt?: string;
  collectedAt?: string;
  completedAt?: string;
  labName?: string;
  labAddress?: string;
  instructions?: string;
  fastingRequired: boolean;
  results?: LabTestResult[];
  provider?: { firstName: string; lastName: string; title?: string };
  createdAt: string;
  updatedAt: string;
}

export interface LabTestResult {
  id: string;
  orderId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal_low' | 'abnormal_high' | 'critical';
  notes?: string;
  details?: Array<{
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: string;
  }>;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const labAPI = {
  /** Get all lab orders for current user */
  getOrders: (status?: OrderStatus) =>
    api.get<LabTestOrder[]>('/lab-diagnostics/orders', {
      params: { status },
    }),

  /** Get a single lab order */
  getOrder: (id: string) =>
    api.get<LabTestOrder>(`/lab-diagnostics/orders/${id}`),

  /** Create a new lab order */
  createOrder: (data: { testName: string; testCode?: string; category: string; scheduledAt?: string; instructions?: string }) =>
    api.post<LabTestOrder>('/lab-diagnostics/orders', data),

  /** Cancel a lab order */
  cancelOrder: (id: string) =>
    api.post(`/lab-diagnostics/orders/${id}/cancel`),

  /** Get results for an order */
  getResults: (orderId: string) =>
    api.get<LabTestResult[]>(`/lab-diagnostics/orders/${orderId}/results`),

  /** Get all results for current user (across all orders) */
  getAllResults: (params?: { startDate?: string; endDate?: string; category?: string }) =>
    api.get<LabTestResult[]>('/lab-diagnostics/results', { params }),

  /** Get a single result */
  getResult: (id: string) =>
    api.get<LabTestResult>(`/lab-diagnostics/results/${id}`),

  /** Download result report as PDF */
  downloadReport: (orderId: string) =>
    api.get<{ url: string }>(`/lab-diagnostics/orders/${orderId}/report`),
};

export default labAPI;
