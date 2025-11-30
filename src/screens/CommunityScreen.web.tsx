// src/screens/CommunityScreen.web.js
import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function CommunityScreen() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

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

  // Dynamic Styles
  const headerStyle = { color: theme.primary };
  const statsCardStyle = { backgroundColor: theme.primary, borderColor: '#FFF' };
  const rowStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const myRowStyle = { backgroundColor: theme.background === '#0F172A' ? '#334155' : '#FFFBE6', borderColor: theme.primary, borderBottomColor: theme.shadow };
  const textStyle = { color: theme.text };
  const rankBadgeStyle = { backgroundColor: theme.border };
  const myBadgeStyle = { backgroundColor: theme.primary };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      {/* CENTERING CONTAINER */}
      <View style={styles.centerWrapper}>
        <View style={styles.webContainer}>
          
          <Text style={[styles.header, headerStyle]}>LEADERBOARD</Text>
          
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
              <View style={[styles.rankRow, rowStyle, item.isUser && myRowStyle]}>
                <View style={[styles.rankBadge, rankBadgeStyle, item.isUser && myBadgeStyle]}>
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
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  
  // New Centering Logic
  centerWrapper: {
    flex: 1,
    alignItems: 'center', // Horizontal Center
    width: '100%',
  },
  webContainer: {
    width: '100%',
    maxWidth: 600, // Strict Max Width
    padding: 20,
    paddingTop: 40,
    flex: 1,
  },

  header: { fontSize: 40, fontWeight: '900', marginBottom: 30, textAlign: 'center', letterSpacing: 2 },
  
  statsCard: { padding: 30, borderRadius: 20, marginBottom: 30, alignItems: 'center', borderWidth: 4, elevation: 8 },
  statsTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  statsValue: { color: 'white', fontSize: 60, fontWeight: '900' },
  statsSub: { color: 'white', fontSize: 18, fontWeight: '600' },

  rankRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, marginBottom: 15, borderRadius: 15, alignItems: 'center', borderWidth: 2, borderBottomWidth: 5 },
  rankBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontWeight: 'bold', color: '#FFF', fontSize: 16 },
  name: { fontSize: 18, fontWeight: 'bold', flex: 1, marginLeft: 20 },
  score: { fontSize: 22, fontWeight: '900' }
});