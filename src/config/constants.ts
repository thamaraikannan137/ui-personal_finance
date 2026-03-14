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

  // Client Endpoints
  CLIENTS: '/clients',
  CLIENT_BY_ID: (id: string) => `/clients/${id}`,
  CLIENT_CERTIFICATES: (id: string) => `/clients/${id}/certificates`,
  CLIENT_IMPORT: '/clients/import',

  // Certificate Endpoints
  CERTIFICATES: '/certificates',
  CERTIFICATE_BY_ID: (id: string) => `/certificates/${id}`,
  CERTIFICATE_SUMMARY: (id: string) => `/certificates/${id}/summary`,
  CERTIFICATE_FINALIZE: (id: string) => `/certificates/${id}/finalize`,
  CERTIFICATE_REOPEN: (id: string) => `/certificates/${id}/reopen`,
  CERTIFICATE_EXPORT_EXCEL: (id: string) => `/certificates/${id}/export/excel`,

  // Annexure-1
  CERTIFICATE_ANNEXURE1: (id: string) => `/certificates/${id}/annexure1`,
  CERTIFICATE_ANNEXURE1_ROW: (id: string, section: string) => `/certificates/${id}/annexure1/${section}`,
  CERTIFICATE_ANNEXURE1_ROW_ID: (id: string, section: string, rowId: string) => `/certificates/${id}/annexure1/${section}/${rowId}`,

  // Annexure-2
  CERTIFICATE_ANNEXURE2: (id: string) => `/certificates/${id}/annexure2`,
  CERTIFICATE_ANNEXURE2_SECTION: (id: string, section: string) => `/certificates/${id}/annexure2/${section}`,

  // Certificate Liabilities
  CERTIFICATE_LIABILITIES: (id: string) => `/certificates/${id}/liabilities`,
  CERTIFICATE_LIABILITY_ITEM: (id: string) => `/certificates/${id}/liabilities/item`,
  CERTIFICATE_LIABILITY_ITEM_ID: (id: string, itemId: string) => `/certificates/${id}/liabilities/item/${itemId}`,

  // Guarantors
  CERTIFICATE_GUARANTORS: (id: string) => `/certificates/${id}/guarantors`,
  CERTIFICATE_GUARANTOR_ITEM: (id: string) => `/certificates/${id}/guarantors/item`,
  CERTIFICATE_GUARANTOR_ITEM_ID: (id: string, itemId: string) => `/certificates/${id}/guarantors/item/${itemId}`,
} as const;

