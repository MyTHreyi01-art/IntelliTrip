import api from './api';

export const hotelService = {
  getHotels: async (params = {}) => {
    return await api.get('/hotels', { params });
  },

  getHotelById: async (id) => {
    return await api.get(`/hotels/${id}`);
  },

  createHotel: async (data) => {
    return await api.post('/hotels', data);
  },

  updateHotel: async (id, data) => {
    return await api.put(`/hotels/${id}`, data);
  },

  deleteHotel: async (id) => {
    return await api.delete(`/hotels/${id}`);
  },

  addRoom: async (hotelId, roomData) => {
    return await api.post(`/hotels/${hotelId}/rooms`, roomData);
  }
};
