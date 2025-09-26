import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authAPI, UpdateProfileData, User, userAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Проверяем валидность токена
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          // Токен невалидный, очищаем хранилище
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userData');
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (userData: UpdateProfileData): Promise<void> => {
    try {
      const response = await userAPI.updateProfile(userData);
      setUser(response.data.user);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка обновления профиля');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};