import { useCallback, useEffect, useState } from 'react';
import { UpdateProfileData, User, userAPI } from '../services/api';
import { storage } from '../services/storage';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUser: (userData: UpdateProfileData) => Promise<User>;
}

const getMockStats = () => ({
  moviesWatched: 145,
  hoursWatched: 320,
  favoriteGenres: 5
});

export const useUser = (): UseUserReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const refreshToken = await storage.getItem('refreshToken');
            console.log('🔐 Refresh token check:', !!refreshToken);
            
            if (!refreshToken) {
                throw new Error('No authentication token found. Please login again.');
            }
            
            const response = await userAPI.getProfile();
            console.log('✅ User data loaded successfully');
            setUser(response.data.user);
        } catch (err: any) {
            console.error('❌ Failed to load user:', err);
            
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(errorMessage);
            
            if (err.response?.status === 401) {
                await storage.removeItem('refreshToken');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (userData: UpdateProfileData) => {
        try {
        const response = await userAPI.updateProfile(userData);
        const updatedUser = response.data.user;
        setUser(updatedUser);
        return updatedUser; 
        } catch (err) {
        console.error('Failed to update user:', err);
        throw err;
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return {
        user,
        loading,
        error,
        refreshUser: loadUser,
        updateUser,
    };
};