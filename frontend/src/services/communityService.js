import api from './api';

export const communityService = {
  getPosts: async (category = '') => {
    const url = category ? `/community/posts?category=${category}` : '/community/posts';
    return await api.get(url);
  },

  createPost: async (postData) => {
    return await api.post('/community/posts', postData);
  },

  toggleLike: async (id) => {
    return await api.post(`/community/posts/${id}/like`);
  },

  addComment: async (id, text) => {
    return await api.post(`/community/posts/${id}/comment`, { text });
  },

  deletePost: async (id) => {
    return await api.delete(`/community/posts/${id}`);
  }
};
