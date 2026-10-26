import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('intellitrip_user') || 'null');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for API response handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response && error.response.data;
    const message =
      data && data.message
        ? data.message
        : error.message || 'An unexpected network error occurred';
    const err = new Error(message);
    if (data) {
      err.response = error.response;
      err.data = data;
      err.userExists = data.userExists;
    }
    return Promise.reject(err);
  }
);

export default api;
