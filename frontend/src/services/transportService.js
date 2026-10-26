import api from './api';

export const transportService = {
  getTransports: async (params = {}) => {
    return await api.get('/transport', { params });
  },

  getTransportById: async (id) => {
    return await api.get(`/transport/${id}`);
  },

  createTransport: async (data) => {
    return await api.post('/transport', data);
  },

  updateTransport: async (id, data) => {
    return await api.put(`/transport/${id}`, data);
  },

  deleteTransport: async (id) => {
    return await api.delete(`/transport/${id}`);
  }
};
