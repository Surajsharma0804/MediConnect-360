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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mediconnect-backend-orkv.onrender.com';
  
  // Debug logging
  console.log('Auth Hook - API_BASE_URL:', API_BASE_URL);
  console.log('Auth Hook - VITE_API_URL:', import.meta.env.VITE_API_URL);

  // Fetch current user on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Don't try refresh on initial load to speed up
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null); // Set to null to stop loading
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
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
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
    }
  };

  // OAuth login methods
  const loginWithGoogle = () => {
    console.log('Redirecting to Google OAuth:', `${API_BASE_URL}/api/v1/auth/google`);
    setIsLoading(true); // Show loading state
    window.location.href = `${API_BASE_URL}/api/v1/auth/google`;
  };

  const loginWithGitHub = () => {
    console.log('Redirecting to GitHub OAuth:', `${API_BASE_URL}/api/v1/auth/github`);
    setIsLoading(true); // Show loading state
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