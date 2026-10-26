import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('intellitrip_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('intellitrip_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network logout errors and clear local storage regardless
    } finally {
      localStorage.removeItem('intellitrip_user');
    }
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('intellitrip_user') || 'null');
  },

  getProfile: async () => {
    return await api.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data && response.data.token) {
      const stored = JSON.parse(localStorage.getItem('intellitrip_user') || '{}');
      const updated = { ...stored, ...response.data };
      localStorage.setItem('intellitrip_user', JSON.stringify(updated));
    }
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    return await api.get('/auth/users', { params });
  },

  adminUpdateUser: async (id, userData) => {
    return await api.put(`/auth/users/${id}`, userData);
  },

  adminDeleteUser: async (id) => {
    return await api.delete(`/auth/users/${id}`);
  }
};
