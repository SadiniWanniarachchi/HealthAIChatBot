import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Check both localStorage and sessionStorage for token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear all storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    forgotPassword: async (emailData) => {
        const response = await api.post('/auth/forgot-password', emailData);
        return response.data;
    },

    resetPassword: async (resetData) => {
        const response = await api.post('/auth/reset-password', resetData);
        return response.data;
    }
};

// Users API
export const usersAPI = {
    searchUsers: async (query) => {
        const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    updateHealthProfile: async (healthData) => {
        const response = await api.put('/users/health-profile', healthData);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await api.put('/users/change-password', passwordData);
        return response.data;
    }
};

// Chat API
export const chatAPI = {
    getChats: async () => {
        const response = await api.get('/chat');
        return response.data;
    },

    createChat: async (chatData) => {
        const response = await api.post('/chat', chatData);
        return response.data;
    },

    getChatById: async (chatId) => {
        const response = await api.get(`/chat/${chatId}`);
        return response.data;
    },

    addMessage: async (chatId, messageData) => {
        const response = await api.post(`/chat/${chatId}/messages`, messageData);
        return response.data;
    },

    addParticipant: async (chatId, userId) => {
        const response = await api.put(`/chat/${chatId}/participants`, { userId });
        return response.data;
    },

    removeParticipant: async (chatId, userId) => {
        const response = await api.delete(`/chat/${chatId}/participants/${userId}`);
        return response.data;
    },

    deleteChat: async (chatId) => {
        const response = await api.delete(`/chat/${chatId}`);
        return response.data;
    }
};

// Diagnosis API
export const diagnosisAPI = {
    startDiagnosis: async (userData) => {
        const response = await api.post('/diagnosis/start', userData);
        return response.data;
    },

    sendMessage: async (sessionId, messageData) => {
        const response = await api.post(`/diagnosis/${sessionId}/message`, messageData);
        return response.data;
    },

    completeDiagnosis: async (sessionId, additionalData) => {
        const response = await api.post(`/diagnosis/${sessionId}/complete`, additionalData);
        return response.data;
    },

    getDiagnosisHistory: async (page = 1, limit = 10) => {
        const response = await api.get(`/diagnosis/history?page=${page}&limit=${limit}`);
        return response.data;
    },

    getDiagnosisSession: async (sessionId) => {
        const response = await api.get(`/diagnosis/${sessionId}`);
        return response.data;
    },

    deleteDiagnosis: async (sessionId) => {
        const response = await api.delete(`/diagnosis/${sessionId}`);
        return response.data;
    }
};

export default api;
