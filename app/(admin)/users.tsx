import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { adminApi } from '../../src/services/adminAPI';
import { User } from '../../src/services/api';
import { showConfirm, showNotification } from '../../src/utils/notifications';

export default function UserListScreen() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admins' | 'subscribers'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      console.log("USERS DATA:", data);
      setUsers(data);
    } catch (e: any) {
      console.error("FULL ERROR:", e.response?.data || e.message);
      console.error("Ошибка загрузки пользователей");
    }
  };

  const filteredUsers = users.filter((u: User) => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'admins') return matchesSearch && u.is_admin;
    if (filter === 'subscribers') return matchesSearch && u.subscription?.isActive;
    return matchesSearch;
  });

  const handleRemoveSub = async (userId: number, username: string) => {
     showConfirm(
      "Подтверждение",
      `Вы уверены, что хотите отобрать подписку у ${username}?`,
      async () => {
          try {
            const res = await adminApi.removeSubscription(userId);;
            if (res.success) {
                showNotification("Подписка удалена", "success");
                loadUsers();
            }
          } catch (e) {
            showNotification("Проверьте соединение с сетью", "error");
          }
      },
      "Да, отобрать" // Текст для главной кнопки
  );
  };

  const handleGiveSub = (userId: number, username: string) => {
    if (Platform.OS === 'web') {
      // Для веба используем простой prompt для выбора ID плана
      const planId = window.prompt(
        `Выдать подписку для ${username}:\n2 - Старт (199₽)\n3 - Стандарт (399₽)\n4 - Премиум (699₽)`,
        "4"
      );
      
      if (planId && ['2', '3', '4'].includes(planId)) {
        confirmAndSend(userId, parseInt(planId), username);
      } else if (planId) {
        showNotification("Неверный ID плана", "error");
      }
    } else {
      // Для мобилок используем нативный Alert для выбора
      Alert.alert(
        "Выдать подписку",
        `Выберите тариф для ${username}`,
        [
          { text: "Отмена", style: "cancel" },
          { text: "Старт", onPress: () => confirmAndSend(userId, 2, username) },
          { text: "Стандарт", onPress: () => confirmAndSend(userId, 3, username) },
          { text: "Премиум", onPress: () => confirmAndSend(userId, 4, username) },
        ]
      );
    }
  };

  const confirmAndSend = (userId: number, planId: number, username: string) => {
    const planNames: Record<number, string> = { 2: 'Старт', 3: 'Стандарт', 4: 'Премиум' };
    
    showConfirm(
      "Подтверждение",
      `Вы действительно хотите выдать план "${planNames[planId]}" пользователю ${username}?`,
      async () => {
        try {
          const res = await adminApi.giveSubscription(userId, planId);
          if (res.success) {
            showNotification("Подписка успешно активирована", "success");
            loadUsers(); // Обновляем список
          }
        } catch (e) {
          showNotification("Ошибка при связи с сервером", "error");
        }
      },
      "Выдать"
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Пользователи</Text>
      <View style={styles.filterRow}>
        {['all', 'admins', 'subscribers'].map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterChip, filter === f && styles.activeChip]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
              {f === 'all' ? 'Все' : f === 'admins' ? 'Админы' : 'Премиум'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Поиск */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по нику или email..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item: User) => item.user_id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: theme.card }]}>
            <Image 
              source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }} 
              style={styles.avatar} 
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>{item.username}</Text>
              {item.is_admin && (
                <View style={styles.adminBadge}>
                  <MaterialIcons name="security" size={12} color="#FF3B30" />
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
              <Text style={styles.userEmail}>{item.email}</Text>
              {item.last_login && (
                <Text style={styles.lastLoginText}>
                  Вход: {new Date(item.last_login).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}

              {/* Статус подписки */}
              <View 
                style={[
                  styles.statusBadge, 
                  { 
                    // Проверяем: есть ли объект подписки И активна ли она
                    backgroundColor: (item.subscription && item.subscription.isActive) ? '#4CAF50' : '#333' 
                  }
                ]}
              >
                <Text style={styles.statusText}>
                  {/* Вытаскиваем имя из вложенного объекта */}
                  {item.subscription?.name || 'Без подписки'}
                </Text>
              </View>
              
              {/* Дополнительно: можно вывести дату окончания, если она есть */}
              {item.subscription?.endDate && (
                <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                  До: {new Date(item.subscription.endDate).toLocaleDateString()}
                </Text>
              )}
            </View>

            <View style={styles.actionsColumn}>
              {/* Если подписки нет — показываем кнопку добавления */}
              {!item.subscription?.isActive ? (
                <TouchableOpacity onPress={() => handleGiveSub(item.user_id, item.username)}>
                  <MaterialIcons name="add-moderator" size={26} color="#4CAF50" />
                </TouchableOpacity>
              ) : (
                /* Если есть — кнопку удаления (твой текущий код) */
                <TouchableOpacity onPress={() => handleRemoveSub(item.user_id, item.username)}>
                  <MaterialIcons name="no-accounts" size={26} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50
  },
  searchInput: { flex: 1, color: '#fff', marginLeft: 10 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userEmail: { fontSize: 12, color: '#888', marginBottom: 5 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  moreBtn: { padding: 10 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  activeChip: { backgroundColor: '#FF3B30' },
  filterText: { color: '#888', fontSize: 12 },
  activeFilterText: { color: '#fff', fontWeight: 'bold' },
  adminBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 59, 48, 0.1)', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4, 
    marginLeft: 8 
  },
  adminBadgeText: { color: '#FF3B30', fontSize: 9, fontWeight: 'bold', marginLeft: 4 },
  lastLoginText: { color: '#555', fontSize: 10, marginTop: 4 },
  actionsColumn: {
    width: 50, // Фиксированная ширина, чтобы контент слева не прыгал
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)', // Тонкая разделительная линия
    marginLeft: 10,
    paddingLeft: 5,
  },
});