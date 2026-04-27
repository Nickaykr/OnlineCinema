import axios from 'axios';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { authAPI, UpdateProfileData, User, userAPI } from '../services/api';
import { authEvents } from '../services/authEvents';
import { CONFIG } from '../services/constants';
import { storage } from '../services/storage';


const API_BASE_URL = CONFIG.API_BASE_URL;

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getDeviceSessionId = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('device_session_id');
  }
  return await SecureStore.getItemAsync('device_session_id');
};

const setDeviceSessionId = async (id: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('device_session_id', id);
  } else {
    await SecureStore.setItemAsync('device_session_id', id);
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadStoredAuth = async (): Promise<void> => {
    try {
      const accessToken = await storage.getSecureItem('accessToken');
      const storedUser = await storage.getItem('userData');

      if (accessToken && storedUser) {
        setUser(JSON.parse(storedUser));
        
        try {
          // Проверяем валидность токена, запрашивая свежий профиль
          const response = await userAPI.getProfile();
          setUser(response.data.user);
          await storage.setItem('userData', JSON.stringify(response.data.user));
        } catch (error: any) { 
          // Если профиль не загрузился (например, 401 Unauthorized)
          console.log('Profile fetch failed, checking refresh token...');
        }
      } else {
        console.log('No authentication token found.');
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false); // В любом случае выключаем спиннер
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

     // Получаем ID. Если его нет, явно ставим null, чтобы поле попало в JSON
      const storedId = await getDeviceSessionId();
      const deviceSessionId = storedId || `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;;

      const getBetterDeviceName = () => {
        if (Platform.OS !== 'web') {
          return `${Device.brand} ${Device.modelName || ''}`;
        }

        // Для Веба: определяем ОС
        const ua = navigator.userAgent;
        console.log('User Agent:', ua);
        let os = "Unknown OS";
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

        // Определяем Браузер
        let browser = "Browser";

        if (ua.includes("YaBrowser")) browser = "Yandex"; // Проверяем Яндекс первым
        else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

        return `${os} (${browser})`;
      };

      const deviceName = getBetterDeviceName();
      
      const response = await authAPI.login({ 
        email, 
        password,
        device_id: deviceSessionId,
        device_name: deviceName
      });
      
      const { accessToken, refreshToken, device_id: newId, user } = response.data;
      // Сохраняем полученный ID (он придет от сервера при первом входе)
      if (newId) {
        await setDeviceSessionId(newId);
      }
        
      await storage.setSecureItem('accessToken', accessToken);
      await storage.setSecureItem('refreshToken', refreshToken);
      await storage.setItem('userData', JSON.stringify(user));

      setUser(user);
    
    } catch (error: any) {
      // Обрабатываем специфическую ошибку лимита устройств
      if (error.response?.status === 403) {
        // Здесь можно вывести красивое модальное окно или Alert
        const errorMessage = error.response?.data?.message || 'Лимит устройств исчерпан';
        throw new Error(errorMessage);
      }

      throw new Error(error.response?.data?.error || 'Login failed');
      
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
      try {
        setIsLoading(true);

        const dataWithDevice = {
          ...userData,
          device_name: `${Platform.OS} ${Platform.Version}`
        };

        const response = await authAPI.register(dataWithDevice);

        const { accessToken, refreshToken, device_id, user: regUser } = response.data;

        await setDeviceSessionId(device_id);

        await storage.setSecureItem('accessToken', accessToken);
        await storage.setSecureItem('refreshToken', refreshToken);
        await storage.setItem('userData', JSON.stringify(regUser));

        setUser(regUser);
      } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = await storage.getSecureItem('refreshToken');
      
      if (refreshToken) {
        
        // Используем чистый axios напрямую, чтобы не зависеть от твоих конфигов
        // Замени URL на свой полный путь к API
        await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken }, {
          timeout: 5000 // Ждем максимум 5 секунд
        });
        
      }
    } catch (e) {
      console.log('Server-side logout failed, but we continue local logout');
    } finally {
      await storage.removeSecureItem('accessToken');
      await storage.removeSecureItem('refreshToken');
      await storage.removeItem('userData');
      setUser(null);
    }
  };

  const updateUser = async (userData: UpdateProfileData): Promise<void> => {
      const response = await userAPI.updateProfile(userData);
      setUser(response.data.user);
      await storage.setItem('userData', JSON.stringify(response.data.user));
  };

  useEffect(() => {
    authEvents.logout = logout;
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuth: !!user, 
        isLoading, 
        login, 
        register, 
        logout, 
        updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};