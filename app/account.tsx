import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator, Image,
  Platform,
  RefreshControl,
  ScrollView, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useUser } from '../src/hooks/userAPI';
import { userAPI } from '../src/services/api';
import { authEvents } from '../src/services/authEvents';
import { CONFIG } from '../src/services/constants';


const SERVER_URL = CONFIG.SERVER_URL;

const getPosterUrl = (posterPath: string | null): string => {
  if (!posterPath) return '';
  if (posterPath.startsWith('http')) return posterPath;
  if (posterPath.startsWith('/')) return `${SERVER_URL}${posterPath}`;
  return `${SERVER_URL}/${posterPath}`;
};

// Компонент для аватара по умолчанию
const DefaultAvatar = ({ size = 80, name }: { size?: number; name?: string }) => {
    const { theme } = useTheme(); 
    const styles = getStyles(theme);
    
    return (
      <View style={[styles.defaultAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="person" size={size * 0.4} color="#fff" />
      </View>
    );
}

// Компонент для отображения аватара
const UserAvatar = ({ user, size = 80 }: { user: any; size?: number }) => {
  const { theme } = useTheme(); 
  const styles = getStyles(theme);

  if (user?.avatar_url) {
    return (
      <Image
        source={{uri: getPosterUrl(user.avatar_url) }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        onError={(e) => {
          console.log('Failed to load avatar image, using default');
        }}
      />
    );
  }
  
  return <DefaultAvatar size={size} name={user?.username} />;
};

const AccountScreen: React.FC = () => {
  const [isMenuVisible, setIsMenuVisible] = React.useState<boolean>(false);
  const { user, loading, error, refreshUser, updateUser } = useUser();
  const { logout } = useAuth();
  const { theme } = useTheme(); 
  const styles = getStyles(theme);

  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editForm, setEditForm] = React.useState({
    username: '',
    country: '',
    date_of_birth: ''
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeStatusId, setActiveStatusId] = React.useState<number>(1);
  // Стейт для хранения элементов текущего списка
  const [listItems, setListItems] = React.useState<any[]>([]);
  const [isListLoading, setIsListLoading] = React.useState<boolean>(false);

  const statusTabs = [
    { id: 1, name: 'В процессе', icon: 'eye-outline' },
    { id: 2, name: 'Просмотрено', icon: 'bookmark' },
    { id: 3, name: 'На потом', icon: 'clock-outline' },
    { id: 4, name: 'Не подошло', icon: 'eye-off-outline' },
    { id: 5, name: 'В планах', icon: 'calendar-clock' },
    { id: 6, name: 'Повтор',  icon: 'replay' },
  ];

  const getTabCount = (statusId: number) => {
    if (!user?.lists_counts) return 0;
    const found = user.lists_counts.find((c: any) => c.status_id === statusId);
    return found ? found.count : 0;
  };

  useEffect(() => {
    const fetchListElements = async () => {
      setIsListLoading(true);
      try {
        
        const response = await userAPI.getListElements(activeStatusId);
        console.log("Ответ от API для списка:", response);
        if (response.success) {
          setListItems(response.data);
        }
      } catch (err) {
        console.error("Ошибка загрузки элементов списка:", err);
      } finally {
        setIsListLoading(false);
      }
    };

    if (user) {
      fetchListElements();
    }
  }, [activeStatusId, user]);

  const handleMenuPress = () => setIsMenuVisible(true);
  const handleCloseMenu = () => setIsMenuVisible(false);
  const handleEditPress = () => {
    setEditForm({
      username: user?.username || '',
      country: user?.country || '',
      date_of_birth: user?.date_of_birth ? user.date_of_birth.split('T')[0] : ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Вызываем метод твоего кастомного хука, который отправляет PUT /profile
      await updateUser({
        username: editForm.username,
        country: editForm.country,
        date_of_birth: editForm.date_of_birth
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Ошибка при обновлении профиля на фронте:", err);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      console.log('Выбор фото на мобилке (в будущем через ImagePicker)');
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      
      if (user) {
        user.avatar_url = localUrl;
        await refreshUser(); 
      }
    }
  };

  const onRefresh = async () => {
    await refreshUser();
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Не указано';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  const subInfo = user?.subscription;

  if (loading && !user) {
    return (
      <View style={styles.container}>
        <Header title="Профиль" onMenuPress={handleMenuPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Загрузка профиля...</Text>
        </View>
      </View>
    );
  }

  if (error && !user) {
  // Проверяем, критическая ли это ошибка авторизации
    const isAuthError = error.includes('token') || error.includes('login');

    return (
      <View style={styles.container}>
        <Header title="Профиль" onMenuPress={handleMenuPress} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {isAuthError ? "Сессия истекла" : "Ошибка загрузки"}
          </Text>
          <Text style={styles.errorDescription}>{error}</Text>
          
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => isAuthError ? authEvents.logout() : refreshUser()}
          >
            <Text style={styles.retryButtonText}>
              {isAuthError ? "Войти заново" : "Повторить попытку"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Профиль" onMenuPress={handleMenuPress} />

      {Platform.OS === 'web' && (
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange}
        />
      )}

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
      >
      
        <View style={styles.content}>
          {/* Аватар и основная информация */}
    
          <View style={styles.avatarSection}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleAvatarPress} style={{ position: 'relative' }}>
              <UserAvatar user={user} size={80} />
              <View style={styles.cameraBadge}>
                <MaterialIcons name="photo-camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>
                {user?.username || 'Пользователь'}
              </Text>
              <Text style={styles.userSince}>
                C нами c {user?.created_at ? formatDate(user.created_at) : 'недавнего времени'} 
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.logoutIconButton} 
              onPress={logout} 
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.subscriptionBar}>
            <View style={styles.infoGroup}>
                <MaterialIcons name="card-membership" size={24} color={theme.accent} />
                <View style={styles.textContainer}>
                    <Text style={styles.planText}>Тариф: {subInfo?.plan || 'Пробный'}</Text>
                    {subInfo?.isActive ? (
                        <Text style={styles.statusActive}>
                            Активен до: {new Date(subInfo.endDate).toLocaleDateString()}
                        </Text>
                    ) : (
                        <Text style={styles.statusInactive}>Подписка не активна</Text>
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.buyButton} onPress={() => router.push('/subBuy')}>
                <Text style={styles.buyButtonText}>
                    {subInfo?.isActive ? "Продлить" : "Купить"}
                </Text>
            </TouchableOpacity>
           
          </View>

          {/* Детальная информация */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Личная информация</Text>
            
            {/* СТРОКА: ИМЯ */}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Имя пользователя</Text>
              {isEditing ? (
                <TextInput 
                  style={[styles.infoInput, { color: theme.text }]} 
                  value={editForm.username}
                  onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                />
              ) : (
                <Text style={styles.infoValue}>{user?.username || 'Не указано'}</Text>
              )}
            </View>

            {/* СТРОКА: СТРАНА */}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Страна</Text>
              {isEditing ? (
                <TextInput 
                  style={[styles.infoInput, { color: theme.text }]} 
                  value={editForm.country}
                  onChangeText={(text) => setEditForm({ ...editForm, country: text })}
                />
              ) : (
                <Text style={styles.infoValue}>{user?.country || 'Не указана'}</Text>
              )}
            </View>

            {/* СТРОКА: ДАТА РОЖДЕНИЯ */}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Дата рождения</Text>
              {isEditing ? (
                Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={editForm.date_of_birth}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    className="custom-web-datepicker" // Стили для этого инпута пропишем ниже
                  />
                ) : (
                  <TouchableOpacity 
                    style={styles.datePickerButton} 
                    onPress={async () => {
                      if (Platform.OS === 'android') {
                        const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
                        DateTimePickerAndroid.open({
                          value: editForm.date_of_birth ? new Date(editForm.date_of_birth) : new Date(),
                          onChange: (event: any, selectedDate?: Date) => {
                            if (selectedDate) {
                              setEditForm({ ...editForm, date_of_birth: selectedDate.toISOString().split('T')[0] });
                            }
                          },
                          mode: 'date',
                          is24Hour: true,
                        });
                      }
                    }}
                  >
                    <Text style={{ color: editForm.date_of_birth ? theme.text : '#666', fontSize: 16 }}>
                      {editForm.date_of_birth ? formatDate(editForm.date_of_birth) : 'Выбрать дату'}
                    </Text>
                    <MaterialIcons name="calendar-today" size={16} color={theme.textSecondary} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                )
              ) : (
                <Text style={styles.infoValue}>
                  {user?.date_of_birth ? formatDate(user.date_of_birth) : 'Не указана'}
                </Text>
              )}
            </View>

            {/* СТРОКА: ПОСЛЕДНИЙ ВХОД */}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Последний вход</Text>
              <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
                {user?.last_login ? formatDate(user.last_login) : 'Неизвестно'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, isEditing && { backgroundColor: '#00875A' }]} 
            onPress={isEditing ? handleSaveProfile : handleEditPress}
            disabled={loading}
          >
            <Text style={styles.editButtonText}>
              {loading ? 'Загрузка...' : isEditing ? 'Сохранить изменения' : 'Редактировать профиль'}
            </Text>
          </TouchableOpacity>
        </View>
          
          {/* Горизонтальная лента переключателей (Табы) */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {statusTabs.map((tab) => {
              const isActive = activeStatusId === tab.id;
              const count = getTabCount(tab.id);
              
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveStatusId(tab.id)}
                >
                  < MaterialCommunityIcons
                    name={tab.icon as any} 
                    size={18} 
                    color={isActive ? '#000' : theme.textSecondary} 
                  />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.name}
                  </Text>
                  {count > 0 && (
                    <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                      {count}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Список карточек для выбранного таба */}
          <View style={styles.listContent}>
            {isListLoading ? (
              <ActivityIndicator size="small" color="#6200ee" style={{ marginVertical: 20 }} />
            ) : listItems.length === 0 ? (
              <Text style={styles.emptyText}>Список пуст</Text>
            ) : (
              listItems.map((item, index) => (
                <View key={item.media_lists_id} style={styles.mediaCard}>
                  {/* Порядковый номер строки */}
                  <Text style={styles.cardNumber}>{index + 1}.</Text>
                  
                  {/* Постер сезона */}
                  <Image 
                    source={{ uri: getPosterUrl(item.poster_url) }} 
                    style={styles.cardPoster} 
                  />
                  
                  {/* Информация о тайтле */}
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.media_title || 'Без названия'}
                    </Text>
                    <Text style={styles.cardSeason}>
                      {item.season_name}
                    </Text>
                    
                    {/* Твоя оценка (отображается, только если она есть в БД) */}
                    {item.user_rating !== null && (
                      <Text style={styles.cardRating}>
                        Моя оценка <Text style={styles.ratingValue}>{item.user_rating}</Text>
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

      </ScrollView>
      <SideMenu
        isVisible={isMenuVisible}
        onClose={handleCloseMenu}
      />
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    marginTop: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: theme.text,
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDescription: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: theme.background,
    padding: 20,
    borderRadius: 16,
    position: 'relative', 
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#333',
  },
  defaultAvatar: {
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarInitial: {
    position: 'absolute',
    color: theme.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  userSince: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  infoSection: {
    backgroundColor: theme.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  statsSection: {
    backgroundColor: theme.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  editButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    opacity: 1,
    width: '20%',
  },
  editButtonDisabled: {
    opacity: 0.6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutIconButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    backgroundColor: theme.background, // Легкий полупрозрачный фон
    borderRadius: 20,
  },
  buyButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 15,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subscriptionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary, 
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  textGroup: {
    flex: 1, // чтобы текст не налезал на кнопку
  },
  infoGroup: {
    flexDirection: 'row', // Иконка и текст в ряд
    alignItems: 'center',
    flex: 1, // Позволяет тексту занимать оставшееся место, не толкая кнопку
  },
  textContainer: {
    marginLeft: 12, // Отступ от иконки
  },
  planText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#4CAF50', 
    fontSize: 12,
  },
  statusInactive: {
    color: theme.accent, 
    fontSize: 12,
  },
  infoInput: {
    fontSize: 16,
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.backgroundSecondary || '#1A1A1A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border || '#333',
    minWidth: 150,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 12, // Чуть сдвигаем, учитывая marginRight у аватарки
    backgroundColor: '#6200ee',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff', // Белый ободок, выделяющий иконку
  }, 
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.backgroundSecondary || '#1A1A1A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border || '#333',
  },
  tabsScroll: {
    marginTop: 24,
    marginBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 4,
    gap: 8, // Отступы между кнопками
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.backgroundSecondary || '#1A1A1A',
    borderWidth: 1,
    borderColor: theme.border || '#222',
  },
  tabButtonActive: {
    backgroundColor: '#E0E0E0', // Светлый фон для активного таба, как на макете
    borderColor: '#E0E0E0',
  },
  tabText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  tabCount: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  tabCountActive: {
    color: '#000',
  },
  listContent: {
    marginTop: 8,
  },
  emptyText: {
    color: theme.textSecondary,
    textAlign: 'center',
    marginVertical: 30,
    fontSize: 15,
  },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.background,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border || '#222',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    width: 30,
    textAlign: 'center',
  },
  cardPoster: {
    width: 150,
    height: 170,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSeason: {
    fontSize: 23,
    color: '#777',
    marginBottom: 4,
  },
  cardRating: {
    fontSize: 18,
    color: '#888',
  },
  ratingValue: {
    color: '#4CAF50', // Зеленый цвет оценки
    fontWeight: 'bold',
  },
});

export default AccountScreen;