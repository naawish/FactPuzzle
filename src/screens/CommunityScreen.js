// src/screens/CommunityScreen.js
import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // <--- IMPORT THIS

export default function CommunityScreen() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); // <--- USE THEME

  const userScore = user?.solved ? user.solved.length : 0;
  const userName = user?.username || "You";

  const bots = [
    { id: '1', name: 'PuzzleMaster', score: 42 },
    { id: '2', name: 'TriviaKing', score: 30 },
    { id: '3', name: 'FactFinder', score: 12 },
    { id: '4', name: 'NewbieExplorer', score: 5 },
  ];

  const leaderboard = useMemo(() => {
    const allPlayers = [
      ...bots,
      { id: 'user', name: `${userName} (You)`, score: userScore, isUser: true }
    ];
    return allPlayers.sort((a, b) => b.score - a.score);
  }, [userScore, userName]);

  const userRank = leaderboard.findIndex(p => p.isUser) + 1;

  // --- DYNAMIC STYLES ---
  const headerStyle = { color: theme.primary };
  
  const statsCardStyle = { 
    backgroundColor: theme.primary, // Orange (Light) vs Violet (Dark)
    borderColor: '#FFF', // Keep white border for contrast
  };

  const rowStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.border, 
    borderBottomColor: theme.shadow 
  };

  // Special Highlight for "My Row"
  const myRowStyle = { 
    backgroundColor: theme.background === '#0F172A' ? '#334155' : '#FFFBE6', // Dark Slate vs Light Yellow
    borderColor: theme.primary, 
    borderBottomColor: theme.shadow 
  };

  const textStyle = { color: theme.text };
  const rankBadgeStyle = { backgroundColor: theme.border }; // Matches border color
  const myBadgeStyle = { backgroundColor: theme.primary };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <Text style={[styles.header, headerStyle]}>LEADERBOARD</Text>
      
      {/* 1. Styled Stats Card (Dynamic Color) */}
      <View style={[styles.statsCard, statsCardStyle]}>
        <Text style={styles.statsTitle}>YOUR GLOBAL RANK</Text>
        <Text style={styles.statsValue}>#{userRank}</Text>
        <Text style={styles.statsSub}>Total Solved: {userScore}</Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <View style={[
            styles.rankRow, 
            rowStyle,                    // Base Style
            item.isUser && myRowStyle    // Override if User
          ]}>
            {/* Rank Circle */}
            <View style={[
              styles.rankBadge, 
              rankBadgeStyle,
              item.isUser && myBadgeStyle
            ]}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>

            <Text style={[styles.name, textStyle, item.isUser && { color: theme.primary }]}>
              {item.name}
            </Text>
            
            <Text style={[styles.score, { color: theme.primary }]}>
              {item.score}
            </Text>
          </View>
        )}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
  },
  header: { 
    fontSize: 30, 
    fontWeight: '900', 
    marginBottom: 20, 
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 1
  },
  
  // --- STATS CARD ---
  statsCard: { 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 20, 
    alignItems: 'center',
    borderWidth: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
  },
  statsTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  statsValue: { color: 'white', fontSize: 50, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 5 },
  statsSub: { color: 'white', fontSize: 16, fontWeight: '600' },

  // --- LEADERBOARD ROW ---
  rankRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    marginBottom: 12, 
    borderRadius: 15, 
    alignItems: 'center', 
    // Borders
    borderWidth: 2,
    borderBottomWidth: 5, 
  },
  
  rankBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontWeight: 'bold', color: '#FFF' },
  
  name: { fontSize: 16, fontWeight: 'bold', flex: 1, marginLeft: 15 },
  score: { fontSize: 18, fontWeight: '900' }
});