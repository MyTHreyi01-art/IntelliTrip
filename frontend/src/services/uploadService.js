import api from './api';

export const uploadService = {
  uploadImage: async (base64Data, fileName = 'downloaded_image') => {
    return await api.post('/upload', { image: base64Data, fileName });
  },

  getAvailableDownloadedImages: async () => {
    return await api.get('/upload/available');
  }
};

