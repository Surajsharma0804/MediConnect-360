// API Service for MediConnect 360
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const user = localStorage.getItem('mediconnect_user');
  if (user) {
    const parsed = JSON.parse(user);
    return parsed.token || null;
  }
  return null;
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (email: string, password: string) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return fetchWithAuth('/auth/me');
  },

  forgotPassword: async (email: string) => {
    return fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return fetchWithAuth('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// AI API
export const aiAPI = {
  checkSymptoms: async (symptoms: string, language: string = 'en') => {
    return fetchWithAuth('/ai/symptom-check', {
      method: 'POST',
      body: JSON.stringify({ symptoms, language }),
    });
  },

  chat: async (messages: Array<{ role: string; content: string }>, language: string = 'en') => {
    return fetchWithAuth('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, language }),
    });
  },

  checkDrugInteractions: async (medications: string[]) => {
    return fetchWithAuth('/ai/drug-interactions', {
      method: 'POST',
      body: JSON.stringify({ medications }),
    });
  },
};

// Health API
export const healthAPI = {
  checkHealth: async () => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    return response.json();
  },
};

export default {
  auth: authAPI,
  ai: aiAPI,
  health: healthAPI,
};
