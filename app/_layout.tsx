import { Stack } from 'expo-router';
import AuthGuard from '../src/components/AuthGuard';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
   
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}