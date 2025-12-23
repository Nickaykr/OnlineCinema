import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authAPI, UpdateProfileData, User, userAPI } from '../services/api';
import { storage } from '../services/storage';

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

export let logoutFromApi: () => void = () => {};

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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    logoutFromApi = logout;
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, []);

const loadStoredAuth = async (): Promise<void> => {
  try {
    const accessToken = await storage.getSecureItem('accessToken');
    const storedUser = await storage.getItem('userData');

      if (accessToken && storedUser) {
        setUser(JSON.parse(storedUser));
        
        try {
          const response = await userAPI.getProfile();
          setUser(response.data.user);
          await storage.setItem('userData', JSON.stringify(response.data.user));
        } catch (error) { 
          console.log('Profile fetch failed, waiting for interceptor');
        }
      }
  } catch (error) {
    console.error('Error loading auth:', error);
  } finally {
    setIsLoading(false);
  }

};

const login = async (email: string, password: string): Promise<void> => {
  try {
    setIsLoading(true);
    
    const response = await authAPI.login({ email, password });
    const { accessToken, refreshToken, user: userData } = response.data;
  
    await storage.setSecureItem('accessToken', accessToken);
    await storage.setSecureItem('refreshToken', refreshToken);
    await storage.setItem('userData', JSON.stringify(userData));

    setUser(userData);
   
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};

const register = async (userData: any): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      const { accessToken, refreshToken, user: regUser } = response.data;

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
      await authAPI.logout(); 
    } catch (e) {}
    
    await storage.removeSecureItem('accessToken');
    await storage.removeSecureItem('refreshToken');
    await storage.removeItem('userData');
    setUser(null);
  };

  const updateUser = async (userData: UpdateProfileData): Promise<void> => {
    const response = await userAPI.updateProfile(userData);
    setUser(response.data.user);
    await storage.setItem('userData', JSON.stringify(response.data.user));
  };

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