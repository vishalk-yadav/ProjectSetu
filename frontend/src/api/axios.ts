import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('projectsetu_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized, except on login endpoint
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('projectsetu_token');
        localStorage.removeItem('projectsetu_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
