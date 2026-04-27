import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useUser } from '../src/hooks/userAPI';
import { authEvents } from '../src/services/authEvents';

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
        source={{ uri: user.avatar_url }}
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

  const handleMenuPress = () => setIsMenuVisible(true);
  const handleCloseMenu = () => setIsMenuVisible(false);

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
          
            <UserAvatar user={user} size={80} />
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
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Имя пользователя</Text>
              <Text style={styles.infoValue}>
                {user?.username || 'Не указано'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Страна</Text>
              <Text style={styles.infoValue}>
                {user?.country || 'Не указана'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Дата рождения</Text>
              <Text style={styles.infoValue}>
                {user?.date_of_birth ? formatDate(user.date_of_birth) : 'Не указана'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Последний вход</Text>
              <Text style={styles.infoValue}>
                {user?.last_login ? formatDate(user.last_login) : 'Неизвестно'}
              </Text>
            </View>
          </View>

          {/* <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditProfile}
            disabled={loading}
          >
            <Text style={styles.editButtonText}>
              {loading ? 'Загрузка...' : 'Редактировать профиль'}
            </Text>
          </TouchableOpacity> */}
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
  },
  editButtonDisabled: {
    opacity: 0.6,
  },
  editButtonText: {
    color: theme.text,
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
});

export default AccountScreen;