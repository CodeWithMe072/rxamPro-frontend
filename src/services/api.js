import axios from 'axios';

const getStoredItem = (key) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const setStoredItem = (key, value) => {
  if (localStorage.getItem(key)) {
    localStorage.setItem(key, value);
  } else if (sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, value);
  }
};

const removeStoredItem = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);
    if (!originalRequest.retryCount) originalRequest.retryCount = 0;

    const isRetryable = !error.response || (error.response.status >= 500 && error.response.status <= 599);
    if (isRetryable && originalRequest.retryCount < 3) {
      originalRequest.retryCount += 1;
      const delay = Math.pow(2, originalRequest.retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getStoredItem('refreshToken');
      if (refreshToken) {
        try {
          console.log('Refreshing session...');
          const response = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/refresh', {
            refreshToken
          });
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.data;

          setStoredItem('token', newToken);
          setStoredItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          removeStoredItem('token');
          removeStoredItem('refreshToken');
          removeStoredItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Detect banned account — fire a global event so the UI can react
    if (error.response?.status === 403) {
      const msg = error.response?.data?.message || '';
      const isBanMsg = msg.toLowerCase().includes('banned');
      if (isBanMsg) {
        window.dispatchEvent(new CustomEvent('account-banned', { detail: { message: msg } }));
        return Promise.reject(error); // stop normal error handling
      }
    }

    return Promise.reject(error);
  }
);

export default api;
