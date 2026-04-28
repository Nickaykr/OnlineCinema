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
      <FlatList
        data={data}
        keyExtractor={(item) => item.media_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7} 
            onPress={() => router.push({ pathname: '/(admin)/media/[id]', params: { id: item.media_id } 
            })}>
           
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
});