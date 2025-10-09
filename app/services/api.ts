// services/api.ts
import axios from 'axios';
import { storage } from './storage';

const API_BASE_URL = 'http://192.168.0.11:5000/api';


export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('token'); // Используем ваш storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Токен невалидный - удаляем его
      await storage.removeItem('token'); // Используем ваш storage
      await storage.removeItem('userData'); // И пользовательские данные
    }
    return Promise.reject(error);
  }
);

// ... остальные интерфейсы и API функции без изменений ...
export interface User {
  user_id: number;
  email: string;
  username: string;
  avatar_url?: string;
  date_of_birth?: string;
  country?: string;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  accessToken: string; 
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  date_of_birth?: string;
  country?: string;
}

export interface UpdateProfileData {
  username?: string;
  avatar_url?: string;
  date_of_birth?: string;
  country?: string;
}

// Функции API
export const authAPI = {
  register: async (userData: RegisterData): Promise<{ data: AuthResponse }> => {
    const response = await api.post('/auth/register', userData);
    return response;
  },
  
  login: async (credentials: LoginCredentials): Promise<{ data: AuthResponse }> => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },
  
  getMe: (): Promise<{ data: { user: User } }> => 
    api.get('/auth/me'),
  
  logout: async (): Promise<any> => {
    return api.post('/auth/logout');
  },
};

export const userAPI = {
  getProfile: (): Promise<{ data: { user: User } }> => 
    api.get('/users/profile'),
  
  updateProfile: (userData: UpdateProfileData): Promise<{ data: { user: User } }> => 
    api.put('/users/profile', userData),
};