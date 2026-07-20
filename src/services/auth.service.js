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

  // Alias used by AuthContext to fetch fresh user on every page load
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async updateProfile(data) {
    let payload = data;
    let headers = {};

    // Check if we need to send as multipart/form-data
    const hasFile = data.avatarFile || (data.avatar && (data.avatar instanceof File || data.avatar instanceof Blob));
    if (hasFile || data.name || data.email || data.phone !== undefined) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.phone !== undefined) formData.append('phone', data.phone);
      
      if (data.avatarFile) {
        formData.append('avatar', data.avatarFile);
      } else if (data.avatar && (data.avatar instanceof File || data.avatar instanceof Blob)) {
        formData.append('avatar', data.avatar);
      } else if (data.avatar) {
        formData.append('avatar', data.avatar);
      }
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await api.put('/student/profile', payload, { headers });
    return response.data; // Note: return full response body now so we can read requiresEmailVerification!
  },

  async verifyEmailChangeOtp(otp) {
    const response = await api.post('/student/verify-email-otp', { otp });
    return response.data.data.user;
  },

  async checkUsernameAvailability(username) {
    const response = await api.get(`/student/check-username/${encodeURIComponent(username)}`);
    return response.data; // { success, available, message }
  },

  async updateUsername(username) {
    const response = await api.put('/student/username', { username });
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
