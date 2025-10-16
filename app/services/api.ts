import axios from 'axios';
import { Media } from '../types/media.types';
import { CONFIG } from './constants';
import { storage } from './storage';

const API_BASE_URL = CONFIG.API_BASE_URL;


export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('token'); 
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
      await storage.removeItem('token'); 
      await storage.removeItem('userData'); 
    }
    return Promise.reject(error);
  }
);

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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface MediaFilters {
  type?: 'movie' | 'series';
  limit?: number;
  offset?: number;
  search?: string;
  genre?: string;
  year?: number;
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

export const mediaAPI = {
  // Получить все медиа с фильтрами
  getMedia: async (filters?: MediaFilters): Promise<ApiResponse<Media[]>> => {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.year) params.append('year', filters.year.toString());

    const response = await api.get(`/media?${params.toString()}`);
    return response.data;
  },

  // Получить медиа по ID
  getMediaById: async (id: string): Promise<ApiResponse<Media>> => {
    const response = await api.get(`/media/${id}`);
    return response.data;
  },

  // Получить популярные медиа
  getPopularMedia: async (): Promise<ApiResponse<Media[]>> => {
    const response = await api.get('/media/popular');
    return response.data;
  },

  // Получить новинки
  getNewMedia: async (): Promise<ApiResponse<Media[]>> => {
    const response = await api.get('/media/new');
    return response.data;
  },

  // Получить фильмы
  getMovies: async (limit: number = 20): Promise<ApiResponse<Media[]>> => {
    const response = await api.get(`/media?type=movie&limit=${limit}`);
    return response.data;
  },

  // Получить сериалы
  getSeries: async (limit: number = 20): Promise<ApiResponse<Media[]>> => {
    const response = await api.get(`/media?type=series&limit=${limit}`);
    return response.data;
  },
};

export const checkEndpoints = async () => {
  const endpoints = [
    '/auth/me',
    '/media',
    '/media?type=movie',
    '/media?type=series',
    '/media/new',
    '/media/popular'
  ];

  console.log('🔍 Checking available endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      console.log(`✅ ${endpoint} - ${response.status}`);
    } catch (error: any) {
      console.log(`❌ ${endpoint} - ${error.response?.status || error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Задержка между запросами
  }
};


