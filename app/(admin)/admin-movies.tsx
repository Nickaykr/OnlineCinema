import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { adminApi } from '../../src/services/adminAPI';
import { Media } from '../../types/media.types';

import { router } from 'expo-router';

export default function AdminMediaList() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Media[]>([]);
  const styles = createStyles(theme);

  const renderInfoRow = (label: string, value: string | number) => (
    <Text style={styles.infoText}>
      <Text style={styles.label}>{label}: </Text>
      {value}
    </Text>
  );

  // Загружаем только основную информацию для списка
  useEffect(() => {
    adminApi.getMedia()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {/* ВЕРХНЯЯ ПАНЕЛЬ (ХЕДЕР) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Управление медиа</Text>
        </View>

        {/* КНОПКА ДОБАВИТЬ МЕДИА */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/(admin)/media/createform')} // Ссылка для перехода на создание
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Добавить</Text>
        </TouchableOpacity>
      </View>

      {/* СПИСОК МЕДИА */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.media_id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7} 
            onPress={() => router.push({ pathname: '/(admin)/media/[id]', params: { id: item.media_id } })}
          >
            <View style={styles.idBadge}>
              <Text style={styles.idText}>#{item.media_id}</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.mainTitle}>{item.title}</Text>
              
              {renderInfoRow('Оригинал', item.original_title || 'Не указано')}
              {renderInfoRow('Сезонов', item.total_seasons || 1)}
              {renderInfoRow('Анимация', item.is_animation ? 'Да' : 'Нет')}

              <View style={styles.typeTag}>
                <Text style={styles.typeText}>
                  {item.type === 'movie' ? '🎬 Фильм' : '📺 Сериал'}
                </Text>
              </View>
            </View>

            {/* ВИЗУАЛЬНАЯ КНОПКА УДАЛЕНИЯ */}
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => console.log(`Запрос на удаление медиа ID: ${item.media_id}`)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="delete-outline" size={24} color="#E50914" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    // Тени для iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Тени для Android
    elevation: 3,
  },
  idBadge: {
    backgroundColor: theme.text + '20', // Прозрачность 20% от основного цвета
    padding: 8,
    borderRadius: 8,
    marginRight: 15,
  },
  idText: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: theme.text,
    opacity: 0.9,
    marginBottom: 2,
  },
  label: {
    fontWeight: '600',
    color: theme.text,
    opacity: 0.6,
  },
  typeTag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(136, 136, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  // ДОБАВЬ ЭТИ СТИЛИ В КОНЕЦ КУСКА createStyles:
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border || 'rgba(255,255,255,0.1)',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914', // Фирменный красный цвет для кнопок создания
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});