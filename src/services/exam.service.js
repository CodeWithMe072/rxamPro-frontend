import api from './api';

export const examService = {
  async startExam(testId) {
    const response = await api.post('/exams/start', { testId });
    return response.data.data; // { sessionId, testId, title, duration, totalQuestions, questions }
  },

  async saveCheckpoint(sessionId, answers) {
    const response = await api.post('/exams/checkpoint', { sessionId, answers });
    return response.data;
  },

  async submitExam(sessionId, answers) {
    const response = await api.post('/exams/submit', { sessionId, answers });
    return response.data.data; // formatted result details
  },

  async uploadProctorSnapshot(sessionId, image, reason) {
    const response = await api.post(`/exam/proctor/${sessionId}/snapshot`, { image, reason });
    return response.data;
  }
};

export default examService;
