import api from './api';

export const authService = {
  async login(identifier, password) {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data; // { success, data: { user, accessToken, refreshToken } }
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async updateProfile(data) {
    const response = await api.put('/student/profile', data);
    return response.data.data.user;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async initiatePasswordChange(currentPassword) {
    const response = await api.post('/auth/change-password/initiate', { currentPassword });
    return response.data;
  },

  async verifyPasswordChangeOtp1(otp) {
    const response = await api.post('/auth/change-password/verify-otp1', { otp });
    return response.data;
  },

  async submitNewPassword(newPassword) {
    const response = await api.post('/auth/change-password/submit-new', { newPassword });
    return response.data;
  },

  async verifyPasswordChangeOtp2(otp) {
    const response = await api.post('/auth/change-password/verify-otp2', { otp });
    return response.data;
  }
};

export default authService;
