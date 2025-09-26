import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
  register: (userData: RegisterData): Promise<{ data: AuthResponse }> => 
    api.post('/auth/register', userData),
  
  login: (credentials: LoginCredentials): Promise<{ data: AuthResponse }> => 
    api.post('/auth/login', credentials),
  
  getMe: (): Promise<{ data: { user: User } }> => 
    api.get('/auth/me'),
  
  logout: (): Promise<any> => 
    api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: (): Promise<{ data: { user: User } }> => 
    api.get('/users/profile'),
  
  updateProfile: (userData: UpdateProfileData): Promise<{ data: { user: User } }> => 
    api.put('/users/profile', userData),
};