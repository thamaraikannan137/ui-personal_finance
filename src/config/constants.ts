// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

// App Configuration
export const APP_NAME = 'Your App Name';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  
  // User Endpoints
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Asset Endpoints
  ASSETS: '/assets',
  ASSET_BY_ID: (id: string) => `/assets/${id}`,
  ASSET_SUMMARY: '/assets/summary',
  
  // Liability Endpoints
  LIABILITIES: '/liabilities',
  LIABILITY_BY_ID: (id: string) => `/liabilities/${id}`,
  LIABILITY_SUMMARY: '/liabilities/summary',
  
  // Custom Category Endpoints
  CUSTOM_CATEGORIES: '/custom-categories',
  CUSTOM_CATEGORY_BY_ID: (id: string) => `/custom-categories/${id}`,
} as const;

