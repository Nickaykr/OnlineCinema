export interface Media {
  media_id: string;
  title: string;
  description: string;
  type: 'movie' | 'tv_series'; 
  release_year: number;
  age_rating: string;
  duration: number;
  poster_url: string;
  
  original_title?: string;
  total_seasons?: number;
  video_url?: string;
  trailer_url?: string;
  imdb_rating?: number;
  kinopoisk_rating?: number;
  created_at?: string;
  updated_at?: string;
  genres?: string[];
  seasons?: Season[];
}

export interface Episode {
  episode_id: number;
  season_id: number;
  episode_number: number;
  title: string;
  description?: string;
  duration?: number;
  video_url: string; 
  preview_image?: string;
  release_date?: string;
}

export interface Season {
  season_id: number;
  media_id: number;
  season_number: number;
  title?: string;
  description?: string;
  release_year?: number;
  episode_count?: number;
  poster_url?: string;
  trailer_url?: string;
  episodes: Episode[]; 
}
