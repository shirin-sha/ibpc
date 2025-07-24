import { useState, useEffect, useCallback, useRef } from 'react';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useApi = (url, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    dependencies = [],
    cache: shouldCache = true,
    cacheDuration = CACHE_DURATION,
    retries = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);

  const getCacheKey = useCallback(() => {
    return `${method}:${url}:${JSON.stringify(body)}`;
  }, [method, url, body]);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!url) return;

    const cacheKey = getCacheKey();
    
    // Check cache first
    if (shouldCache && method === 'GET' && !isRetry) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data);
        setError(null);
        return cached.data;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: abortControllerRef.current.signal,
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache the result
      if (shouldCache && method === 'GET') {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      setData(result);
      retryCountRef.current = 0;
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      // Retry logic
      if (retryCountRef.current < retries) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(err.message);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers, shouldCache, cacheDuration, retries, retryDelay, onSuccess, onError, getCacheKey]);

  const refetch = useCallback(() => {
    const cacheKey = getCacheKey();
    cache.delete(cacheKey); // Clear cache for this request
    return fetchData();
  }, [fetchData, getCacheKey]);

  const mutate = useCallback(async (newData) => {
    if (typeof newData === 'function') {
      setData(prevData => newData(prevData));
    } else {
      setData(newData);
    }
    
    // Update cache
    if (shouldCache) {
      const cacheKey = getCacheKey();
      cache.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
      });
    }
  }, [shouldCache, getCacheKey]);

  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
};

// Hook for POST/PUT/DELETE operations
export const useMutation = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const mutate = useCallback(async (data, mutationOptions = {}) => {
    const {
      method = 'POST',
      headers = {},
      onSuccess = null,
      onError = null,
    } = { ...options, ...mutationOptions };

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: abortControllerRef.current.signal,
      };

      if (data) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      setError(err.message);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    mutate,
    loading,
    error,
  };
};

// Clear cache utility
export const clearCache = (pattern = null) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

export default useApi;