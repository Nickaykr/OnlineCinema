import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import Header from '../../src/components/Header';
import SideMenu from '../../src/components/SideMenu';
import { useMediaById } from '../../src/hooks/useMedia';
import { CONFIG } from '../../src/services/constants';

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { media, loading } = useMediaById(id as string);

  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);

  const { width: screenWidth } = Dimensions.get('window');
  const VIDEO_WIDTH = screenWidth > 800 ? 800 : screenWidth - 40; 
  const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

  useEffect(() => {
    if (media) {
      // Если это сериал, берем источники из эпизода, если фильм - из main_sources
      const sources = media.type === 'tv_series' 
        ? selectedEpisode?.sources 
        : media.main_sources;

      if (sources && sources.length > 0) {
        setSelectedSource(sources[0]);
      } else {
        setSelectedSource(null);
      }
    }
  }, [media, selectedEpisode]);

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

  // Фильтруем основные плееры (фильм или серия)
  const videoSources = media.type === 'tv_series' 
    ? selectedEpisode?.sources?.filter((s: any) => s.source_type !== 'trailer')
    : media.main_sources?.filter((s: any) => s.source_type !== 'trailer');

  // Фильтруем только трейлеры
  const trailerSource = media.type === 'tv_series'
    ? selectedSeason?.sources?.filter((s: any) => s.source_type === 'trailer') // Если трейлер у сезона
    : media.main_sources?.filter((s: any) => s.source_type === 'trailer');

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

  const renderSourcePicker = (sources: any[], currentSource: any, onSelect: (s: any) => void, label: string) => {
    if (!sources || sources.length <= 1) return null;

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>{label}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
          {sources.map((source, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pickerBtn, 
                currentSource?.url === source.url && styles.pickerBtnActive
              ]}
              onPress={() => onSelect(source)}
            >
              <Text style={styles.pickerBtnText}>
                {source.player_name?.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const displayTitle = (media.season_title && media.season_title.trim())
    ? `${media.main_title}: ${media.season_title}`
    : media.main_title;

  const formatDuration = (totalMinutes: number | null) => {
    if (!totalMinutes) return 'н/д'; // Если данных нет

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`;
    }

    // Если меньше часа, показываем только минуты
    return `${minutes} мин`;
};

  return (
    <View style={styles.container}>
      <Header 
        title={displayTitle} 
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
              uri: getPosterUrl(media.poster_url)
            }} 
            style={styles.poster}
          />

          <View style={styles.heroContent }>

            <Text style={styles.title}>{displayTitle} </Text>
            <Text style={styles.Origtitle}>{media.original_title || ' '}</Text>

            <View style={styles.ratingsRow}>
              <Text style={styles.rating}>
                IMDb: ⭐ {media.imdb_rating || 'N/A'}
              </Text>
              <Text style={styles.ratingSeparator}>|</Text>
              <Text style={styles.rating}>
                Кинопоиск: ⭐ {media.kinopoisk_rating || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Тип</Text>
              <Text style={styles.infoValue}>{media.type === 'movie' ? 'Фильм' : 'Сериал'}</Text>
            </View>

            {media.type === 'tv_series' && media.seasons && (
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Cезонов: </Text>
                <Text style={styles.infoValue}>{media.seasons.length}</Text>
              </View>
            )}

            {media.type === 'tv_series' && selectedSeason?.episode_count && (
              <Text style={styles.type}>Серий в сезоне: {selectedSeason.episode_count} / {}</Text>
            )}

            {/* Жанры в виде интерактивных тегов */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Жанры</Text>
              <View style={styles.genresList}>
                {media.genres?.map((genre, index) => (
                  <TouchableOpacity key={index} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Первоисточник</Text>
              <Text style={styles.infoValue}>
                {media.source_name || 'Оригинал'}
              </Text>
            </View>

            {/* Статус*/}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Статус</Text>
              <Text style={[styles.infoValue, { color: media.status === 'Вышел' ? '#ff4d4d' : '#4dff4d' }]}>
                {media.status || 'Вышел'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Год выпуска: </Text>
              <Text style={styles.infoValue}>{media.release_year}</Text>
            </View>

             <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Возрастной рейтинг</Text>
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{media.age_rating}</Text>
              </View>
            </View>

            {/* Длительность */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Длительность</Text>
              <Text style={styles.infoValue}>
                  {formatDuration(media.duration)}
                  {media.type === 'tv_series' ? ' ~ серия' : ''}
              </Text>
            </View>
            
            {/* Студия */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Студия</Text>
              <TouchableOpacity>
                  <Text style={[styles.infoValue, styles.linkText]}>{media.studio_name || 'Не указана'}</Text>
              </TouchableOpacity>
            </View>

           
          </View>
        </View>

        {media.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{media.description}</Text>
          </View>
        )}

        {trailerSource && (
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>Официальный трейлер</Text>
            {renderExternalPlayer(trailerSource.url)}
          </View>
        )}

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>
            {media.type === 'tv_series' ? `Смотреть: ${selectedEpisode?.title}` : 'Смотреть онлайн'}
          </Text>
          
          {renderSourcePicker(videoSources, selectedSource, setSelectedSource, "Выберите плеер")}

          <View style={styles.playerCenteredWrapper}>
            {selectedSource ? (
              renderExternalPlayer(selectedSource.url)
            ) : (
              <View style={styles.playerPlaceholder}>
                <Text style={styles.noVideoText}>Плееры еще не добавлены</Text>
              </View>
            )}
          </View>
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
    aspectRatio: 2 / 3,
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
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoKey: {
    color: '#888', 
    fontSize: 15,
    width: 120, 
  },
  infoValue: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  linkText: {
    color: '#ff4d4d', 
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  genreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreChipText: {
    color: '#ff4d4d',
    fontSize: 14,
  },
  ageBadge: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ageText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  Origtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    height: '50%',
    borderTopColor: '#333',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
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
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  pickerLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
  },
  pickerScroll: {
    gap: 10,
    paddingBottom: 5,
  },
  pickerBtn: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerBtnActive: {
    backgroundColor: '#e50914', 
    borderColor: '#e50914',
  },
  pickerBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playerCenteredWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
