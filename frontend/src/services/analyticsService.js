import api from './api';

export const analyticsService = {
  getOverview: async () => {
    return await api.get('/analytics/overview');
  },

  getActivityLogs: async (params = {}) => {
    return await api.get('/analytics/activities', { params });
  }
};
