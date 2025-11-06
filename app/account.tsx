import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import { useUser } from './hooks/userAPI';

// Компонент для аватара по умолчанию
const DefaultAvatar = ({ size = 80, name }: { size?: number; name?: string }) => (
  <View style={[styles.defaultAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
    <Ionicons name="person" size={size * 0.4} color="#fff" />
    {name && (
      <Text style={styles.avatarInitial}>
        {name.charAt(0).toUpperCase()}
      </Text>
    )}
  </View>
);

// Компонент для отображения аватара
const UserAvatar = ({ user, size = 80 }: { user: any; size?: number }) => {
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

  const handleEditProfile = () => {
    Alert.alert('Редактирование', 'Функция редактирования профиля', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          updateUser({ username: user?.username || 'User' });
        },
      },
    ]);
  };

  // Временная статистика
  const mockStats = {
    moviesWatched: 145,
    hoursWatched: 320,
    favoriteGenres: 5
  };

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
    return (
      <View style={styles.container}>
        <Header title="Профиль" onMenuPress={handleMenuPress} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ошибка загрузки профиля</Text>
          <Text style={styles.errorDescription}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshUser}>
            <Text style={styles.retryButtonText}>Повторить попытку</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
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
      <Header title="Профиль" onMenuPress={handleMenuPress} />

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

      <SideMenu
        isVisible={isMenuVisible}
        onClose={handleCloseMenu}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
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
    color: '#fff',
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
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDescription: {
    color: '#888',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
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
    color: '#fff',
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
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  userSince: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 16,
    color: '#888',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  statsSection: {
    backgroundColor: '#1a1a1a',
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
    color: '#888',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;