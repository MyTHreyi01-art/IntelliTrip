import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    return await api.get('/wishlist');
  },

  toggleWishlist: async (itemType, itemId) => {
    return await api.post('/wishlist/toggle', { itemType, itemId });
  }
};
