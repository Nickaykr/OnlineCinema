import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Если данные еще загружаются, показываем спиннер
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#ff4444" />
      </View>
    );
  }

  // Если пользователя нет или он не админ — редирект на главную
  if (!user || !user.is_admin) {

    return <Redirect href="/" />;
  }

  // Если проверка пройдена, отрисовываем вложенные страницы админки
  return (
    <Stack
      screenOptions={{
        headerShown: true, 
        headerStyle: { backgroundColor: '#ff4444' },
        headerTintColor: '#f8f8f8',
        headerRight: () => (
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={{ marginRight: 15, padding: 5 }}
          >
            <Text style={{ fontSize: 20 }}>
              {isDark ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Панель управления' }} />
      {/* <Stack.Screen name="promos" options={{ title: 'Промокоды' }} />
      <Stack.Screen name="users" options={{ title: 'Пользователи' }} /> */}
    </Stack>
  );
}