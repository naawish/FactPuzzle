import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for navigation to be ready and auth to load
    if (!rootNavigationState?.key || loading) return;

    if (user) {
      // User is logged in -> Go to Game Hub
      router.replace('/(tabs)/home');
    } else {
      // User is NOT logged in -> Go to Login
      router.replace('/(auth)/login');
    }
  }, [user, loading, rootNavigationState]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
      <ActivityIndicator size="large" color="#FF8C00" />
    </View>
  );
}