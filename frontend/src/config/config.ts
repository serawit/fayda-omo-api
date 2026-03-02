export const API_CONFIG = {
  // If accessing via the domain, point to the backend on the same domain (or specific API subdomain)
  // Adjust the port if your backend runs on a different port (e.g., 5000) and isn't proxied via Nginx/Apache on port 80.
  BASE_URL: import.meta.env.PROD 
    ? 'https://fayda.omobanksc.com/api' // Production API URL
    : 'http://localhost:5000/api',     // Development API URL
  TIMEOUT: 10000,
};