import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';

// 1. Navigation Wrapper Component
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // 2. Authentication Guard
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not logged in? Go to Login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Logged in? Go to Game Hub
      router.replace('/(tabs)/home');
    }
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Loading / Entry */}
      <Stack.Screen name="index" />
      
      {/* Login & Signup Group */}
      <Stack.Screen name="(auth)" />
      
      {/* Main App Tabs (Home, Profile, etc.) */}
      <Stack.Screen name="(tabs)" />
      
      {/* Game Stack (WordFinder, Hangman, Flags, etc.) */}
      {/* presentation: 'card' ensures they slide in like full pages */}
      <Stack.Screen name="game" options={{ presentation: 'card' }} />
    </Stack>
  );
}

// 3. Root Export
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}