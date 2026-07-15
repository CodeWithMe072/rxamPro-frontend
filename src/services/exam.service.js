import api from './api';

export const examService = {
  async startExam(testIdOrScheduleId) {
    const response = await api.post('/exams/start', { 
      testId: testIdOrScheduleId, 
      testScheduleId: testIdOrScheduleId 
    });
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
  },

  async saveAnswer(attemptId, questionId, selectedOption, timeSpent = 0) {
    const response = await api.post(`/exams/attempts/${attemptId}/answers`, { questionId, selectedOption, timeSpent });
    return response.data;
  },

  async clearAnswer(attemptId, questionId) {
    const response = await api.post('/exams/clear-answer', { attemptId, questionId });
    return response.data;
  },

  async getAttemptDetails(attemptId) {
    const response = await api.get(`/exams/attempts/${attemptId}`);
    return response.data.data;
  },

  async logWarning(attemptId, type) {
    const response = await api.post(`/exams/attempts/${attemptId}/warning`, { type });
    return response.data.data;
  },

  async markReview(attemptId, questionId) {
    const response = await api.post('/exams/mark-review', { attemptId, questionId });
    return response.data;
  }
};

export default examService;
