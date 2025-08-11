import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add a request interceptor to include auth token if needed
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  files?: FileInfo[];
}

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface ChatResponse {
  id: string;
  content: string;
  role: 'assistant';
  timestamp: Date;
}

export interface SessionResponse {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadResponse {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

// Chat API
export const chatAPI = {
  // Send a message and get a streaming response
  sendMessage: async (sessionId: string, message: ChatMessage) => {
    const response = await api.post<ChatResponse>(
      `/chat/${sessionId}/message`,
      message
    );
    return response.data;
  },

  // Create a new session
  createSession: async () => {
    const response = await api.post<SessionResponse>('/chat/sessions');
    return response.data;
  },

  // Get all sessions
  getSessions: async () => {
    const response = await api.get<SessionResponse[]>('/chat/sessions');
    return response.data;
  },

  // Delete a session
  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  // Clear session messages
  clearSession: async (sessionId: string) => {
    const response = await api.delete(`/chat/${sessionId}/messages`);
    return response.data;
  },
};

// File upload API
export const fileAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: any }>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post<{ token: string; user: any }>('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
