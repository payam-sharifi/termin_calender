// lib/api.ts
import axios from 'axios';

// #region agent log
if (typeof window !== 'undefined') {
  fetch('http://127.0.0.1:7249/ingest/976fdc6c-134b-4386-99d6-468adb37c740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosConfig.ts:6',message:'Axios config initialization',data:{envApiUrl:process.env.NEXT_PUBLIC_API_BASE_URL,defaultUrl:'http://localhost:3001/',windowLocation:window.location.href,hostname:window.location.hostname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
}
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
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Backend runs on port 4001 (check main.ts)
      return `${protocol}//${hostname}:4001/`;
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:4001/';
}

const baseURL = getBaseURL();

// #region agent log
if (typeof window !== 'undefined') {
  fetch('http://127.0.0.1:7249/ingest/976fdc6c-134b-4386-99d6-468adb37c740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosConfig.ts:25',message:'Base URL determined',data:{baseURL,hostname:window.location.hostname,protocol:window.location.protocol},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
}
// #endregion

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// #region agent log
if (typeof window !== 'undefined') {
  fetch('http://127.0.0.1:7249/ingest/976fdc6c-134b-4386-99d6-468adb37c740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosConfig.ts:15',message:'Axios instance created',data:{baseURL:api.defaults.baseURL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
}
// #endregion

api.interceptors.request.use((config) => {
  // #region agent log
  if (typeof window !== 'undefined') {
    const baseURL = config.baseURL || '';
    const fullUrl = baseURL + (config.url || '');
    fetch('http://127.0.0.1:7249/ingest/976fdc6c-134b-4386-99d6-468adb37c740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosConfig.ts:20',message:'Request interceptor',data:{url:config.url,baseURL:baseURL,fullUrl:fullUrl,method:config.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
  }
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
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7249/ingest/976fdc6c-134b-4386-99d6-468adb37c740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosConfig.ts:37',message:'Response success',data:{url:response.config.url,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
    }
    // #endregion
    return response;
  },
  (error) => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7249/ingest/976fdc6c-134b-4386-99d6-468adb37c740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosConfig.ts:44',message:'Response error',data:{url:error.config?.url,baseURL:error.config?.baseURL,status:error.response?.status,message:error.message,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
    }
    // #endregion
    return Promise.reject(error);
  }
);

export default api;
