// src/api/axios-simple.js - A simplified, reliable API connection
import axios from 'axios';
import { mockCourses, mockCategories, mockUser, mockProgress } from '../mock/mockData';

// Simple in-memory cache
const cache = new Map();

// Create a simple axios instance with basic configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 8000,
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use(config => {
  // Get token from storage
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  
  // If token exists, add to headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, error => Promise.reject(error));

// Simple flag to track if we're using mock data
let usingMockData = false;

// Simple response interceptor
api.interceptors.response.use(
  // Success handler
  response => {
    usingMockData = false;
    return response;
  },
  // Error handler
  error => {
    // Just return the error and let the component handle fallback if needed
    return Promise.reject(error);
  }
);

// Helper function to check if we're using mock data
export const isUsingMockData = () => usingMockData;

// Helper function to clear specific cache entries
export const clearSpecificApiCache = (urlPattern) => {
  if (!urlPattern) return false;
  
  let clearedAny = false;
  
  // Iterate through cache keys and remove any that match the pattern
  cache.forEach((value, key) => {
    if (key.includes(urlPattern)) {
      cache.delete(key);
      clearedAny = true;
    }
  });
  
  return clearedAny;
};

// Helper function to clear all cache
export const clearApiCache = () => {
  cache.clear();
  return true;
};

// Debug function to get fake data
export const getMockData = (endpoint) => {
  if (endpoint.includes('courses')) {
    return mockCourses;
  } else if (endpoint.includes('categories')) {
    return mockCategories;
  } else if (endpoint.includes('me')) {
    return mockUser;
  } else if (endpoint.includes('progress-summary')) {
    return mockProgress;
  } else if (endpoint.includes('saved-courses')) {
    // Create some sample saved courses based on the mock courses
    return mockCourses.slice(0, 3).map(course => ({
      ...course,
      pivot: {
        user_id: 1,
        course_id: course.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }));
  }
  
  // Default fallback is an empty array
  return [];
};

export default api;
