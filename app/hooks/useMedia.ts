import { useEffect, useState } from 'react';
import { mediaAPI, MediaFilters } from '../services/api';
import { Media } from '../types/media.types';

export const useMedia = (filters?: MediaFilters) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [filters?.type, filters?.limit, filters?.search]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mediaAPI.getMedia(filters);
      
      if (response.success) {
        setMedia(response.data);
      } else {
        setError(response.message || 'Ошибка при загрузке медиа');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in useMedia:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchMedia();
  };

  return { media, loading, error, refetch };
};

export const useNewMedia = (limit: number = 20) => {
  return useMedia({ limit });
};

export const useMovies = (limit: number = 20) => {
  return useMedia({ type: 'movie', limit });
};

export const useSeries = (limit: number = 20) => {
  return useMedia({ type: 'series', limit });
};
