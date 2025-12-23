import { useEffect, useState } from 'react';
import { Media } from '../../types/media.types';
import { mediaAPI, MediaFilters } from '../services/api';

// Базовый хук для общих фильтров
export const useMedia = (filters?: MediaFilters) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching media with filters:', filters);
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

  useEffect(() => {
    fetchMedia();
  }, [filters?.type, filters?.limit, filters?.search, filters?.genre, filters?.year]);

  const refetch = () => {
    fetchMedia();
  };

  return { media, loading, error, refetch };
};

// Хук для популярного контента
export const usePopularMedia = (limit: number = 20) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mediaAPI.getPopularMedia();
      
      if (response.success) {
        const limitedMedia = response.data.slice(0, limit);
        setMedia(limitedMedia);
      } else {
        setError(response.message || 'Ошибка при загрузке популярного контента');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in usePopularMedia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularMedia();
  }, [limit]);

  const refetch = () => {
    fetchPopularMedia();
  };

  return { media, loading, error, refetch };
};

// Хук для новинок
export const useNewMedia = (limit: number = 20) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mediaAPI.getNewMedia();
      
      if (response.success) {
        const limitedMedia = response.data.slice(0, limit);
        setMedia(limitedMedia);
      } else {
        setError(response.message || 'Ошибка при загрузке новинок');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in useNewMedia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewMedia();
  }, [limit]);

  const refetch = () => {
    fetchNewMedia();
  };

  return { media, loading, error, refetch };
};

// Хук для скорых релизов
export const useComingSonnMedia = (limit: number = 20) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComingSoonMedia = async () => {
    try {
      setLoading(true);
      setError(null);
     
      const response = await mediaAPI.getComingSoon();
      
      if (response.success) {
        const limitedMedia = response.data.slice(0, limit);
        setMedia(limitedMedia);
      } else {
        setError(response.message || 'Ошибка при загрузке новинок');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in useNewMedia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComingSoonMedia();
  }, [limit]);

  const refetch = () => {
    fetchComingSoonMedia();
  };

  return { media, loading, error, refetch };
};

// Универсальный хук для любого жанра
export const useMediaByGenre = (genre: string, limit: number = 20) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaByGenre = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mediaAPI.getMediaByGenre(genre, limit);
      
      if (response.success) {
        setMedia(response.data);
      } else {
        setError(response.message || `Ошибка при загрузке ${genre}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка сети');
      console.error(`Error in useMediaByGenre (${genre}):`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (genre) {
      fetchMediaByGenre();
    }
  }, [genre, limit]);

  const refetch = () => {
    fetchMediaByGenre();
  };

  return { media, loading, error, refetch };
};

// Хук для фильмов (использует специализированный метод)
export const useMovies = (limit: number = 20) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mediaAPI.getMovies(limit);
      
      if (response.success) {
        setMedia(response.data);
      } else {
        setError(response.message || 'Ошибка при загрузке фильмов');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in useMovies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [limit]);

  const refetch = () => {
    fetchMovies();
  };

  return { media, loading, error, refetch };
};

// Хук для сериалов 
export const useSeries = (limit: number = 20) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📺 Fetching series');
      const response = await mediaAPI.getSeries(limit);
      
      if (response.success) {
        setMedia(response.data);
      } else {
        setError(response.message || 'Ошибка при загрузке сериалов');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in useSeries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [limit]);

  const refetch = () => {
    fetchSeries();
  };

  return { media, loading, error, refetch };
};

// Хук для получения медиа по ID
export const useMediaById = (id: string) => {
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaById = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await mediaAPI.getMediaById(id);
      
      if (response.success) {
        setMedia(response.data);
      } else {
        setError(response.message || 'Ошибка при загрузке медиа');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in useMediaById:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaById();
  }, [id]);

  const refetch = () => {
    fetchMediaById();
  };

  return { media, loading, error, refetch };
};

// Хук для поиска
export const useSearchMedia = (query: string, limit: number = 20) => {
  return useMedia({ search: query, limit });
};

// Хук для фильтрации по году
export const useMediaByYear = (year: number, limit: number = 20) => {
  return useMedia({ year, limit });
};

// Хук для фильмов 
export const useAnimation = (limit: number = 20) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mediaAPI.getMediaByAnimations(limit);
      
      if (response.success) {
        setMedia(response.data);
      } else {
        setError(response.message || 'Ошибка при загрузке фильмов');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сети');
      console.error('Error in useMovies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [limit]);

  const refetch = () => {
    fetchMovies();
  };

  return { media, loading, error, refetch };
};
