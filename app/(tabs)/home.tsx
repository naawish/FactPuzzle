import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT, SPACING, TEXT } from '../../src/theme/theme';

const GAMES = [
  { id: 'wordfinder', title: 'WORD FINDER', icon: 'extension-puzzle', route: '/game/wordfinder', locked: false },
  { id: 'hangman', title: 'HANGMAN', icon: 'accessibility', route: '/game/hangman', locked: false },
  { id: 'trivia', title: 'TRIVIA', icon: 'help-buoy', route: '/game/trivia', locked: false },
  { id: 'tictactoe', title: 'TIC TAC TOE', icon: 'grid', route: '/game/tictactoe', locked: false },
];

export default function GameHubScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const bgImage = Platform.OS === 'web' 
    ? require('../../assets/background.png') 
    : require('../../assets/background.png');

  return (
    <ImageBackground 
      source={bgImage} 
      style={{ flex: 1, backgroundColor: themeColors.background }}
      imageStyle={{ opacity: isDark ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerContainer}>
          <Text style={[TEXT.header, { color: themeColors.primary, fontSize: 32 }]}>GAME HUB</Text>
          <Text style={{ color: themeColors.subText, letterSpacing: 2, fontWeight: '600', marginTop: 5 }}>
            CHOOSE YOUR CHALLENGE
          </Text>
        </View>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              disabled={game.locked}
              onPress={() => router.push(game.route as any)}
              activeOpacity={0.7}
              style={[
                LAYOUT.card3D,
                styles.card,
                { 
                  backgroundColor: game.locked ? (isDark ? '#1E293B' : '#E0E0E0') : themeColors.card,
                  borderColor: game.locked ? (isDark ? '#334155' : '#999') : themeColors.primary,
                  borderBottomColor: game.locked ? (isDark ? '#0F172A' : '#777') : themeColors.shadow
                }
              ]}
            >
              <Ionicons 
                name={game.icon as any} 
                size={48} 
                color={game.locked ? (isDark ? '#475569' : '#999') : themeColors.primary} 
                style={{ marginBottom: SPACING.md }}
              />
              <Text style={[
                TEXT.label, 
                { color: game.locked ? (isDark ? '#475569' : '#999') : themeColors.text, fontSize: 14 }
              ]}>
                {game.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: { 
    padding: SPACING.lg, 
    paddingTop: 60,
    alignItems: 'center',
    flexGrow: 1
  },
  headerContainer: { marginBottom: SPACING.xl, alignItems: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.lg,
    maxWidth: 800, 
    width: '100%'
  },
  card: {
    width: 160,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  }
});