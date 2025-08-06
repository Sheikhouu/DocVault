import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signUp: async (data: { email: string; password: string; fullName?: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  signIn: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/signin', data);
    if (response.data.session?.access_token) {
      localStorage.setItem('auth_token', response.data.session.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signOut: async () => {
    const response = await api.post('/auth/signout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return response.data;
  },

  resetPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  updatePassword: async (data: { password: string }) => {
    const response = await api.post('/auth/update-password', data);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  getDocuments: async (params?: { category?: string; search?: string; tags?: string[] }) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  getDocument: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  createDocument: async (formData: FormData) => {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDocument: async (id: string, data: any) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  deleteDocument: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  generateShareLink: async (id: string, expiresIn?: string) => {
    const response = await api.post(`/documents/${id}/share`, { expiresIn });
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profiles');
    return response.data;
  },

  updateProfile: async (data: { full_name?: string; avatar_url?: string }) => {
    const response = await api.put('/profiles', data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/profiles/stats');
    return response.data;
  },
};

export default api;