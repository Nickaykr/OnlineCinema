import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { adminApi } from '../../src/services/adminAPI';
import { CONFIG } from '../../src/services/constants';
import { showConfirm, showNotification } from '../../src/utils/notifications';

// Типизация для поддержки новых полей
interface UserListItem {
  user_id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  role_name: string; 
  created_at?: string; 
  last_login?: string;  
  is_banned?: boolean | number; // Статус блокировки
  subscription: {
    name: string;
    endDate: string;
    isActive: boolean;
  } | null;
}



export default function UserListScreen() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admins' | 'subscribers' | 'banned'>('all');
  
  // Новый стейт для выбора критерия сортировки
  const [sortBy, setSortBy] = useState<'created_at' | 'last_login' | 'role' | 'ban_status'>('created_at');
  const SERVER_URL = CONFIG.SERVER_URL;

  const getPosterUrl = (posterPath: string | null): string => {
    if (!posterPath) return '';
    if (posterPath.startsWith('http')) return posterPath;
    if (posterPath.startsWith('/')) return `${SERVER_URL}${posterPath}`;
    return `${SERVER_URL}/${posterPath}`;
  };


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
      showNotification("Ошибка загрузки пользователей", "error");
    }
  };

  // 1. Фильтрация пользователей по табам и поиску
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'admins') return matchesSearch && (u.role_name === 'Admin' || u.role_name === 'Менеджер');
    if (filter === 'subscribers') return matchesSearch && u.subscription?.isActive;
    if (filter === 'banned') return matchesSearch && u.is_banned;
    return matchesSearch;
  });

  // 2. Сортировка отфильтрованного массива пользователей
  const sortedAndFilteredUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'created_at') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Свежие пользователи вверху списка
    }
    
    if (sortBy === 'last_login') {
      const dateA = a.last_login ? new Date(a.last_login).getTime() : 0;
      const dateB = b.last_login ? new Date(b.last_login).getTime() : 0;
      return dateB - dateA; // Кто заходил недавно — вверху
    }
    
    if (sortBy === 'role') {
      return (a.role_name || '').localeCompare(b.role_name || '');
    }
    
    if (sortBy === 'ban_status') {
      const banA = a.is_banned ? 1 : 0;
      const banB = b.is_banned ? 1 : 0;
      return banB - banA; // Сначала заблокированные
    }
    
    return 0;
  });

  const handleRemoveSub = async (userId: number, username: string) => {
    showConfirm(
      "Подтверждение",
      `Вы уверены, что хотите отобрать подписку у ${username}?`,
      async () => {
        try {
          const res = await adminApi.removeSubscription(userId);
          if (res.success) {
            showNotification("Подписка удалена", "success");
            loadUsers();
          }
        } catch (e) {
          showNotification("Проверьте соединение с сетью", "error");
        }
      },
      "Да, отобрать"
    );
  };

  const handleGiveSub = (userId: number, username: string) => {
    if (Platform.OS === 'web') {
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
            loadUsers();
          }
        } catch (e) {
          showNotification("Ошибка при связи с сервером", "error");
        }
      },
      "Выдать"
    );
  };

  // Вспомогательная функция красивого вывода даты
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Ни разу';
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Управление пользователями</Text>
      
      {/* Кнопки фильтрации */}
      <View style={styles.filterRow}>
        {[
          { id: 'all', label: 'Все' },
          { id: 'admins', label: 'Администрация' },
          { id: 'subscribers', label: 'Премиум' },
          { id: 'banned', label: 'В бане' }
        ].map((f) => (
          <TouchableOpacity 
            key={f.id} 
            style={[styles.filterChip, filter === f.id && styles.activeChip]}
            onPress={() => setFilter(f.id as any)}
          >
            <Text style={[styles.filterText, filter === f.id && styles.activeFilterText]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Панель инструментов: Поиск + Сортировка */}
      <View style={styles.toolbar}>
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

        {/* БЛОК СОРТИРОВКИ ПОЛНОСТЬЮ СВЯЗАННЫЙ С ТЕМОЙ */}
        <View style={styles.sortWrapper}>
          <MaterialCommunityIcons name="sort-variant" size={20} color="#888" style={styles.sortIcon} />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              height: 40,
              backgroundColor: theme.card,
              color: theme.text,
              border: 'none',
              paddingLeft: 30,
              paddingRight: 10,
              fontSize: 14,
              borderRadius: 8,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="created_at">По дате регистрации</option>
            <option value="last_login">По последнему входу</option>
            <option value="role">По текущей роли</option>
            <option value="ban_status">По блокировке</option>
          </select>
        </View>
      </View>

      <FlatList
        data={sortedAndFilteredUsers}
        keyExtractor={(item: UserListItem) => item.user_id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: theme.card }]}>
            <Image 
              source={{ uri: getPosterUrl(item.avatar_url) || 'https://via.placeholder.com/50' }} 
              style={styles.avatar} 
            />
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: theme.text }]}>{item.username}</Text>
                
                {/* Кастомные бейджи для ролей (Админ или Менеджер) */}
                {item.role_name === 'Admin' && (
                  <View style={[styles.roleBadge, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                    <Text style={[styles.roleBadgeText, { color: '#FF3B30' }]}>ADMIN</Text>
                  </View>
                )}
                {item.role_name === 'Manager' && (
                  <View style={[styles.roleBadge, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
                    <Text style={[styles.roleBadgeText, { color: '#007AFF' }]}>МЕНЕДЖЕР</Text>
                  </View>
                )}
                {Boolean(item.is_banned) && (
                  <View style={[styles.roleBadge, { backgroundColor: '#333' }]}>
                    <Text style={[styles.roleBadgeText, { color: '#999' }]}>БАН</Text>
                  </View>
                )}
              </View>

              <Text style={styles.userEmail}>{item.email}</Text>
              
              {/* Вывод системных дат */}
              <Text style={styles.dateText}>Регистрация: {formatDate(item.created_at)}</Text>
              <Text style={styles.dateText}>Последний вход: {formatDate(item.last_login)}</Text>

              {/* Статус подписки */}
              <View style={[styles.statusBadge, { backgroundColor: (item.subscription && item.subscription.isActive) ? '#4CAF50' : '#333' }]}>
                <Text style={styles.statusText}>{item.subscription?.name || 'Без подписки'}</Text>
              </View>
              
              {item.subscription?.endDate && (
                <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  До: {new Date(item.subscription.endDate).toLocaleDateString()}
                </Text>
              )}
            </View>

            {/* ПРОВЕРКА РОЛИ ДЛЯ ОТОБРАЖЕНИЯ КНОПОК УПРАВЛЕНИЯ */}
            <View style={styles.actionsColumn}>
              {/* Если пользователь НЕ Админ и НЕ Менеджер, показываем кнопки управления */}
              {item.role_name !== 'Admin' && item.role_name !== 'Manager' ? (
                <View style={styles.actionsRowGap}>
                  
                  {/* КНОПКА ПОДПИСКИ (Твоя текущая логика) */}
                  {!item.subscription?.isActive ? (
                    <TouchableOpacity onPress={() => handleGiveSub(item.user_id, item.username)}>
                      <MaterialIcons name="add-moderator" size={26} color="#4CAF50" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => handleRemoveSub(item.user_id, item.username)}>
                      <MaterialIcons name="no-accounts" size={26} color="#FF3B30" />
                    </TouchableOpacity>
                  )}

                  {/* НОВАЯ КНОПКА БЛОКИРОВКИ (БАНа) */}
                  <TouchableOpacity 
                    onPress={() => {
                      showConfirm(
                        "Подтверждение",
                        `Вы уверены, что хотите ${item.is_banned ? 'разблокировать' : 'заблокировать'} пользователя ${item.username}?`,
                        async () => {
                          console.log(`Изменение статуса бана для ID: ${item.user_id}`);
                          // Здесь будет вызов adminApi.toggleBanUser(item.user_id);
                        },
                        item.is_banned ? "Разблокировать" : "Заблокировать"
                      );
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={item.is_banned ? "gavel" : "account-off-outline"} 
                      size={26} 
                      color={item.is_banned ? "#FF9500" : "#E50914"} 
                    />
                  </TouchableOpacity>

                </View>
              ) : (
                /* Если это Администрация (Админ/Менеджер) — выводим иконку щита вместо кнопок бана */
                <MaterialCommunityIcons name="shield-check" size={26} color="#007AFF" style={{ opacity: 0.8 }} />
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(120,120,120,0.15)',
  },
  activeChip: {
    backgroundColor: '#E50914',
  },
  filterText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150,150,150,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    marginLeft: 6,
    fontSize: 14,
  },
  sortWrapper: {
    flex: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  sortIcon: {
    position: 'absolute',
    left: 8,
    zIndex: 1,
    pointerEvents: 'none', // Иконка не мешает клику по селектору на вебе
  },
  userCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#333',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  actionsColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    alignSelf: 'center',
  },
  actionsRowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14, // Расстояние между кнопкой подписки и кнопкой бана
  },
});