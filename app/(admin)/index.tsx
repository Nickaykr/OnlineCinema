import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const router = useRouter();

  const menuItems = [
    { title: 'Статистика', icon: '📊', route: '/(admin)/stats', count: '154 юзера' },
    { title: 'Промокоды', icon: '🎟️', route: '/(admin)/promos', count: '5 активных' },
    { title: 'Медиа', icon: '🎬', route: '/(admin)/movies', count: '120 позиций' },
    { title: 'Пользователи', icon: '👥', route: '/(admin)/users', count: 'Управление' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Обзор системы</Text>
      
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push(item.route)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  icon: { fontSize: 30, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },
});