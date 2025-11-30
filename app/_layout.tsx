import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          
          {/* CHANGE HERE: presentation: 'card' makes it a full page push */}
          <Stack.Screen name="game" options={{ presentation: 'card' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}