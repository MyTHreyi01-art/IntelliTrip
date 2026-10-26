import api from './api';

export const loyaltyService = {
  getProfile: async () => {
    return await api.get('/loyalty/profile');
  },

  earnPoints: async (action, points, description) => {
    return await api.post('/loyalty/earn', { action, points, description });
  },

  redeemPoints: async (pointsToRedeem, rewardTitle) => {
    return await api.post('/loyalty/redeem', { pointsToRedeem, rewardTitle });
  }
};
