import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from './components/Header';
import SideMenu from './components/SideMenu';

export default function MainScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(true); 
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false); 
  };

  return (
    <View style={styles.container}>

      <Header
        title="О нас"
        onMenuPress={handleMenuPress}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.heroTitle}>Информация о приложениии</Text>
        <Text style={styles.heroSubtitle}>Переосмысливаем опыт просмотра кино. Вместе.</Text>
        <Text style={styles.text}>Обычный онлайн-кинотеатр заканчивается на кнопке «play». Наш — только начинается.</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/nas.jpg')} 
            style={styles.contentImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.text}>#КиноБанда — это эксперимент по созданию идеальной платформы для киноманов XXI века. 
          Мы объединили мощную стриминговую технологию с глубиной социальной сети, чтобы дать вам три ключевых ощущения:</Text>
        <Text style={styles.text}>Причастность. Вы не просто зритель. Вы — критик, куратор, первооткрыватель и друг. 
          Ваше мнение формирует общие тренды и помогает другим находить шедевры.</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/nas1.jpg')} 
            style={styles.contentImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.text}>Открытие. Наши алгоритмы и сообщество помогут вам откопать те сокровища, 
          которые вы бы никогда не нашли в одиночку. От забытого арт-хауса 70-х до главного хита сезона.</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/nas2.jpg')} 
            style={styles.contentImage}
            resizeMode="contain"
          />
        </View>
         <Text style={styles.text}>Вовлеченность. Киноклубы, списки, совместные просмотры — все это создает живой, 
          пульсирующий организм, а не просто архив видеоконтента.</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/nas3.jpg')} 
            style={styles.contentImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.heroTitle}>Мы не просто транслируем фильмы. Мы строим культуру.</Text>
        <View style={styles.buttonContainer}> 
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/faq')} 
          >
            <Text style={styles.buttonText}>Есть Вопросы? Тут ответы</Text>
          </TouchableOpacity>
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
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: Platform.OS === 'web' ? 30 : 100,
    marginTop: Platform.OS === 'web' ? 70 : 100,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 24,
    color: '#fff',
    marginLeft: Platform.OS === 'web' ? 30 : 100,
  },
  text: {
    fontSize: 22,
    color: '#fff',
    marginLeft: Platform.OS === 'web' ? 30 : 100,
    marginTop: Platform.OS === 'web' ? 30 : 100,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  contentImage: {
    width: Platform.select({
      web: 400,
      ios: 300,
      android: 300,
      default: 300
    }),
    height: Platform.select({
      web: 250,
      ios: 200,
      android: 200,
      default: 200
    }),
    borderRadius: 10,
  },
  buttonContainer: {
    alignItems: 'center', 
    marginVertical: 30,
  },
  button: {
    backgroundColor: '#e50914',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.select({
      web: 300,
      ios: 250,
      android: 250,
      default: 250
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: Platform.select({
      web: 16,
      ios: 16,
      android: 16,
      default: 16
    }),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});