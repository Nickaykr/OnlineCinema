import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authAPI, UpdateProfileData, User, userAPI } from '../services/api';
import { storage } from '../services/storage';

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
    console.log('🔍 Loading stored auth...');
    const storedToken = await storage.getItem('token');
    const storedUser = await storage.getItem('userData');

    console.log('💾 Stored token:', storedToken); 
    console.log('💾 Stored user:', storedUser); 

    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined' && storedUser) {
      setToken(storedToken);
      
      // ДОБАВЬТЕ ПРОВЕРКУ ТИПА ДЛЯ storedUser
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (parseError) {
        console.error('❌ Error parsing user data:', parseError);
        await storage.removeItem('userData');
        setUser(null);
      }
      
      // Проверяем валидность токена
      try {
        console.log('🔑 Validating token...');
        const response = await authAPI.getMe();
        setUser(response.data.user);
        console.log('✅ Token valid, user:', response.data.user.email);
      } catch (error) {
        console.error('❌ Token invalid, clearing storage');
        await storage.removeItem('token');
        await storage.removeItem('userData');
        setToken(null);
        setUser(null);
      }
    } else {
      console.log('❌ No stored auth data found');
      setToken(null);
      setUser(null);
    }
  } catch (error) {
    console.error('Error loading stored auth:', error);
    setToken(null);
    setUser(null);
  } finally {
    setIsLoading(false);
    console.log('✅ Auth loading completed, isLoading:', false);
  }
};

const login = async (email: string, password: string): Promise<void> => {
  try {
    setIsLoading(true);
    console.log('🔐 Attempting login...');
    
    const response = await authAPI.login({ email, password });

    console.log('✅ Login response received');
    
    // ВРЕМЕННО ИСПОЛЬЗУЙТЕ ANY чтобы обойти проверку типов
    const responseData: any = response.data;
    
    console.log('🔑 AccessToken received:', responseData.accessToken);
    console.log('👤 User received:', responseData.user);

    // ПРОВЕРКА accessToken
    if (!responseData.accessToken) {
      console.error('❌ ERROR: AccessToken is undefined!');
      throw new Error('No authentication token received from server');
    }

    if (!responseData.user) {
      console.error('❌ ERROR: User data is undefined!');
      throw new Error('No user data received from server');
    }

    // Сохраняем accessToken вместо token
    await storage.setItem('token', responseData.accessToken);
    await storage.setItem('userData', JSON.stringify(responseData.user));
    
    setToken(responseData.accessToken);
    setUser(responseData.user);

    console.log('💾 Auth data saved to storage');
    console.log('✅ Login successful!');
    
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    // Очищаем на случай частичного сохранения
    await storage.removeItem('token');
    await storage.removeItem('userData');
    
    throw new Error(error.response?.data?.error || error.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};

const register = async (userData: any): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('👤 Attempting registration...');
      
      const response = await authAPI.register(userData);

      console.log('✅ Registration response received');
      console.log('🔑 Token received:', !!response.data.token);
      console.log('👤 User received:', response.data.user.email);

      await storage.setItem('token', response.data.token);
      await storage.setItem('userData', JSON.stringify(response.data.user));
      
      setToken(response.data.token);
      setUser(response.data.user);

      console.log('💾 Auth data saved to storage');
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out...');
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.removeItem('token');
      await storage.removeItem('userData');
      setToken(null);
      setUser(null);
      console.log('✅ Logout completed');
    }
  };

  const updateUser = async (userData: UpdateProfileData): Promise<void> => {
    try {
      const response = await userAPI.updateProfile(userData);
      setUser(response.data.user);
      await storage.setItem('userData', JSON.stringify(response.data.user));
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