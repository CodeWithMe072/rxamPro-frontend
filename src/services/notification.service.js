import api from './api';

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data.data; // Array of notifications
  },

  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data; // Updated notification
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

export default notificationService;
