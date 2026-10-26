import api from './api';

export const destinationService = {
  getDestinations: async (params = {}) => {
    return await api.get('/destinations', { params });
  },

  getDestinationById: async (id) => {
    return await api.get(`/destinations/${id}`);
  },

  createDestination: async (data) => {
    return await api.post('/destinations', data);
  },

  updateDestination: async (id, data) => {
    return await api.put(`/destinations/${id}`, data);
  },

  deleteDestination: async (id) => {
    return await api.delete(`/destinations/${id}`);
  }
};
