// import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from './components/Header';
import MediaCard from './components/MedisCard';
import { useMovies, useNewMedia } from './hooks/useMedia';
import { Media } from './types/media.types';

export default function MainScreen() {
  const [popularMedia, setPopularMedia] = useState<Media[]>([]);
  const { media: movies, loading: moviesLoading, error: moviesError } = useMovies(10);
  const { media: newMedia, loading: newMediaLoading } = useNewMedia(10);

  return (
    <View style={styles.container}>

      <Header
        title="Главная"
        showSearch={true}
        showProfile={true}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.heroTitle}>Добро пожаловать в мир кино!</Text>
        <Text style={styles.heroSubtitle}>Тысячи фильмов и сериалов</Text>

        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сейчас популярно</Text>
            <TouchableOpacity 
             // onPress={() => router.push('/popular')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>Все</Text>
            </TouchableOpacity>
          </View>

          {newMediaLoading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.popularScroll}
            >
              {newMedia.map(item => (
                <View key={item.media_id} style={styles.cardWrapper}>
                  <MediaCard media={item} />
                </View>
              ))}
              {newMedia.length === 0 && (
                <Text style={styles.emptyText}>Нет популярных фильмов</Text>
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>
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
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: Platform.OS === 'web' ? 70 : 100,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  popularSection: {
    backgroundColor: '#2e2b2bff', 
    marginVertical: 20,
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
    seeAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  popularScroll: {
    paddingLeft: 5,
  },
  movieCard: {
    width: 140,
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  cardWrapper: {
    marginRight: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  gridCard: {
    width: '48%', // 2 колонки
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontStyle: 'italic',
    fontSize: 14,
  },
  bottomSpace: {
    height: 20,
  },
   debugButton: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
});