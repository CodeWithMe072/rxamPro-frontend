import api from './api';

export const testService = {
  async getAvailableTests({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/tests', { params: { page, limit } });
    return response.data; // returns { data, pagination }
  },

  async getTestDetails(id) {
    const response = await api.get(`/tests/${id}`);
    return response.data.data;
  },

  async getLeaderboard(testId = 'all') {
    const url = testId === 'all' ? '/leaderboard' : `/leaderboard/test/${testId}`;
    const response = await api.get(url);
    return response.data.data;
  },

  async getPreviousAttempts({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/attempts', { params: { page, limit } });
    return response.data; // returns { data, pagination }
  },

  async getStudentDashboard() {
    const response = await api.get('/student/dashboard');
    return response.data.data;
  },

  async getAttemptResult(attemptId) {
    const response = await api.get(`/results/${attemptId}`);
    return response.data.data;
  },

  async downloadResultPDF(attemptId) {
    const response = await api.get(`/results/${attemptId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async downloadTestPDF(testId, params = {}) {
    const response = await api.get(`/tests/${testId}/pdf`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async downloadJSONTemplate() {
    const response = await api.get('/tests/templates/json', { responseType: 'blob' });
    return response.data;
  },

  async downloadExcelTemplate() {
    const response = await api.get('/tests/templates/excel', { responseType: 'blob' });
    return response.data;
  },

  // Admin Controls
  async createTest(testData) {
    const response = await api.post('/tests', testData);
    return response.data.data;
  },

  async updateTest(id, testData) {
    const response = await api.put(`/tests/${id}`, testData);
    return response.data.data;
  },

  async deleteTest(id) {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  async uploadTestConfig(formData) {
    const response = await api.post('/tests/upload-json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  async getAnalytics() {
    const response = await api.get('/admin/analytics');
    return response.data.data;
  },

  async getAttempts({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/admin/attempts', { params: { page, limit } });
    return response.data; // returns { data, pagination }
  },

  async getUsers({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/admin/users', { params: { page, limit } });
    return response.data; // returns { data, pagination }
  },

  async updateUserRole(id, updateData) {
    const payload = typeof updateData === 'string' ? { role: updateData } : updateData;
    const response = await api.put(`/admin/users/${id}/role`, payload);
    return response.data;
  },

  async toggleUserBan(id) {
    const response = await api.post(`/admin/users/${id}/ban`);
    return response.data;
  },


  /** Step 1: Validate form data, send OTP email */
  async initiateCreateUser(userData) {
    const response = await api.post('/admin/users/initiate', userData);
    return response.data;
  },

  /** Step 2: Verify OTP and actually create the account */
  async verifyUserOtp(email, otp) {
    const response = await api.post('/admin/users/verify', { email, otp });
    return response.data;
  },

  /** Resend a fresh OTP to the given email */
  async resendUserOtp(email) {
    const response = await api.post('/admin/users/resend-otp', { email });
    return response.data;
  },


  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  async editUserDetails(id, details) {
    const response = await api.put(`/admin/users/${id}/details`, details);
    return response.data; // { success, message, data: { user } }
  },

  async importUsers(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async exportBatch(batchId) {
    const response = await api.get(`/results/batch/${batchId}/export`, { responseType: 'blob' });
    return response.data;
  },

  async exportTest(testId, scheduleId = 'all') {
    const response = await api.get(`/results/test/${testId}/export`, {
      params: { scheduleId },
      responseType: 'blob'
    });
    return response.data;
  },

  async getUserAttempts(userId, { page = 1, limit = 20 } = {}) {
    const response = await api.get(`/admin/users/${userId}/attempts`, { params: { page, limit } });
    return response.data; // returns { data, pagination }
  },

  async getBatches({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/batches', { params: { page, limit } });
    return response.data; // returns { data, pagination }
  },

  async createBatch(data) {
    const response = await api.post('/batches', data);
    return response.data.data;
  },

  async updateBatch(id, data) {
    const response = await api.put(`/batches/${id}`, data);
    return response.data.data;
  },

  async deleteBatch(id) {
    const response = await api.delete(`/batches/${id}`);
    return response.data;
  },

  async getQuestions(testId, { page = 1, limit = 20 } = {}) {
    const response = await api.get(`/questions/${testId}`, { params: { page, limit } });
    return response.data; // returns { data, pagination }
  },

  async createQuestion(data) {
    const response = await api.post('/questions', data);
    return response.data.data;
  },

  async updateQuestion(id, data) {
    const response = await api.put(`/questions/${id}`, data);
    return response.data.data;
  },

  async deleteQuestion(id) {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  async importQuestionsJSON(testId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/questions/import-json/${testId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  async exportQuestions(testId, format = 'json', type = 'data') {
    const response = await api.get(`/questions/export/${testId}?format=${format}&type=${type}`, {
      responseType: 'blob'
    });
    const ext      = format === 'excel' ? 'xlsx' : 'json';
    const mimeType = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/json';
    const suffix   = type === 'template' ? '_template' : '_questions';
    const url  = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
    const link = document.createElement('a');
    link.href  = url;
    link.download = `questions${suffix}_${testId}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },


  async revealAnswers(attemptId) {
    const response = await api.post(`/results/${attemptId}/reveal-answers`);
    return response.data;
  },

  async getTestSchedules(testId) {
    const response = await api.get(`/tests/${testId}/schedules`);
    return response.data.data;
  },

  async createTestSchedule(testId, scheduleData) {
    const response = await api.post(`/tests/${testId}/schedules`, scheduleData);
    return response.data.data;
  },

  async updateTestSchedule(scheduleId, scheduleData) {
    const response = await api.put(`/tests/schedules/${scheduleId}`, scheduleData);
    return response.data.data;
  },

  async deleteTestSchedule(scheduleId) {
    const response = await api.delete(`/tests/schedules/${scheduleId}`);
    return response.data;
  }
};

export default testService;
