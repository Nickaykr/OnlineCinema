import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CONFIG } from '../services/constants';
import { Media } from '../types/media.types';

interface HorizontalMediaCardProps {
    media: Media;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
}

const { width } = Dimensions.get('window');

const HorizontalMediaCard: React.FC<HorizontalMediaCardProps> = ({ media, onPress, size }) => {
  const SERVER_URL = CONFIG.SERVER_URL;

  const getPosterUrl = (posterPath: string | null): string => {
    if (!posterPath) {
      return `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(media.title)}`;
    }
    
    if (posterPath.startsWith('http')) {
      return posterPath;
    }
    
    if (posterPath.startsWith('public/')) {
      return `${SERVER_URL}/${posterPath}`;
    }
    
    if (posterPath.startsWith('/public')) {
      return `${SERVER_URL}${posterPath}`;
    }

    return `${SERVER_URL}/public/${posterPath}`;
  };

  const posterUrl = getPosterUrl(media.poster_url);

  const formatDuration = () => {
      if (media.type === 'series') {
          return media.total_seasons ? `${media.total_seasons} сезонов` : 'Сериал';
      }
      const hours = Math.floor(media.duration / 60);
      const mins = media.duration % 60;
      return hours > 0 ? `${hours}ч ${mins}м` : `${mins}мин`;
  };

  const handleWatchPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/watch/${media.media_id}`);
    }
  };

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { 
          width: width - 30, 
          height: 180 
        };
      case 'large':
        return { 
          width: width - 30, 
          height: 220 
        };
      default:
        return { 
          width: width - 30, 
          height: 200 
        };
    }
  };

  const getPosterSize = () => {
    switch (size) {
      case 'small':
        return { width: 140, height: 180 * 0.9 }; 
      case 'large':
        return { width: 160, height: 220 * 0.9 }; 
      default:
        return { width: 150, height: 200 * 0.9 };
    }
  };

  const cardSize = getCardSize();
  const posterSize = getPosterSize();

    return (
    <TouchableOpacity 
      style={[styles.card, cardSize]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.horizontalContainer}>
        
        <View style={[
          styles.posterContainer,
          { 
            width: posterSize.width,
            height: posterSize.height,
            aspectRatio: 2/3 
          }
        ]}>
          <Image 
            source={{ uri: posterUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
          
          {/* Бейджи */}
          {media.age_rating && (
            <View style={styles.ageBadge}>
              <Text style={styles.ageText}>{media.age_rating}</Text>
            </View>
          )}
          
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {media.type === 'movie' ? '🎬' : '📺'}
            </Text>
          </View>
        </View>

        {/* Контент справа */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {media.title}
            </Text>
          </View>

          {(media.imdb_rating || media.kinopoisk_rating) && (
            <View style={styles.ratingContainer}>
              {media.imdb_rating && (
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>
                    {Platform.OS === 'web' ? 'Рейтинг IMDb' : 'IMDb'}
                  </Text>
                  <Text style={styles.ratingValue}>{media.imdb_rating}</Text>
                </View>
              )}
              {media.kinopoisk_rating && (
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>
                    {Platform.OS === 'web' ? 'Рейтинг Кинопоиск' : 'КП'}
                  </Text>
                  <Text style={styles.ratingValue}>{media.kinopoisk_rating}</Text>
                </View>
              )}
            </View>
          )}

          {/* Мета-информация */}
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{media.release_year}</Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.metaText}>{formatDuration()}</Text>
          </View>

          {/* Описание */}
          <Text style={styles.description} numberOfLines={5}>
            {media.description}
          </Text>

          {/* Кнопка "Смотреть" */}
          <TouchableOpacity 
            style={styles.watchButton}
            onPress={handleWatchPress}
          >
            <Text style={styles.watchButtonText}>Смотреть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16, 
    marginBottom: Platform.OS === 'web' ? 20 : 16,
    marginTop: Platform.OS === 'web' ? 20 : 25,
    marginHorizontal: Platform.OS === 'web' ? 8 : 4, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  posterContainer: {
    position: 'relative',
    backgroundColor: '#2a2a2a',
    width: Platform.OS === 'web' ? 140 : 110, 
    aspectRatio: 2/3,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ageBadge: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 10 : 6,
    right: Platform.OS === 'web' ? 10 : 6,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: Platform.OS === 'web' ? 8 : 4,
    paddingVertical: Platform.OS === 'web' ? 4 : 2,
    borderRadius: 6,
  },
  ageText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 12 : 10, 
    fontWeight: 'bold',
  },
  typeBadge: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 10 : 25,
    right: Platform.OS === 'web' ? 10 : 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Platform.OS === 'web' ? 8 : 4,
    paddingVertical: Platform.OS === 'web' ? 4 : 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: Platform.OS === 'web' ? 12 : 10, 
  },
  content: {
    flex: 1,
    padding: Platform.OS === 'web' ? 16 : 12,
    paddingLeft: Platform.OS === 'web' ? 16 : 12, 
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 16, 
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: Platform.OS === 'web' ? 24 : 20, 
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 12 : 8, 
  },
  metaText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: '#888',
  },
  metaSeparator: {
    fontSize: Platform.OS === 'web' ? 14 : 12, 
    color: '#888',
    marginHorizontal: Platform.OS === 'web' ? 6 : 4, 
  },
  description: {
    fontSize: Platform.OS === 'web' ? 14 : 12, 
    color: '#ccc',
    lineHeight: Platform.OS === 'web' ? 20 : 16, 
    flex: 1,
    marginBottom: Platform.OS === 'web' ? 12 : 8, 
  },
  titleContainer: {
    marginBottom: Platform.OS === 'web' ? 8 : 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: Platform.OS === 'web' ? 8 : 6,
    marginTop: Platform.OS === 'web' ? 0 : 2,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Platform.OS === 'web' ? 16 : 12,
  },
  ratingLabel: {
    fontSize: Platform.OS === 'web' ? 12 : 9,
    color: '#888',
    marginRight: Platform.OS === 'web' ? 4 : 2,
  },
  ratingValue: {
    fontSize: Platform.OS === 'web' ? 14 : 11,
    marginLeft:  5,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  watchButton: {
    backgroundColor: '#6200ee',
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 8 : 6,
    minWidth: Platform.OS === 'web' ? 120 : 100,
  },
  watchButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 16 : 14, 
    fontWeight: 'bold',
  },
});

export default HorizontalMediaCard;