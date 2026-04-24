import { Stack } from 'expo-router';
import AuthGuard from '../src/components/AuthGuard'; // Импортируй свой гард
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    // 1. Провайдер должен быть самым верхним
    <AuthProvider>
      {/* 2. Внутри него гард, который уже может безопасно вызвать useAuth */}
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1a1a1a' }
          }}
        />
      </AuthGuard>
    </AuthProvider>
  );
}