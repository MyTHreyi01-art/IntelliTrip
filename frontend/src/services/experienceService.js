import api from './api';

export const experienceService = {
  getExperiences: async (params = {}) => {
    return await api.get('/experiences', { params });
  },

  getExperienceById: async (id) => {
    return await api.get(`/experiences/${id}`);
  },

  createExperience: async (data) => {
    return await api.post('/experiences', data);
  },

  updateExperience: async (id, data) => {
    return await api.put(`/experiences/${id}`, data);
  },

  deleteExperience: async (id) => {
    return await api.delete(`/experiences/${id}`);
  }
};
