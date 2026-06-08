import axios from 'axios';
import API_BASE_URL from './apiConfig';

// Pre-configured axios instance with auth token interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
