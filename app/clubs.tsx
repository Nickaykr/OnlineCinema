import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';
import { useTheme } from '../src/context/ThemeContext';
import { CinemaClub, cinemaClubsAPI } from '../src/services/api';
import { CONFIG } from '../src/services/constants';

export default function CinemaClubsScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [sections, setSections] = useState<{
    genres: CinemaClub[];
    directors: CinemaClub[];
    moods: CinemaClub[];
    seasonal: CinemaClub[];
    trending: CinemaClub[];
  } | null>(null);
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
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const data = await cinemaClubsAPI.getClubSections();
      setSections(data);
    } catch (error) {
      console.error('Error loading cinema clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для исправления URL изображений киноклубов
  const getClubCoverUrl = (coverPath: string | null, clubTitle: string = ''): string => {
    if (!coverPath) {
      return `https://via.placeholder.com/300x200/1a1a1a/ffffff?text=${encodeURIComponent(clubTitle || 'Киноклуб')}`;
    }
    
    if (coverPath.startsWith('http')) {
      return coverPath;
    }
    
    const cleanPath = coverPath.startsWith('/') ? coverPath.slice(1) : coverPath;
    return `${SERVER_URL}/${cleanPath}`;
  };

  const getIcon = (type: string) => {
    const icons = {
      genre: '🎭',
      director: '👨‍🎨', 
      mood: '🎯',
      seasonal: '📅',
      trending: '🔥'
    };
    return icons[type as keyof typeof icons] || '🎬';
  };

  const renderClubCard = (club: CinemaClub) => {
    const coverUrl = getClubCoverUrl(club.cover_image, club.title);
    
    return (
      <TouchableOpacity 
        key={club.club_id} 
        style={styles.clubCard}
        onPress={() => {
          console.log('Open club:', club.club_id);
        }}
      >
        <Image 
          source={{ uri: coverUrl }} 
          style={styles.clubImage}
          defaultSource={require('../assets/images/placeholder.jpg')} 
          onError={(e) => console.log('❌ Image load error for club:', club.title, 'URL:', coverUrl)}
          onLoad={() => console.log('✅ Image loaded for club:', club.title)}
        />
        <View style={styles.clubContent}>
          <Text style={styles.clubTitle} numberOfLines={2}>{club.title}</Text>
          <Text style={styles.clubDescription} numberOfLines={2}>
            {club.description}
          </Text>
          <View style={styles.clubFooter}>
            <Text style={styles.mediaCount}>{club.media_count} фильмов</Text>
            <View style={styles.watchButton}>
              <Text style={styles.watchButtonText}>Смотреть</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, clubs: CinemaClub[], type: string) => (
    <View style={styles.section} key={type}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionIcon}>{getIcon(type)}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>
      
      {clubs.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {clubs.map(renderClubCard)}
        </ScrollView>
      ) : (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>Пока нет киноклубов</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Киноклубы"
          onMenuPress={handleMenuPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Загрузка киноклубов...</Text>
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
        title="Киноклубы"
        onMenuPress={handleMenuPress}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Киноклубы</Text>
          <Text style={styles.heroSubtitle}>
            Тематические подборки фильмов и сериалов для любого настроения
          </Text>
        </View>

        {sections && (
          <>
            {renderSection("Жанровые киноклубы", sections.genres, "genre")}
            {renderSection("Режиссерские коллекции", sections.directors, "director")}
            {renderSection("Под настроение", sections.moods, "mood")}
            {renderSection("Сезонные подборки", sections.seasonal, "seasonal")}
            {renderSection("Обсуждаемые сейчас", sections.trending, "trending")}
          </>
        )}

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
    paddingTop: Platform.OS === 'web' ? 50 : 100,
    paddingBottom: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    flex: 1,
  },
  seeAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: theme.backgroundSecondary,
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
  clubCard: {
    width: 280,
    marginRight: 15,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  clubImage: {
    width: '100%',
    height: 160,
    backgroundColor: theme.backgroundSecondary,
  },
  clubContent: {
    padding: 12,
  },
  clubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  clubDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaCount: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  watchButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  watchButtonText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '500',
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
});