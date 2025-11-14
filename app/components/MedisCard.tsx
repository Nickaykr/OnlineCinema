import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Media } from '../../types/media.types';
import { CONFIG } from '../services/constants';

interface MediaCardProps {
    media: Media;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
}

const { width } = Dimensions.get('window');

const MovieCard: React.FC<MediaCardProps> = ({ media, onPress, size }) => {
  const SERVER_URL = CONFIG.SERVER_URL;
  const ASPECT_RATIO = 1.5;

  const getPosterUrl = (posterPath: string | null): string => {
    if (!posterPath) {
      return `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(media.title)}`;
    }
    
    // Если путь уже полный URL
    if (posterPath.startsWith('http')) {
      return posterPath;
    }
    
    if (posterPath.startsWith('public/')) {
      return `${SERVER_URL}/${posterPath}`;
    }
    
    // Если путь начинается с /public
    if (posterPath.startsWith('/public')) {
      return `${SERVER_URL}${posterPath}`;
    }

    // Для любых других случаев
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

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { 
          width: 100,  
          height: 150  
        };
      case 'large':
        return { 
          width: width - 40, 
          height: (width - 40) * ASPECT_RATIO 
        };
      default:
        return { 
          width: 140,  
          height: 210  
        };
    }
  };

  const cardSize = getCardSize();

  const posterHeight = cardSize.height;

  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardSize.width }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
    {/* Постер с бейджами */}
    <View style={styles.posterContainer}>

      <View style={styles.imageBackground}>
        <Image 
          source={{ uri: posterUrl }}
          style={[styles.poster, { height: posterHeight }]}
          resizeMode="cover"
        />
      </View>

      {/* Бейдж возрастного рейтинга */}
      {media.age_rating && (
        <View style={styles.ageBadge}>
        < Text style={styles.ageText}>{media.age_rating}</Text>
        </View>
        )}

      {/* Бейдж типа контента */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>
        {media.type === 'movie' ? '🎬' : '📺'}
        </Text>
      </View>
    </View>

    {/* Контент */}
    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={2}>
        {media.title}
      </Text>

      {/* Мета-информация */}
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>{media.release_year}</Text>
        <Text style={styles.metaSeparator}>•</Text>
        <Text style={styles.metaText}>{formatDuration()}</Text>
      </View>

      {size !== 'small' && (
      <Text style={styles.description} numberOfLines={3}>
        {media.description}
      </Text>
      )}
    </View>
  </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  posterContainer: {
    position: 'relative',
    backgroundColor: '#2a2a2a',
    aspectRatio: 2/3,
  },
  poster: {
    width: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  ageText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 18,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 4,
  },
  description: {
    fontSize: 11,
    color: '#ccc',
    lineHeight: 14,
  },
  ratingBar: {
    marginTop: 8,
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  ratingFill: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 10,
  },
  ratingBarText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default MovieCard;