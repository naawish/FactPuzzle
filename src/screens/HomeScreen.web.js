// src/screens/HomeScreen.web.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const GAMES = [
  { id: 'wordfinder', title: 'WORD FINDER', icon: 'extension-puzzle', screen: 'WordFinder', locked: false },
  { id: 'hangman', title: 'HANGMAN', icon: 'accessibility', screen: 'Hangman', locked: false },
  { id: 'trivia', title: 'TRIVIA', icon: 'help-buoy', screen: 'Trivia', locked: false },
  { id: 'coming4', title: 'COMING SOON', icon: 'lock-closed', screen: null, locked: true },
  { id: 'coming5', title: 'COMING SOON', icon: 'lock-closed', screen: null, locked: true },
  { id: 'coming6', title: 'COMING SOON', icon: 'lock-closed', screen: null, locked: true },
];

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useContext(ThemeContext);

  const handleGamePress = (game) => {
    if (!game.locked && game.screen) {
      navigation.navigate(game.screen);
    }
  };

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
        
        {/* CENTERED WEB CONTAINER */}
        <View style={styles.webContainer}>
          
          <View style={styles.headerContainer}>
            <Text style={[styles.header, headerStyle]}>GAME HUB</Text>
            <Text style={[styles.subHeader, subTextStyle]}>CHOOSE YOUR CHALLENGE</Text>
          </View>

          <View style={styles.grid}>
            {GAMES.map((game) => {
              const isLocked = game.locked;
              const cardBg = isLocked ? (isDark ? '#1E293B' : '#E0E0E0') : theme.card;
              const borderColor = isLocked ? (isDark ? '#334155' : '#999') : theme.primary;
              const shadowColor = isLocked ? (isDark ? '#0F172A' : '#777') : theme.shadow;
              const contentColor = isLocked ? (isDark ? '#475569' : '#999') : theme.primary;
              const textColor = isLocked ? (isDark ? '#475569' : '#999') : theme.text;

              return (
                <TouchableOpacity 
                  key={game.id} 
                  style={[styles.gameCard, { backgroundColor: cardBg, borderColor: borderColor, borderBottomColor: shadowColor }]}
                  onPress={() => handleGamePress(game)}
                  disabled={isLocked}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={game.icon} size={50} color={contentColor} />
                  </View>
                  <Text style={[styles.gameTitle, { color: textColor }]}>{game.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  scrollContent: { flexGrow: 1, padding: 40, alignItems: 'center' },
  
  // Constrains width on big screens
  webContainer: { width: '100%', maxWidth: 900, alignItems: 'center' },

  headerContainer: { marginBottom: 50, alignItems: 'center' },
  header: { fontSize: 48, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  subHeader: { fontSize: 18, fontWeight: '600', letterSpacing: 4, marginTop: 10 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 30
  },

  gameCard: {
    width: 240, // Fixed width prevents stretching
    height: 300,
    borderRadius: 25,
    borderWidth: 4,
    borderBottomWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    cursor: 'pointer'
  },
  
  iconContainer: { marginBottom: 20 },
  gameTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', letterSpacing: 1 }
});