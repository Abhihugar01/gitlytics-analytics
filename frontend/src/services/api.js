import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const authAPI = {
  getLoginUrl: () => api.get('/auth/github'),
  getMe: (userId) => api.get('/auth/me', { params: { user_id: userId } }),
};

export const reposAPI = {
  getAll: (userId) => api.get('/repos/', { params: { user_id: userId } }),
  getOne: (repoId, userId) => api.get(`/repos/${repoId}`, { params: { user_id: userId } }),
  getActivity: (userId) => api.get('/repos/activity', { params: { user_id: userId } }),
};

export const analysisAPI = {
  start: (repoId, userId) => api.post(`/analysis/${repoId}`, null, { params: { user_id: userId } }),
  getTaskStatus: (taskId) => api.get(`/analysis/task/${taskId}`),
  getAnalysis: (repoId, userId) => api.get(`/analysis/${repoId}`, { params: { user_id: userId } }),
  getGlobal: (userId) => api.get('/analysis/global', { params: { user_id: userId } }),
  getInsights: (repoId, userId) => api.get(`/analysis/${repoId}/insights`, { params: { user_id: userId } }),
  getReportUrl: (repoId, userId) => `${API_BASE}/analysis/${repoId}/report?user_id=${userId}`,
  compare: (repoA, repoB, userId) =>
    api.get('/analysis/compare', { params: { repo_a: repoA, repo_b: repoB, user_id: userId } }),
};

export default api;
