import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    return await api.post('/bookings', bookingData);
  },

  getAllBookings: async () => {
    return await api.get('/bookings');
  },

  getMyBookings: async () => {
    return await api.get('/bookings/my-bookings');
  },

  getBookingById: async (id) => {
    return await api.get(`/bookings/${id}`);
  },

  cancelBooking: async (id) => {
    return await api.patch(`/bookings/${id}/cancel`);
  },

  deleteBooking: async (id) => {
    return await api.delete(`/bookings/${id}`);
  }
};
