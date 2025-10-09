import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

export default function MainScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/'); 
  };

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
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Все</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.popularScroll}
          >
          
          </ScrollView>
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
    paddingTop: '5%'
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  popularSection: {
    backgroundColor: '#2a1a45', 
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
  seeAllText: {
    color: '#bb86fc',
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
  movieImage: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  movieEmoji: {
    fontSize: 40,
  },
  movieTitle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
    height: 40,
  },
  movieInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  movieYear: {
    color: '#ccc',
    fontSize: 12,
  },
  movieRating: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
  },

  regularSection: {
    backgroundColor: '#1a1a1a', 
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  comingSoon: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});