import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './components/Header';
import MediaCard from './components/horisontalVediaCard';
import SideMenu from './components/SideMenu';
import { useAnimation, useComingSonnMedia, useMediaByGenre, useMovies, usePopularMedia, useSeries } from './hooks/useMedia';

export default function GenreMediaScreen() {
  const { slug } = useLocalSearchParams();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(true); 
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false); 
  };


  const getMediaData = () => {
    switch (slug) {
      case 'popular':
        return usePopularMedia(50);
      case 'coming-soon':
        return useComingSonnMedia(50);
      case 'movies':
        return useMovies(50);
      case 'serial':
        return useSeries(50);
      case 'animation':
        return useAnimation(50);
      default:
        return useMediaByGenre(slug as string, 50);
    }
  };

  const { media, loading, error } = getMediaData();

  const genreTitles: { [key: string]: string } = {
    'komediya': 'Комедии',
    'popular': 'Популярные',
    'coming-soon': 'Скоро выйдет',
    'movies': 'Фильмы',
    'serial': 'Сериалы',
    'animation': 'Мультфильмы ',
  };

  const title = genreTitles[slug as string] || 'Фильмы и сериалы';

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={title}/>
        <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title={title}/>
        <Text style={styles.error}>Ошибка: {error}</Text>
      </View>
    );
  }

  return (
   <View style={styles.container}>
      <Header 
        title={title} 
        onMenuPress={handleMenuPress}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {media.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              По жанру "{title}" ничего не найдено
            </Text>
          </View>
        ) : (
          media.map(item => (
            <View key={item.media_id} style={styles.cardContainer}>
              <MediaCard media={item} size="large" />
            </View>
          ))
        )}

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
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    error: {
      color: '#ff4444',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
    },
    listContent: {
      padding: 10,
    },
    cardWrapper: {
      width: '100%',
      padding: 5,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 15,
      marginTop: 60,
      paddingBottom: 50
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
    },
    emptyText: {
      color: '#666',
      fontSize: 16,
      textAlign: 'center',
    },
    cardContainer: {
      marginBottom: 15,
    },
});