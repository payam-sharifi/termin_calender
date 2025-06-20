// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL:process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
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

export default api;
