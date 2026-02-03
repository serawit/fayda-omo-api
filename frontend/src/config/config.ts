/**
 * Centralized configuration for all API endpoints.
 * Uses Vite environment variables with local fallbacks.
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  FAYDA_BASE_URL: import.meta.env.VITE_FAYDA_BASE_URL || 'https://auth.fayda.et',
};