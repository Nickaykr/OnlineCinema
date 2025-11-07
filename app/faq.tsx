// screens/FAQScreen.tsx
import React, { useState } from 'react';
import {
    Image,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import { faqData } from './data/faqData';
import { FAQCategory, FAQItem } from './types/faq';

// Включение анимации для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const handleMenuPress = () => setIsMenuVisible(true);
  const handleCloseMenu = () => setIsMenuVisible(false);

  const toggleCategory = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedQuestion(null);
  };

  const toggleQuestion = (questionId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const renderQuestion = (question: FAQItem) => (
    <TouchableOpacity
      key={question.id}
      style={styles.questionItem}
      onPress={() => toggleQuestion(question.id)}
    >
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.expandIcon}>
          {expandedQuestion === question.id ? '−' : '+'}
        </Text>
      </View>
      {expandedQuestion === question.id && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{question.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCategory = (category: FAQCategory) => (
    <View key={category.id} style={styles.categoryContainer}>
      <TouchableOpacity
        style={[styles.categoryHeader, { backgroundColor: category.color }]}
        onPress={() => toggleCategory(category.id)}
      >
        <View style={styles.categoryTitleContainer}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        <Text style={styles.expandIcon}>
          {expandedCategory === category.id ? '−' : '+'}
        </Text>
      </TouchableOpacity>

      {expandedCategory === category.id && (
        <View style={styles.categoryContent}>
          <Image 
            source={category.image} 
            style={styles.categoryImage}
            resizeMode="cover"
          />
          <View style={styles.questionsList}>
            {category.questions.map(renderQuestion)}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Частые вопросы" onMenuPress={handleMenuPress} />

      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Часто задаваемые вопросы</Text>
        <Text style={styles.subtitle}>
          Найдите ответы на самые популярные вопросы о нашем сервисе
        </Text>

        <View style={styles.categoriesList}>
          {faqData.map(renderCategory)}
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
    paddingHorizontal: Platform.select({
      web: 40,
      ios: 20,
      android: 20,
      default: 20
    }),
  },
  mainTitle: {
    fontSize: Platform.select({
      web: 32,
      ios: 28,
      android: 28,
      default: 28
    }),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Platform.select({
      web: 18,
      ios: 16,
      android: 16,
      default: 16
    }),
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  categoriesList: {
    marginBottom: 30,
  },
  categoryContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.select({
      web: 20,
      ios: 18,
      android: 18,
      default: 18
    }),
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: Platform.select({
      web: 20,
      ios: 18,
      android: 18,
      default: 18
    }),
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  categoryContent: {
    padding: 0,
  },
  categoryImage: {
    width: '100%',
    height: Platform.select({
      web: 200,
      ios: 150,
      android: 150,
      default: 150
    }),
  },
  questionsList: {
    padding: Platform.select({
      web: 20,
      ios: 15,
      android: 15,
      default: 15
    }),
  },
  questionItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.select({
      web: 16,
      ios: 14,
      android: 14,
      default: 14
    }),
  },
  questionText: {
    fontSize: Platform.select({
      web: 16,
      ios: 15,
      android: 15,
      default: 15
    }),
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  answerContainer: {
    padding: Platform.select({
      web: 16,
      ios: 14,
      android: 14,
      default: 14
    }),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  answerText: {
    fontSize: Platform.select({
      web: 15,
      ios: 14,
      android: 14,
      default: 14
    }),
    color: '#ccc',
    lineHeight: 20,
  },
});