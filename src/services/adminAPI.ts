import axios from 'axios';
import { authEvents } from '../services/authEvents';
import { CONFIG } from './constants';
import { storage } from './storage';

const API_BASE_URL = CONFIG.API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
});

// Добавляем токен в каждый запрос автоматически
api.interceptors.request.use( 
  async (config) => {

    const token = await storage.getSecureItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('💡 No access token found in storage ');
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
        const refreshToken = await storage.getSecureItem('refreshToken');
        
        const response = await axios.post(`${CONFIG.API_BASE_URL}/auth/refresh`, { 
          refreshToken: refreshToken 
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await storage.setSecureItem('accessToken', accessToken);
        await storage.setSecureItem('refreshToken', newRefreshToken);
        
        // Повторяем изначальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await storage.removeSecureItem('accessToken');
        await storage.removeSecureItem('refreshToken');
        await storage.removeItem('userData');
        authEvents.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Получить список всех медиа
  getMedia: () => api.get('/admin/media').then(res => res.data),

  getAllGenres: () => api.get('/admin/genres').then(res => res.data),

  getAllPeople: () => api.get('/admin/people').then(res => res.data),

  getAllRoles: () => api.get('/admin/roles').then(res => res.data),

  getMediaById: (id: number) => api.get(`/media/${id}?type=media`).then(res => res.data),

  updateMedia: (id: number, data: any) => api.put(`/admin/media/${id}`, data).then(res => res.data),
  
  // Создать новую франшизу
  createMedia: (data: any) => api.post('/admin/media', data).then(res => res.data),
  
  // Удалить медиа
  deleteMedia: (id: number) => api.delete(`/media/${id}`).then(res => res.data),
};