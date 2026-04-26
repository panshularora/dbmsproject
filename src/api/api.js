import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

// Add a request interceptor for tokens if needed later
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to capture the SQL query header
api.interceptors.response.use((response) => {
  const sql = response.headers['x-sql-query'];
  if (sql) {
    window.dispatchEvent(new CustomEvent('sql-executed', { detail: sql }));
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default api;
