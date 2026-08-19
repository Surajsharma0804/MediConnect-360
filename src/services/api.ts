// MediConnect-360 API Client
// Production-ready HTTP client with interceptors, auth, error handling, and retry logic

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, unknown>;
}

// ─── Token Management ─────────────────────────────────────────────────────────

const TOKEN_KEY = 'mediconnect_user';

const getAuthToken = (): string | null => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.token || parsed.accessToken || null;
  } catch {
    return null;
  }
};

const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

// ─── Request Builder ──────────────────────────────────────────────────────────

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
  skipAuth?: boolean;
  retries?: number;
}

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined | null>): string => {
  const base = path.startsWith('http') ? path : `${API_BASE_URL}/api${path}`;
  if (!params) return base;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Core Request Function ────────────────────────────────────────────────────

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  config: RequestConfig = {}
): Promise<T> {
  const { params, timeout = 30000, skipAuth = false, retries = 0, ...fetchConfig } = config;

  const url = buildUrl(path, params);

  const headers: HeadersInit = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...fetchConfig.headers,
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await delay(Math.min(1000 * Math.pow(2, attempt - 1), 10000));
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...fetchConfig,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        // Only clear auth on explicit auth endpoint failures (not data endpoints)
        const isAuthEndpoint = path.includes('/auth/me') || path.includes('/auth/refresh');
        if (isAuthEndpoint) {
          clearAuthData();
        }
        throw new ApiRequestError('Session expired. Please log in again.', 401);
      }

      if (response.status === 403) {
        throw new ApiRequestError('You do not have permission to perform this action.', 403);
      }

      if (response.status === 429) {
        throw new ApiRequestError('Too many requests. Please try again later.', 429);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new ApiRequestError(
          errorData.message || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiRequestError) {
        // Don't retry client errors (4xx)
        if (error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }
      }

      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === retries) {
        if (lastError.name === 'AbortError') {
          throw new ApiRequestError('Request timed out. Please try again.', 408);
        }
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

// ─── Error Class ──────────────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  public statusCode: number;
  public details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ─── Public API Methods ───────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>('GET', path, undefined, config),

  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>('POST', path, body, config),

  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>('PUT', path, body, config),

  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>('PATCH', path, body, config),

  delete: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>('DELETE', path, undefined, config),

  upload: <T>(path: string, formData: FormData, config?: RequestConfig) =>
    apiRequest<T>('POST', path, formData, config),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<{ user: unknown; token: string }>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<{ user: unknown; token: string }>('/auth/login', { email, password }),

  getProfile: () =>
    api.get<{ user: unknown }>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// ─── AI API ───────────────────────────────────────────────────────────────────

export const aiAPI = {
  checkSymptoms: (symptoms: string, language: string = 'en') =>
    api.post<{ response: string; bodyRegions?: string[] }>('/ai/symptom-check', { symptoms, language }),

  chat: (messages: Array<{ role: string; content: string }>, language: string = 'en') =>
    api.post<{ response: string }>('/ai/chat', { messages, language }),

  checkDrugInteractions: (medications: string[]) =>
    api.post<{ interactions: unknown[] }>('/ai/drug-interactions', { medications }),
};

// ─── Health Check API ─────────────────────────────────────────────────────────

export const healthAPI = {
  checkHealth: () =>
    api.get<{ status: string; uptime: number }>('/health', { skipAuth: true }),
};

export default api;
