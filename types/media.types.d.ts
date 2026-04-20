export interface MediaSource {
  player_name: string;
  source_type: string;
  type_name: string;
  url: string;
}

export interface Media {
  media_id: string;
  title: string;
  type: 'movie' | 'tv_series'; 
  seasons: Season[];
  
  source_name?: string;
  video?: MediaSource[];
  original_title?: string;
  total_seasons?: number;
  created_at?: string;
  updated_at?: string;
  genres?: string[];
  extras?: MediaExtra[];
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
  episodes: Episode[]; 
  poster_url: string;
  release_year: number;
  imdb_rating: number;
  kinopoisk_rating: number;
  age_rating: string;
  description: string;
  duration: number;
  status: string;

  title?: string;
  studio_name?: string;
  people?: Person[];
  episode_count?: number;
  average_rating?: number;
  total_votes?: number;
  user_rating?: numver; 
}

export type MediaRelease = Media & Season & {
  main_title: string;     
  season_title?: string;   
};

export interface Person {
  person_id: number;
  full_name: string;
  role_name: string; 
  photo_url: string | null;
  character_name?: string; 
}

interface MediaExtra {
  url: string;
  type_name: string; 
}

export interface MediaComment {
  id: number;
  season_id: number;
  user_id: number;
  username: string;     
  avatar_url?: string; 
  text: string;
  created_at: string;
  is_spoiler: boolean;
  rating: number;
}
