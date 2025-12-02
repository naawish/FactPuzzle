import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function GameLayout() {
  const { theme } = useTheme();
  const router = useRouter();

  // Custom 3D Back Button
  const CustomBackButton = () => (
    <TouchableOpacity 
      onPress={() => router.back()}
      style={styles.backBtn}
    >
      <Text style={[styles.backBtnText, { color: theme.primary }]}>BACK</Text>
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '900', letterSpacing: 1 },
        headerLeft: () => <CustomBackButton />, 
        headerBackVisible: false,
      }}
    >
      <Stack.Screen name="wordfinder" options={{ title: 'WORD FINDER' }} />
      <Stack.Screen name="hangman" options={{ title: 'HANGMAN' }} />
      <Stack.Screen name="trivia" options={{ title: 'TRIVIA' }} />
      <Stack.Screen name="tictactoe" options={{ title: 'TIC TAC TOE' }} />
      
      {/* NEW FLAG GAME TITLE */}
      <Stack.Screen name="flag" options={{ title: 'FLAG GUESSER' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    marginRight: 10
  },
  backBtnText: { 
    fontWeight: '900', 
    fontSize: 12, 
    letterSpacing: 1 
  }
});