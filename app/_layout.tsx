import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a1a1a' }
        }}
      />
    </AuthProvider>
  );
}