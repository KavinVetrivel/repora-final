import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Add a response interceptor to handle CORS specifically
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('🚨 Network Error - Backend server may not be running on http://localhost:5000');
      console.error('👋 Please ensure the backend server is started with: npm run dev');
    }
    return Promise.reject(error);
  }
);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getAll: (params) => api.get('/bookings/all', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  checkAvailability: (params) => api.get('/bookings/check-availability', { params }),
  updateStatus: (id, statusData) => api.patch(`/bookings/${id}/status`, statusData),
  approve: (id, payload = {}) => api.patch(`/bookings/${id}/approve`, payload),
  reject: (id, payload = {}) => api.patch(`/bookings/${id}/reject`, payload),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const issueAPI = {
  create: (issueData) => {
    if (issueData instanceof FormData) {
      return api.post('/issues', issueData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/issues', issueData);
  },
  getMyIssues: (params) => api.get('/issues/my-issues', { params }),
  getAll: (params) => api.get('/issues/all', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  updateStatus: (id, statusData) => api.patch(`/issues/${id}/status`, statusData),
  resolve: (id, payload = {}) => api.patch(`/issues/${id}/resolve`, payload),
  reject: (id, payload = {}) => api.patch(`/issues/${id}/reject`, payload),
  delete: (id) => api.delete(`/issues/${id}`),
  getStats: () => api.get('/issues/stats/summary'),
};

export const announcementAPI = {
  create: (announcementData) => api.post('/announcements', announcementData),
  getAll: (params) => api.get('/announcements', { params }),
  getAllForAdmin: (params) => api.get('/announcements/all', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  update: (id, announcementData) => api.put(`/announcements/${id}`, announcementData),
  delete: (id) => api.delete(`/announcements/${id}`),
  togglePin: (id) => api.patch(`/announcements/${id}/toggle-pin`),
  getStats: () => api.get('/announcements/stats/summary'),
};

export const dashboardAPI = {
  getAdminDashboard: (params) => api.get('/dashboard/admin', { params }),
  getStudentDashboard: (studentId, params) => api.get(`/dashboard/student/${studentId}`, { params }),
  getMyDashboard: (params) => api.get('/dashboard/student', { params }),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  create: (userData) => api.post('/users', userData),
  updateStatus: (id, statusData) => api.patch(`/users/${id}/status`, statusData),
  approve: (id) => api.patch(`/users/${id}/approve`),
  reject: (id, reason) => api.patch(`/users/${id}/reject`, { reason }),
  getPendingApproval: (params) => api.get('/users/pending-approval', { params }),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getAllUsers: () => api.get('/users/all')
};

// File upload helper
export const uploadFile = async (file, endpoint, additionalData = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Append additional data
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Error handler helper
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

export default api;





