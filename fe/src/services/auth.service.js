/**
 * Auth Service
 * API calls for authentication
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  register: (data) =>
    apiClient.post('/api/auth/register', data),
  
  getCurrentUser: () =>
    apiClient.get('/api/auth/me'),
};

export default authService;
