import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ['/', '/register']; 
    const isPublicPath = publicPaths.includes(pathname);
    const isAdminPath = segments[0] === '(admin)';

    if (!user && !isPublicPath) {
      console.log('🛡️ Guard: Redirect to login');
      router.replace('/'); 
    } else if (user && isPublicPath && !isAdminPath) {
      console.log('✅ Guard: Redirect to main');
      router.replace('/main'); 
    }
  }, [user, isLoading, pathname, router]);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#fff' }}>Загрузка...</Text>
      </View>
    );
  }

  return <>{children}</>;
}