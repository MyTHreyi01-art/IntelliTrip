import api from './api';

export const emergencyService = {
  triggerSOS: async (sosData) => {
    return await api.post('/emergency/sos', sosData);
  },

  getHelplineContacts: async () => {
    return await api.get('/emergency/contacts');
  },

  getEmergencyAlerts: async () => {
    return await api.get('/emergency/alerts');
  },

  updateAlertStatus: async (id, statusData) => {
    return await api.put(`/emergency/alerts/${id}`, statusData);
  }
};
