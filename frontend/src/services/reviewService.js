import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  },

  getReviewsByTarget: async (targetId) => {
    return await api.get(`/reviews/target/${targetId}`);
  }
};
