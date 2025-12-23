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
    const storedToken = await storage.getItem('refreshToken');
    const storedUser = await storage.getItem('userData');

    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined' && storedUser) {
      setToken(storedToken);
      
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (parseError) {
        console.error('❌ Error parsing user data:', parseError);
        await storage.removeItem('userData');
        setUser(null);
      }
      
      try {
        const response = await userAPI.getProfile();
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
    
    const response = await authAPI.login({ email, password });
    
    const responseData: any = response.data;
    
    if (!responseData.token) {
      console.error('❌ ERROR: Token is undefined!');
      throw new Error('No authentication token received from server');
    }

    if (!responseData.user) {
      console.error('❌ ERROR: User data is undefined!');
      throw new Error('No user data received from server');
    }

    await storage.setItem('token', responseData.token);
    await storage.setItem('userData', JSON.stringify(responseData.user));
    
    setToken(responseData.accessToken);
    setUser(responseData.user);
    
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
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
      
      const response = await authAPI.register(userData);

      await storage.setItem('token', response.data.token);
      await storage.setItem('userData', JSON.stringify(response.data.user));
      
      setToken(response.data.token);
      setUser(response.data.user);
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
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
      await storage.removeItem('refreshToken');
      await storage.removeItem('userData');
      setToken(null);
      setUser(null);
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