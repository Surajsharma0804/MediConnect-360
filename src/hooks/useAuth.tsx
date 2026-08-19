import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'nurse';
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'patient' | 'doctor') => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  // OAuth methods
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
  loginWithGoogle: () => {},
  loginWithGitHub: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch current user on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Get stored auth token from localStorage
  const getStoredToken = (): string | null => {
    try {
      // Check direct token first
      const directToken = localStorage.getItem('access_token');
      if (directToken) return directToken;
      
      // Check mediconnect_user object
      const stored = localStorage.getItem('mediconnect_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.accessToken || parsed.token || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const checkAuthStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        // Don't clear tokens here — the callback page may be storing fresh ones
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const storeTokens = (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('mediconnect_user', JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
    }));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      if (data.tokens) storeTokens(data.tokens);
      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'patient' | 'doctor' = 'patient') => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      if (data.tokens) storeTokens(data.tokens);
      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } catch {
      // Logout API failure is non-critical
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('mediconnect_user');
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // OAuth login methods
  const loginWithGoogle = () => {
    setIsLoading(true);
    window.location.href = `${API_BASE_URL}/api/v1/auth/google`;
  };

  const loginWithGitHub = () => {
    setIsLoading(true);
    window.location.href = `${API_BASE_URL}/api/v1/auth/github`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshAuth,
        loginWithGoogle,
        loginWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;