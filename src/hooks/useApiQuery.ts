// Generic API Query Hook with caching, loading, error states
// Replaces hardcoded data patterns across the app

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiRequestError } from '../services/api';

interface UseApiQueryOptions<T> {
  /** Whether to execute the query immediately on mount */
  enabled?: boolean;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
  /** Callback when data is successfully fetched */
  onSuccess?: (data: T) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Dependencies that trigger refetch when changed */
  deps?: unknown[];
  /** If true, suppress errors and return null data instead of showing error state */
  silentFail?: boolean;
}

interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

// Simple in-memory cache
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

export function useApiQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const {
    enabled = true,
    cacheDuration = 5 * 60 * 1000,
    onSuccess,
    onError,
    deps = [],
    silentFail = true,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    // Check cache on initial render
    const cached = queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data as T;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async (isRefetch = false) => {
    const fetchId = ++fetchIdRef.current;

    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await queryFn();

      // Only update state if this is still the latest fetch and component is mounted
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        setData(result);
        queryCache.set(key, { data: result, timestamp: Date.now() });
        onSuccess?.(result);
      }
    } catch (err) {
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Check if this is an auth error (session expired) — don't treat as data error
        const isAuthError = err instanceof ApiRequestError && err.status === 401;
        
        if (silentFail || isAuthError) {
          // Silently fail: set data to null, don't show error
          setData(null);
        } else {
          setError(error);
          onError?.(error);
        }
      }
    } finally {
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, [key, queryFn, cacheDuration, onSuccess, onError, silentFail]);

  const refetch = useCallback(async () => {
    queryCache.delete(key);
    await fetchData(true);
  }, [key, fetchData]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      // Check if cache is still valid
      const cached = queryCache.get(key);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data as T);
        setIsLoading(false);
      } else {
        fetchData();
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, key, ...deps]);

  return { data, isLoading, error, refetch, isRefetching };
}

// ─── Mutation Hook ────────────────────────────────────────────────────────────

interface UseApiMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useApiMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    /** Invalidate these cache keys on success */
    invalidateKeys?: string[];
  }
): UseApiMutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: V): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);

      // Invalidate specified cache keys
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => queryCache.delete(key));
      }

      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, isLoading, error, reset };
}

// ─── Cache Utilities ──────────────────────────────────────────────────────────

export const queryClient = {
  /** Invalidate a specific cache key */
  invalidate: (key: string) => queryCache.delete(key),

  /** Invalidate all keys matching a prefix */
  invalidatePrefix: (prefix: string) => {
    for (const key of queryCache.keys()) {
      if (key.startsWith(prefix)) {
        queryCache.delete(key);
      }
    }
  },

  /** Clear all cache */
  clear: () => queryCache.clear(),

  /** Pre-fill cache with data */
  setData: <T>(key: string, data: T) => {
    queryCache.set(key, { data, timestamp: Date.now() });
  },
};

export default useApiQuery;
