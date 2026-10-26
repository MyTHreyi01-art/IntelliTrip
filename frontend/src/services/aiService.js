import api from './api';

export const aiService = {
  askAssistant: async (prompt, history = []) => {
    return await api.post('/ai/assistant', { prompt, history });
  },

  generateItinerary: async (data) => {
    return await api.post('/ai/generate-itinerary', data);
  },

  saveItinerary: async (data) => {
    return await api.post('/ai/save-itinerary', data);
  },

  getUserItineraries: async () => {
    return await api.get('/ai/itineraries');
  },

  getAllItineraries: async () => {
    return await api.get('/ai/itineraries/all');
  },

  getItineraryById: async (id) => {
    return await api.get(`/ai/itineraries/${id}`);
  },

  deleteItinerary: async (id) => {
    return await api.delete(`/ai/itineraries/${id}`);
  },

  getBudgetPlanner: async (data) => {
    return await api.post('/ai/budget-planner', data);
  },

  getTravelDNA: async () => {
    return await api.get('/ai/travel-dna');
  },

  updateTravelDNA: async (scores, primaryStyle) => {
    return await api.put('/ai/travel-dna', { scores, primaryStyle });
  },

  getRecommendations: async () => {
    return await api.get('/ai/recommendations');
  },

  // Phase 4 Python ML Endpoints
  analyzeSentiment: async (text) => {
    return await api.post('/ai/sentiment', { text });
  },

  predictCrowd: async (destinationName, month, dayOfWeek) => {
    return await api.post('/ai/predict-crowd', { destinationName, month, dayOfWeek });
  },

  forecastDemand: async (destinationName, targetMonth) => {
    return await api.post('/ai/forecast-demand', { destinationName, targetMonth });
  },

  getGroupConsensus: async (travelersPreferences) => {
    return await api.post('/ai/group-consensus', { travelersPreferences });
  },

  getHiddenGems: async (category, maxCost) => {
    return await api.post('/ai/hidden-gems', { category, maxCost });
  },

  calculateSustainability: async (transportType, distanceKm) => {
    return await api.post('/ai/sustainability', { transportType, distanceKm });
  }
};
