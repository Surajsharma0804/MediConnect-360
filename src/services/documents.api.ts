// Documents API Service
// Maps to: backend/src/documents/controllers/document.controller.ts

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentType = 'lab_result' | 'prescription' | 'imaging' | 'discharge_summary' |
  'insurance_card' | 'id_document' | 'consent_form' | 'referral' | 'other';

export type DocumentStatus = 'active' | 'archived' | 'expired' | 'pending_review';

export interface MedicalDocument {
  id: string;
  userId: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  tags?: string[];
  extractedText?: string;
  aiAnalysis?: Record<string, unknown>;
  versions?: DocumentVersion[];
  shareLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface DocumentFilters {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const documentsAPI = {
  /** Get all documents with optional filters */
  getAll: (filters?: DocumentFilters) =>
    api.get<{ data: MedicalDocument[]; total: number }>('/documents', {
      params: filters,
    }),

  /** Get a single document by ID */
  getById: (id: string) =>
    api.get<MedicalDocument>(`/documents/${id}`),

  /** Upload a new document */
  upload: (file: File, metadata: { title: string; type: string; description?: string; tags?: string[] }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('type', metadata.type);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
    return api.upload<MedicalDocument>('/documents/upload', formData);
  },

  /** Update document metadata */
  update: (id: string, data: { title?: string; type?: string; description?: string; tags?: string[]; status?: DocumentStatus }) =>
    api.patch<MedicalDocument>(`/documents/${id}`, data),

  /** Delete a document */
  delete: (id: string) =>
    api.delete(`/documents/${id}`),

  /** Get download URL for a document */
  getDownloadUrl: (id: string) =>
    api.get<{ url: string }>(`/documents/${id}/download`),

  /** Generate a shareable link */
  generateShareLink: (id: string) =>
    api.get<{ shareLink: string }>(`/documents/${id}/share`),

  /** Revoke a shareable link */
  revokeShareLink: (id: string) =>
    api.post(`/documents/${id}/share/revoke`),

  /** Get version history */
  getVersions: (id: string) =>
    api.get<DocumentVersion[]>(`/documents/${id}/versions`),

  /** Upload a new version */
  uploadVersion: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<DocumentVersion>(`/documents/${id}/versions`, formData);
  },

  /** Extract text from document (OCR) */
  extractText: (id: string) =>
    api.post<{ text: string }>(`/documents/${id}/ocr`),

  /** Analyze document with AI */
  analyzeWithAI: (id: string) =>
    api.post<{ analysis: Record<string, unknown> }>(`/documents/${id}/analyze`),
};

export default documentsAPI;
