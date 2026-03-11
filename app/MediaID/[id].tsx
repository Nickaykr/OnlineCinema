import { AVPlaybackStatus, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import Header from '../../src/components/Header';
import MoviePlayer from '../../src/components/pleer';
import SideMenu from '../../src/components/SideMenu';
import { useMediaById } from '../../src/hooks/useMedia';
import { CONFIG } from '../../src/services/constants';

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { media, loading } = useMediaById(id as string);
 
  const videoRef = useRef<Video>(null); 
  const [status, setStatus] = useState<AVPlaybackStatus | { isPlaying?: boolean }>({});
  const isVKVideo = media?.trailer_url?.includes('vk.com');
  const isWeb = Platform.OS === 'web';

  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const { width: screenWidth } = Dimensions.get('window');
  const VIDEO_WIDTH = screenWidth > 800 ? 800 : screenWidth - 40; 
  const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

  useEffect(() => {
    if (media?.seasons && media.seasons.length > 0) {
      setSelectedSeason(media.seasons[0]);
      if (media.seasons[0].episodes && media.seasons[0].episodes.length > 0) {
        setSelectedEpisode(media.seasons[0].episodes[0]);
      }
    }
  }, [media]);


  const handleMenuPress = () => {
    setIsMenuVisible(true); 
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false); 
  };
  
  const SERVER_URL = CONFIG.SERVER_URL;

  const getPosterUrl = (posterPath: string | null): string => {
    if (!posterPath) return '';
    if (posterPath.startsWith('http')) return posterPath;
    if (posterPath.startsWith('/')) return `${SERVER_URL}${posterPath}`;
    return `${SERVER_URL}/${posterPath}`;
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.container}>
        <Header title="Ошибка" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Медиа-контент не найден</Text>
        </View>
      </View>
    );
  }

   const currentVideoUrl = media.type === 'tv_series' 
    ? selectedEpisode?.video_url 
    : media.video_url;

  const currentTrailerUrl = media.type === 'tv_series'
    ? selectedSeason?.trailer_url 
    : media.trailer_url;

  const renderExternalPlayer = (url: string | null) => {
    if (!url) {
      return (
        <View style={[styles.playerPlaceholder, { height: VIDEO_HEIGHT }]}>
          <Text style={styles.noVideoText}>Видео временно недоступно</Text>
        </View>
      );
    }

    return (
      <View style={[styles.playerContainer, { height: VIDEO_HEIGHT }]}>
        {Platform.OS === 'web' ? (
          <iframe
            src={url}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
          />
        ) : (
          <WebView
            source={{ uri: url }}
            style={{ flex: 1, backgroundColor: '#000' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true} 
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title={media.title} 
        showBackButton={true}
        onMenuPress={handleMenuPress}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.heroSection,
          Platform.OS === 'web' ? styles.heroSectionWeb : styles.heroSectionMobile
        ]}>
          <Image 
            source={{ 
              uri: getPosterUrl(
                (media.type === 'tv_series' && selectedSeason?.poster_url) 
                ? selectedSeason.poster_url 
                : media.poster_url
              ) 
            }} 
            style={styles.poster}
          />
          <View style={styles.heroContent }>
            <Text style={styles.title}>
              {media.title} 
              {media.type === 'tv_series' && selectedSeason ? ` (${selectedSeason.season_number} сезон)` : ''}
            </Text>
            <View style={styles.ratingsRow}>
              <Text style={styles.rating}>
                IMDb: ⭐ {media.imdb_rating || 'N/A'}
              </Text>
              <Text style={styles.ratingSeparator}>|</Text>
              <Text style={styles.rating}>
                Кинопоиск: ⭐ {media.kinopoisk_rating || 'N/A'}
              </Text>
            </View>
  
            <Text style={styles.Origtitle}>Оригинал: {media.original_title || ' '}</Text>
            <Text style={styles.type}>
              {media.type === 'movie' ? 'Фильм' : 'Сериал'}
            </Text>
            {media.type === 'tv_series' && media.seasons && (
              <Text style={styles.type}>
                Сезонов: {media.seasons.length}
              </Text>
            )}
            {media.genres && media.genres.length > 0 && (
              <View style={styles.genresContainer}>
                <Text style={styles.genresLabel}>Жанры:</Text>
                <View style={styles.genresList}>
                  {media.genres.map((genre, index) => (
                    <View key={index} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <Text style={styles.year}>
              Год: { (media.type === 'tv_series' && selectedSeason?.release_year) 
                    ? selectedSeason.release_year 
                    : media.release_year }
            </Text>
            {media.type === 'tv_series' && selectedSeason?.episode_count && (
              <Text style={styles.type}>Серий в сезоне: {selectedSeason.episode_count}</Text>
            )}
            <Text style={styles.year}>Возрастное ограничение: {media.age_rating}</Text>
          </View>
        </View>

        {media.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{media.description}</Text>
          </View>
        )}

        <View style={[styles.videoSection, { height: VIDEO_HEIGHT }]}>
          <Text style={styles.sectionTitle}>Трейлер</Text>
          {renderExternalPlayer(currentTrailerUrl)}
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>Смотреть {media.title} онлайн</Text>
          {renderExternalPlayer(currentVideoUrl)}
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>Тест видео</Text>
          <MoviePlayer kpId="426004" />
        </View>


      </ScrollView>

      
      <SideMenu
        isVisible={isMenuVisible}
        onClose={handleCloseMenu}
      />
    </View>
  );
  
}


const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60, 
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  heroSection: {
    marginTop: Platform.OS === 'web' ? 70 : 100,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  poster: {
    width: 340,
    height: 380,
    borderRadius: 8,
    ...Platform.select({
      web: {
        marginRight: 20,
      },
      default: {
        marginRight: 0,
        marginBottom: 20,
      }
    })
  },
  heroContent: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  Origtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  year: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    color: '#ffd700',
  },
  type: {
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 24,
    color: '#ccc',
    lineHeight: 28,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingSeparator: {
    color: '#666',
    fontSize: 16,
  },
  genresContainer: {
    marginBottom: 12,
  },
  genresLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 12,
    color: '#fff',
  },
  videoSection: {
    padding: 20,
    borderTopWidth: 1,
    marginVertical: 20,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  noVideoContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  noVideoText: {
    color: '#666',
    fontSize: 16,
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 0,
  },
  controlButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  webviewContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  //Для веба
  heroSectionWeb: {
    marginTop: 70,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  // Для мобильных 
  heroSectionMobile: {
    marginTop: 100,
    flexDirection: 'column',
    padding: 20,
    alignItems: 'center',
  },
  playerContainer: {
    width: '100%',
    maxWidth: 900, 
    backgroundColor: '#000',
    borderRadius: 16, // Мягкие углы
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playerPlaceholder: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },  
});
