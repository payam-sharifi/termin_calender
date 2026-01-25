// lib/api.ts
import axios from 'axios';

// #region agent log

// #endregion

// Get base URL dynamically based on current hostname
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
   
  }
  
  // Default to localhost for development
  return 'http://localhost:4001/';
}

const baseURL = getBaseURL();

// #region agent log

// #endregion

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

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
