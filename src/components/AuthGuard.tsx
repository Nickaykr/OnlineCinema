import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  console.log('🛡️ AuthGuard state:', { 
    user: user ? user.email : 'NULL', 
    isLoading,
    hasRedirected 
  });

  useEffect(() => {
    if (!isLoading && !user && !hasRedirected) {
      console.log('👤 No user, performing one-time redirect to login');
      setHasRedirected(true);
      router.replace('/');
    }
  }, [user, isLoading, hasRedirected, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  if (hasRedirected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Redirecting to login...</Text>
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10 }}>Checking authentication...</Text>
    </View>
  );
}