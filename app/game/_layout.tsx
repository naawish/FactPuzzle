import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function GameLayout() {
  const { theme } = useTheme();
  const router = useRouter();

  // Custom 3D Back Button Component
  const CustomBackButton = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => router.back()}
        activeOpacity={0.7}
        style={styles.backBtn}
      >
        <Text style={[styles.backBtnText, { color: theme.primary }]}>BACK</Text>
      </TouchableOpacity>
    </View>
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
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="wordfinder" options={{ title: 'WORD FINDER' }} />
      <Stack.Screen name="hangman" options={{ title: 'HANGMAN' }} />
      <Stack.Screen name="trivia" options={{ title: 'TRIVIA' }} />
      <Stack.Screen name="tictactoe" options={{ title: 'TIC TAC TOE' }} />
      <Stack.Screen name="flag" options={{ title: 'FLAG GUESSER' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  // Container to help vertical alignment within the Header
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backBtn: {
    backgroundColor: '#FFF',
    height: 34,               // Fixed Height
    paddingHorizontal: 14,    // Side Padding
    borderRadius: 17,         // Fully rounded ends (Pill shape)
    
    // 3D Borders
    borderColor: 'rgba(0,0,0,0.15)', // Subtle grey border
    borderWidth: 0,                  // No side/top border for cleaner look
    borderBottomWidth: 4,            // Only bottom for 3D effect
    
    // Alignment
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: { 
    fontWeight: '900', 
    fontSize: 11, 
    letterSpacing: 1,
    textAlign: 'center',
    
    // VISUAL ALIGNMENT FIX:
    // Because the bottom border is thick (4px), the text is pushed up.
    // We push it down slightly to make it look centered on the white face.
    marginTop: 2 
  }
});