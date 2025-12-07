import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  signup: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Website APIs
export const websiteAPI = {
  getAll: () => api.get('/websites'),
  create: (data: { url: string; name?: string }) =>
    api.post('/websites', data),
  update: (id: string, data: { url?: string; name?: string }) =>
    api.put(`/websites/${id}`, data),
  delete: (id: string) => api.delete(`/websites/${id}`),
};

// Form APIs
export const formAPI = {
  detect: (data: { websiteId: string; url: string }) =>
    api.post('/forms/detect', data),
  create: (data: {
    websiteId: string;
    name: string;
    url: string;
    fields: Array<{
      name: string;
      type: string;
      label?: string;
      placeholder?: string;
      required: boolean;
    }>;
  }) => api.post('/forms', data),
  getByWebsite: (websiteId: string) =>
    api.get(`/forms/website/${websiteId}`),
  getSnippet: (formId: string) => api.get(`/forms/${formId}/snippet`),
  delete: (formId: string) => api.delete(`/forms/${formId}`),
};

// Lead APIs
export const leadAPI = {
  getAll: (params?: { formId?: string; startDate?: string; endDate?: string }) =>
    api.get('/leads', { params }),
  getByForm: (formId: string) => api.get(`/leads/form/${formId}`),
};

// Analytics APIs
export const analyticsAPI = {
  getLeadsPerForm: () => api.get('/analytics/leads-per-form'),
  getLeadsPerDay: (days: number = 30) =>
    api.get('/analytics/leads-per-day', { params: { days } }),
  getConversionTrends: () => api.get('/analytics/conversion-trends'),
};

export default api;
