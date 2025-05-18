// src/api/axios.js
import axios from 'axios';

// Simple in-memory cache
const cache = new Map();

// Cache expiration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Create a basic axios instance with minimal configuration
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 8000,
    withCredentials: false // Turn off credentials to simplify requests
});

// Global flag to track if API is unreachable
let isApiUnreachable = false;

// Time when we last determined API was unreachable
let apiUnreachableTime = 0;

// How long to wait before trying API again (5 minutes)
const API_RETRY_DELAY = 5 * 60 * 1000;

// Simplified caching mechanism
const getCacheKey = (config) => {
    return `${config.url}${JSON.stringify(config.params || {})}`;
};

// Request interceptor with enhanced caching and request deduplication
api.interceptors.request.use(
    config => {
        // Add authentication token if available - from memory first for speed
        let token = sessionStorage.getItem('auth_token_mem');
        if (!token) {
            token = localStorage.getItem('token') ?? localStorage.getItem('admin_token');
            if (token) sessionStorage.setItem('auth_token_mem', token);
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Optimize GET requests with caching and request deduplication
        if (config.method.toLowerCase() === 'get') {
            const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;            
            
            // Simplified: No longer tracking pending requests
            // Just continue with the request
            const cachedResponse = cache.get(cacheKey);
            
            // Use the simplified constant cache duration
            if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_DURATION) {
                // Return cached response
                config.adapter = () => {
                    return Promise.resolve({
                        data: cachedResponse.data,
                        status: 200,
                        statusText: 'OK',
                        headers: cachedResponse.headers,
                        config: config,
                        request: {}
                    });
                };
            }
        }
        
        return config;
    },
    error => Promise.reject(error)
);

// Note: getCacheKey function is already defined above

// Response interceptor with improved error handling and graceful degradation
api.interceptors.response.use(
    response => {
        // API is working, reset unavailable flag
        if (isApiUnreachable) {
            console.log('API connection restored');
            isApiUnreachable = false;
        }
        
        // For GET requests, store in cache
        if (response.config.method?.toLowerCase() === 'get') {
            const cacheKey = getCacheKey(response.config);
            cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now(),
                headers: response.headers
            });
            
            // No longer using pending requests tracking
        }
        
        return response;
    },
    async error => {
        const config = error.config;
        
        // If we don't have a config object, we can't retry
        if (!config) {
            return Promise.reject({
                message: 'Network Error: Invalid request configuration',
                originalError: error
            });
        }
        
        // Get cache key for potential use
        const cacheKey = getCacheKey(config);
        
        // If we have a server response, handle specific HTTP error codes
        if (error.response) {
            // Server responded with an error status code (not a connection issue)
            
            // Handle 401 Unauthorized - redirect to login
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('auth_token_mem');
                window.location.href = '/login';
                return Promise.reject({
                    message: 'Your session has expired. Please log in again.',
                    originalError: error
                });
            }
            
            // Don't retry client errors (400-499)
            if (error.response.status >= 400 && error.response.status < 500) {
                return Promise.reject({
                    message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`,
                    originalError: error
                });
            }
            
            // Handle server errors (500-599)
            return Promise.reject({
                message: `Server error (${error.response.status}). The team has been notified.`,
                originalError: error
            });
        }
        
        // No response - this is a connection error
        
        // Check if API was already marked as unreachable
        const now = Date.now();
        if (isApiUnreachable) {
            // Only try again after the retry delay period
            if (now - apiUnreachableTime < API_RETRY_DELAY) {
                return Promise.reject({
                    message: 'API server is currently unavailable. Using cached data if available.',
                    originalError: error
                });
            }
            // Retry delay has passed, attempt connection again
            console.log('Retry delay passed, attempting to connect to API again');
            isApiUnreachable = false;
        }
        
        // Not marked unreachable yet, or retry timeout has passed
        // Try ONE retry with a short delay
        if (!config.__isRetry) {
            // Mark this as a retry attempt
            config.__isRetry = true;
            
            // Wait a moment before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            try {
                return await api(config);
            } catch (retryError) {
                // If retry also failed, mark API as unreachable
                isApiUnreachable = true;
                apiUnreachableTime = Date.now();
                console.log(`API marked as unreachable. Will try again in ${API_RETRY_DELAY/60000} minutes`);
                
                // Check for existing cached data
                const cachedData = cache.get(cacheKey);
                if (cachedData) {
                    console.log('Using cached data as fallback');
                    return Promise.resolve({
                        data: cachedData.data,
                        status: 200,
                        statusText: 'OK (from cache)',
                        headers: cachedData.headers,
                        config: config,
                        request: {},
                        __fromCache: true
                    });
                }
                
                // No cached data available
                return Promise.reject({
                    message: 'Unable to connect to server. Please check your internet connection.',
                    originalError: error
                });
            }
        }
        
        // This was already a retry that failed
        return Promise.reject({
            message: 'Network error. Please check your connection and try again later.',
            originalError: error
        });
    }
);

// Clear cache method (useful for logout or force-refresh scenarios)
export const clearApiCache = () => {
    cache.clear();
    pendingRequests.clear();
    sessionStorage.removeItem('auth_token_mem');
};

// Clear specific cache entries by URL pattern
export const clearSpecificApiCache = (urlPattern) => {
    // Create an array of keys to delete to avoid modification during iteration
    const keysToDelete = [];
    
    // Find all cache keys that match the pattern
    cache.forEach((_, key) => {
        if (key.includes(urlPattern)) {
            keysToDelete.push(key);
        }
    });
    
    // Delete the matching cache entries
    keysToDelete.forEach(key => cache.delete(key));
    
    console.log(`Cleared ${keysToDelete.length} cache entries matching: ${urlPattern}`);
};

// API request batching function - combines multiple requests into a single HTTP request
export const batchRequests = async (requests) => {
    if (!Array.isArray(requests) || requests.length === 0) {
        return [];
    }
    
    // For single requests, just use the normal API
    if (requests.length === 1) {
        const req = requests[0];
        const response = await api.request({
            url: req.url,
            method: req.method || 'get',
            data: req.data,
            params: req.params
        });
        return [response.data];
    }
    
    // For multiple requests, use the batch endpoint
    const batchResponse = await api.post('/batch', {
        requests: requests.map(req => ({
            url: req.url,
            method: req.method || 'get',
            body: req.data,
            params: req.params
        }))
    });
    
    return batchResponse.data.responses;
};

export default api;
