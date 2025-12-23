import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import Header from '../../src/components/Header';
import SideMenu from '../../src/components/SideMenu';
import { useMediaById } from '../../src/hooks/useMedia';
import { CONFIG } from '../../src/services/constants';

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { media, loading } = useMediaById(id as string);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const videoRef = useRef<Video>(null); 
  const [status, setStatus] = useState<AVPlaybackStatus | { isPlaying?: boolean }>({});
  const isVKVideo = media?.trailer_url?.includes('vk.com');
  const isWeb = Platform.OS === 'web';

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
        <Header title="Фильм не найден" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Фильм не найден</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={media.title} 
        showBackButton={true}
        onMenuPress={handleMenuPress}
      />
      
      <ScrollView style={styles.content}>
        <View style={[
          styles.heroSection,
          Platform.OS === 'web' ? styles.heroSectionWeb : styles.heroSectionMobile
        ]}>
          <Image 
            source={{ uri: getPosterUrl(media.poster_url) }} 
            style={styles.poster}
          />
          <View style={styles.heroContent }>
            <Text style={styles.title}>{media.title}</Text>
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
            <Text style={styles.year}>Год выпуска: {media.release_year}</Text>
            <Text style={styles.year}>Возрастное ограничение: {media.age_rating}</Text>
          </View>
        </View>

        {media.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{media.description}</Text>
          </View>
        )}

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>Трейлер</Text>
          
          {isVKVideo && media.trailer_url ? (
            isWeb ? (
              // Для Web - используем iframe
              <iframe 
                src={media.trailer_url}
                style={styles.iframe}
                allowFullScreen
              />
            ) : (
              // Для мобильных - WebView
              <View style={styles.webviewContainer}>
                <WebView
                  source={{ uri: media.trailer_url }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsFullscreenVideo={true}
                />
              </View>
            )
          ) : media?.trailer_url ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: media.trailer_url }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Text style={styles.noVideoText}>Трейлер недоступен</Text>
            </View>
          )}
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>Смотреть {media.title} онлайн</Text>
          
          {isVKVideo && media.trailer_url ? (
            isWeb ? (
              // Для Web - используем iframe
              <iframe 
                src={media.background_url}
                style={styles.iframe}
                allowFullScreen
              />
            ) : (
              // Для мобильных - WebView
              <View style={styles.webviewContainer}>
                <WebView
                  source={{ uri: media.background_url! }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsFullscreenVideo={true}
                />
              </View>
            )
          ) : media?.trailer_url ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: media.trailer_url }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Text style={styles.noVideoText}>Трейлер недоступен</Text>
            </View>
          )}
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
    borderTopColor: '#333',
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
  iframe: {
    width: '100%',
    height: 250,
    borderRadius: 8,
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
  
});
