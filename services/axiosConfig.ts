// lib/api.ts
import axios from 'axios';

// #region agent log

// #endregion

// Get base URL dynamically based on current hostname
// Lazy-loaded to avoid SSR issues
function getBaseURL(): string {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // In browser, detect the hostname and use it for backend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If accessing via network IP (not localhost), use same IP for backend
    // Build backend URL based on current hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:4001/`;
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:4001/';
}

// Lazy-load baseURL to avoid SSR issues
// Only call getBaseURL() when actually needed (on client side)
let baseURL: string | null = null;
function getBaseURLLazy(): string {
  if (baseURL === null) {
    baseURL = getBaseURL();
  }
  return baseURL;
}

// #region agent log

// #endregion

const api = axios.create({
  baseURL: getBaseURLLazy(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Update baseURL dynamically on client side if needed
if (typeof window !== 'undefined') {
  // Update baseURL after mount to ensure window is available
  api.defaults.baseURL = getBaseURLLazy();
}

// #region agent log

// #endregion

api.interceptors.request.use((config) => {
  // #region agent log
 
  // #endregion
  
  let token = '';
 
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('termin-token') || '';
  }
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // #region agent log
   
    // #endregion
    return response;
  },
  (error) => {
    // #region agent log
    
    // #endregion
    return Promise.reject(error);
  }
);

export default api;
