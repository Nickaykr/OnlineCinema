import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';
import { useTheme } from '../src/context/ThemeContext';
import { mediaAPI } from '../src/services/api';
import { CONFIG } from '../src/services/constants';
import { MediaRelease } from '../types/media.types';


export default function ListsAndRatingsScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [topRated, setTopRated] = useState<MediaRelease[]>([]);
  const [mostPopular, setMostPopular] = useState< MediaRelease[]>([]);
  const [newReleases, setNewReleases] = useState< MediaRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); 
  const styles = getStyles(theme);
  
  const SERVER_URL = CONFIG.SERVER_URL;

  const handleMenuPress = () => {
    setIsMenuVisible(true); 
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false); 
  };

  useEffect(() => {
    loadData();
  }, []);
  

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [topRatedData, popularData, newReleasesData] = await Promise.all([
        mediaAPI.getPopularMedia(),
        mediaAPI.getMedia({ limit: 10 }),
        mediaAPI.getNewMedia()
      ]);

      setTopRated(topRatedData.data.slice(0, 10));
      setMostPopular(popularData.data.slice(0, 10));
      setNewReleases(newReleasesData.data.slice(0, 10));
      
    } catch (error) {
      console.error('Error loading lists and ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPosterUrl = (posterPath: string | null, title: string = ''): string => {
    console.log('🖼️ getPosterUrl called:', { posterPath, title });
    if (!posterPath) {
      return `https://via.placeholder.com/200x300/1a1a1a/ffffff?text=${encodeURIComponent(title || 'Фильм')}`;
    }
    
    if (posterPath.startsWith('http')) {
      return posterPath;
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

  const renderMediaCard = (media: MediaRelease, index: number, showRank: boolean = false) => {
    const posterUrl = getPosterUrl(media.poster_url, media.title);

    return (
      <TouchableOpacity 
        key={media.season_id} 
        style={styles.mediaCard}
        onPress={() => console.log('Open media:', media.season_id)}
      >
        {showRank && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
        )}
        <Image 
          source={{ uri: posterUrl }} 
          style={styles.mediaImage}
          onError={(e) => console.log('❌ Image load error:', media.title)}
        />
        <View style={styles.mediaContent}>
          <Text style={styles.mediaTitle} numberOfLines={2}>{media.main_title}</Text>
          <Text style={styles.mediaYear}>{media.release_year}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {media.imdb_rating|| 'N/A'}</Text>
            <Text style={styles.type}>{media.type === 'movie' ? 'Фильм' : 'Сериал'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, media: MediaRelease[], showRank: boolean = false) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>
      
      {media.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {media.map((item, index) => renderMediaCard(item, index, showRank))}
        </ScrollView>
      ) : (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>Пока нет данных</Text>
        </View>
      )}
    </View>
  );

  const renderTopList = (title: string, media: MediaRelease[]) => (
    <View style={styles.topListSection}>
      <Text style={styles.topListTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.topListScroll}
        contentContainerStyle={styles.topListScrollContent}
      >
      {media.map((item, index) => (
        <TouchableOpacity 
          key={item.media_id} 
          style={styles.topListItem}
          onPress={() => console.log('Open media:', item.media_id)}
        >
          <View style={styles.rankContainer}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <Image 
            source={{ uri: getPosterUrl(item.poster_url, item.title) }} 
            style={styles.topListImage}
          />
          <View style={styles.topListContent}>
            <Text style={styles.topListMediaTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.topListYear}>{item.release_year}</Text>
            <Text style={styles.topListRating}>⭐ {item.imdb_rating || 'N/A'}</Text>
          </View>
        </TouchableOpacity>
      ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Списки и рейтинги"
          onMenuPress={handleMenuPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Загрузка рейтингов...</Text>
        </View>
        <SideMenu
          isVisible={isMenuVisible}
          onClose={handleCloseMenu}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Списки и рейтинги"
        onMenuPress={handleMenuPress}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Рейтинги и подборки</Text>
          <Text style={styles.heroSubtitle}>
            Самые популярные фильмы и сериалы по мнению зрителей
          </Text>
        </View>

        {/* Топ-10 списки */}
        <View style={styles.topListsContainer}>
          {renderTopList("Топ-10 фильмов", topRated.slice(0, 5))}
        </View>
        <View style={styles.topListsContainer}>
          {renderTopList("Самые популярные", mostPopular.slice(0, 5))}
        </View>

        {/* Горизонтальные секции */}
        {renderSection("Лучшие по рейтингу", topRated, true)}
        {renderSection("Новинки", newReleases)}
        {renderSection("Популярные сейчас", mostPopular)}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <SideMenu
        isVisible={isMenuVisible}
        onClose={handleCloseMenu}
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.text,
    marginTop: 10,
    fontSize: 16,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'web' ? 70 : 100,
    paddingBottom: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  topListsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  topListSection: {
    flex: 1,
    marginHorizontal: 10,
  },
  topListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  topListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    marginRight: 10,
    width: 280, 
    minHeight: 90,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankNumber: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  topListImage: {
    width: 50,
    height: 70,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  topListContent: {
    flex: 1,
  },
  topListMediaTitle: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  topListYear: {
    color: theme.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  topListRating: {
    color: theme.star,
    fontSize: 12,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  seeAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  seeAllText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  horizontalScrollContent: {
    paddingRight: 20,
  },
  mediaCard: {
    width: 140,
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.accent,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rankText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
  },
  mediaContent: {
    padding: 10,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
    lineHeight: 16,
  },
  mediaYear: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: theme.star,
  },
  type: {
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  emptySection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  bottomSpace: {
    height: 20,
  },
   topListScroll: {
    flex: 1,
  },
  topListScrollContent: {
    paddingHorizontal: 5,
  },
 
});