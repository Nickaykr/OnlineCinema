import axios from 'axios';
import { Media } from '../../types/media.types';
import { logoutFromApi } from '../context/AuthContext';
import { CONFIG } from './constants';
import { storage } from './storage';

const API_BASE_URL = CONFIG.API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
});

api.interceptors.request.use(
  async (config) => {
  
    const token = await storage.getSecureItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('❌ No refresh token found in storage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если получили 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен
        const { data } = await authAPI.refreshToken();
        
        // Повторяем изначальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await storage.removeSecureItem('accessToken');
        await storage.removeSecureItem('refreshToken');
        await storage.removeItem('userData');
        logoutFromApi();
        return Promise.reject(refreshError);
      }
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
  accessToken: string;  
  refreshToken: string;
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

export interface CinemaClub {
  club_id: number;
  title: string;
  description: string;
  type: 'genre' | 'director' | 'mood' | 'seasonal' | 'trending';
  cover_image: string;
  media_count: number;
  media: Media[];
}

// Функции API
export const authAPI = {
  register: async (userData: RegisterData): Promise<{ data: AuthResponse }> => {
    const response = await api.post('/auth/register', userData);
    const { accessToken, refreshToken } = response.data;
    
    if (accessToken && refreshToken) {
      await storage.setSecureItem('accessToken', accessToken);
      await storage.setSecureItem('refreshToken', refreshToken);
    }
    return response;
  },
  
  login: async (credentials: LoginCredentials): Promise<{ data: AuthResponse }> => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;
    
    if (accessToken && refreshToken) {
      await storage.setSecureItem('accessToken', accessToken);
      await storage.setSecureItem('refreshToken', refreshToken);
    }
    
    return response;
  },
  
  refreshToken: async (): Promise<{ data: AuthResponse }> => {
    const refreshToken = await storage.getSecureItem('refreshToken');
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    
    const { accessToken, refreshToken: newRefresh } = response.data;
    await storage.setSecureItem('accessToken', accessToken);
    await storage.setSecureItem('refreshToken', newRefresh);
    
    return response;
  },
  
  logout: async (): Promise<any> => {
    const refreshToken = await storage.getSecureItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    
    await storage.removeSecureItem('accessToken');
    await storage.removeSecureItem('refreshToken');
    await storage.removeItem('userData');
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

  getMovies: async (limit: number = 20): Promise<ApiResponse<Media[]>> => {
    const response = await api.get(`/media?type=movie&is_animation=0&limit=${limit}`);
    return response.data;
  },

  // Получить сериалы
  getSeries: async (limit: number = 20): Promise<ApiResponse<Media[]>> => {
    const response = await api.get(`/media?type=tv_series&is_animation=0&limit=${limit}`);
    return response.data;
  },

  getComingSoon: async (limit: number = 20): Promise<ApiResponse<Media[]>> => {
    const response = await api.get(`/media/comingSoon`);
    return response.data;
  },

  getMediaByGenre: async (genre: string, limit: number = 20): Promise<ApiResponse<Media[]>> => {
    const encodedGenre = encodeURIComponent(genre);
    const response = await api.get(`/media/genre/${encodedGenre}?limit=${limit}`);
    return response.data;
  },

  getMediaByAnimations: async (limit: number = 20): Promise<ApiResponse<Media[]>> => {
    const response = await api.get(`/media?is_animation=1&limit=${limit}`);
    return response.data;
  },
};

export const cinemaClubsAPI = {
  // Получить все киноклубы
  getAllClubs: async (): Promise<ApiResponse<CinemaClub[]>> => {
    const response = await api.get(`/cinema-clubs?limit=20`);
    return response.data;
  },

  // Получить киноклубы по типу
  getClubsByType: async (type: CinemaClub['type']): Promise<ApiResponse<CinemaClub[]>> => {
    const response = await api.get(`/cinema-clubs?type=${type}&limit=10`);
    return response.data;
  },

  // Получить конкретный киноклуб
  getClubById: async (id: number): Promise<ApiResponse<CinemaClub>> => {
    const response = await api.get(`/cinema-clubs/${id}`);
    return response.data;
  },

  // Получить все секции для главной страницы киноклубов
  getClubSections: async (): Promise<{
    genres: CinemaClub[];
    directors: CinemaClub[];
    moods: CinemaClub[];
    seasonal: CinemaClub[];
    trending: CinemaClub[];
  }> => {
    const [genres, directors, moods, seasonal, trending] = await Promise.all([
      cinemaClubsAPI.getClubsByType('genre'),
      cinemaClubsAPI.getClubsByType('director'),
      cinemaClubsAPI.getClubsByType('mood'),
      cinemaClubsAPI.getClubsByType('seasonal'),
      cinemaClubsAPI.getClubsByType('trending')
    ]);

    return {
      genres: genres.data,
      directors: directors.data,
      moods: moods.data,
      seasonal: seasonal.data,
      trending: trending.data
    };
  }
};




