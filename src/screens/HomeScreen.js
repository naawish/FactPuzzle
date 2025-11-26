// src/screens/HomeScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2; // 2 Columns with padding

// GAME CONFIGURATION
const GAMES = [
  // Game 1: Word Finder (Unlocked)
  { 
    id: 'wordfinder', 
    title: 'WORD FINDER', 
    icon: 'extension-puzzle', 
    screen: 'WordFinder', 
    locked: false 
  },
  // Game 2: Hangman (Unlocked)
  { 
    id: 'hangman', 
    title: 'HANGMAN', 
    icon: 'accessibility', // Stick figure icon
    screen: 'Hangman', 
    locked: false 
  },
  // Placeholders
  { id: 'coming1', title: 'COMING SOON', icon: 'lock-closed', screen: null, locked: true },
  { id: 'coming2', title: 'COMING SOON', icon: 'lock-closed', screen: null, locked: true },
  { id: 'coming3', title: 'COMING SOON', icon: 'lock-closed', screen: null, locked: true },
  { id: 'coming4', title: 'COMING SOON', icon: 'lock-closed', screen: null, locked: true },
];

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useContext(ThemeContext);

  const handleGamePress = (game) => {
    if (!game.locked && game.screen) {
      navigation.navigate(game.screen);
    }
  };

  // Dynamic Styles
  const headerStyle = { color: theme.primary };
  const subTextStyle = { color: theme.subText };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER SECTION */}
        <View style={styles.headerContainer}>
          <Text style={[styles.header, headerStyle]}>GAME HUB</Text>
          <Text style={[styles.subHeader, subTextStyle]}>CHOOSE YOUR CHALLENGE</Text>
        </View>

        {/* GAME GRID */}
        <View style={styles.grid}>
          {GAMES.map((game) => {
            // Dynamic Card Styling Logic
            const isLocked = game.locked;
            
            // Background Color
            const cardBg = isLocked 
              ? (isDark ? '#1E293B' : '#E0E0E0') 
              : theme.card;
            
            // Border Color
            const borderColor = isLocked 
              ? (isDark ? '#334155' : '#999') 
              : theme.primary;
            
            // Shadow/3D Bottom Color
            const shadowColor = isLocked 
              ? (isDark ? '#0F172A' : '#777') 
              : theme.shadow;
            
            // Icon & Text Color
            const contentColor = isLocked 
              ? (isDark ? '#475569' : '#999') 
              : theme.primary;
            
            const textColor = isLocked 
              ? (isDark ? '#475569' : '#999') 
              : theme.text;

            return (
              <TouchableOpacity 
                key={game.id} 
                style={[
                  styles.gameCard, 
                  { 
                    backgroundColor: cardBg, 
                    borderColor: borderColor,
                    borderBottomColor: shadowColor
                  }
                ]}
                onPress={() => handleGamePress(game)}
                disabled={isLocked}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={game.icon} size={40} color={contentColor} />
                </View>
                <Text style={[styles.gameTitle, { color: textColor }]}>{game.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 }, // Extra top padding for safe area
  
  headerContainer: { marginBottom: 30, alignItems: 'center' },
  header: { fontSize: 32, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  subHeader: { fontSize: 14, fontWeight: '600', letterSpacing: 2, marginTop: 5 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20 // Vertical Gap between rows
  },

  gameCard: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.2, // Rectangular aspect ratio (taller than wide)
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 8, // Deep 3D Effect
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    elevation: 5,
  },
  
  iconContainer: { marginBottom: 15 },
  gameTitle: { fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 }
});