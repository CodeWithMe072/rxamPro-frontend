import api from './api';

export const settingsService = {
  /**
   * Fetch the active site theme from the server.
   * Returns { activeTheme, updatedAt, updatedBy }
   */
  getTheme: async () => {
    const res = await api.get('/settings/theme');
    return res.data.data;
  },

  /**
   * Update the active site theme (Admin only).
   * @param {string} themeKey
   * @param {object} [customTheme]
   */
  updateTheme: async (themeKey, customTheme, maxAdmins, maxSubAdmins) => {
    const res = await api.put('/settings/theme', { activeTheme: themeKey, customTheme, maxAdmins, maxSubAdmins });
    return res.data.data;
  },

  getUIStrings: async () => {
    const res = await api.get('/settings/strings');
    return res.data.data;
  },

  updateUIStrings: async (stringsMap) => {
    const res = await api.put('/settings/strings', { strings: stringsMap });
    return res.data.data;
  }
};
