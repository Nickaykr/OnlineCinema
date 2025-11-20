export interface Media {
  media_id: string;
  title: string;
  description: string;
  type: 'movie' | 'series'; 
  release_year: number;
  age_rating: string;
  duration: number;
  poster_url: string;
  
  original_title?: string;
  total_seasons?: number;
  background_url?: string;
  trailer_url?: string;
  imdb_rating?: number;
  kinopoisk_rating?: number;
  created_at?: string;
  updated_at?: string;
  genre?: string;
  genres?: string[];
}
