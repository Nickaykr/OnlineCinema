import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
// import { useComingSonnMedia, useMediaByGenre, usePopularMedia } from './hooks/useMedia';

export default function MainScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleSeeAll = (category: string, title: string) => {
    router.push(`/${category}?title=${encodeURIComponent(title)}`);
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true); 
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false); 
  };

  return (
    <View style={styles.container}>

      <Header
        title="Аккаунт"
        onMenuPress={handleMenuPress}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.heroTitle}>Каталог фильмов и сериалов</Text>
        <Text style={styles.heroSubtitle}>Откройте для себя тысячи произведений со всего мира</Text>
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
    alignItems: 'flex-start', 
    marginBottom: 15,
    paddingHorizontal: 5,
    maxWidth: '100%',
  },
  titleContainer: {
    flex: 1,
    marginRight: 15, 
    justifyContent: 'center',
    maxWidth: '80%',
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: Platform.OS === 'web' ? 28 : 24, 
  },
  seeAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, 
    flexGrow: 0,
  },
  seeAllText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 20 : 15,
    fontWeight: '500',
  },
  popularScroll: {
    paddingLeft: 5,
    paddingRight: 20,
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
    width: '48%',
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
});