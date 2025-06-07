// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/', // یا URL سرور بک‌اند شما
  headers: {
    'Content-Type': 'application/json',
  },
});






export default api;
