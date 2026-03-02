import axios from 'axios';

const api = axios.create({
  // Use the environment variable for your backend URL
  baseURL: import.meta.env.VITE_API_URL || '/api', // Defaults to /api for proxying
  // This is crucial for sending session cookies back and forth
  withCredentials: true,
});

export default api;