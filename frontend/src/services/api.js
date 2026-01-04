import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Account APIs
export const accountAPI = {
  getAll: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
  delete: (id) => api.delete(`/accounts/${id}`),
  update: (id, data) => api.put(`/accounts/${id}`, data),
};
// Post APIs
export const postAPI = {
  create: (formData) => {
    return api.post('/posts/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  schedule: (data) => api.post('/posts/schedule', data),
  getHistory: () => api.get('/posts/history'),
};

export default api;