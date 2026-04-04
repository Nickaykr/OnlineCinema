export interface MediaSource {
  player_name: string;
  source_type: 'movie' | 'trailer';
  url: string;
}

export interface Media {
  media_id: string;
  title: string;
  description: string;
  type: 'movie' | 'tv_series'; 
  release_year: number;
  age_rating: string;
  duration: number;
  poster_url: string;

  main_sources?: MediaSource[];
  original_title?: string;
  total_seasons?: number;
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
  sources?: MediaSource[];
  description?: string;
  duration?: number;
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
