// src/screens/CommunityScreen.js
import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function CommunityScreen() {
  const { user } = useContext(AuthContext);

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

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.header}>LEADERBOARD</Text>
      
      {/* 1. Styled Stats Card */}
      <View style={styles.statsCard}>
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
            item.isUser && styles.myRow 
          ]}>
            {/* Rank Circle */}
            <View style={[styles.rankBadge, item.isUser && styles.myBadge]}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>

            <Text style={[styles.name, item.isUser && styles.myText]}>
              {item.name}
            </Text>
            
            <Text style={[styles.score, item.isUser && styles.myText]}>
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
    color: '#C71585', 
    marginBottom: 20, 
    textAlign: 'center',
    textShadowColor: 'white',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    letterSpacing: 1
  },
  
  // --- STATS CARD ---
  statsCard: { 
    backgroundColor: '#C71585', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 20, 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
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
    backgroundColor: '#fff', 
    marginBottom: 12, 
    borderRadius: 15, 
    alignItems: 'center', 
    // Style
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderBottomWidth: 5, // 3D effect
    borderBottomColor: '#D0D0D0'
  },
  
  myRow: { 
    backgroundColor: '#FFFBE6', 
    borderColor: '#FF8C00', 
    borderBottomColor: '#C06600' // Darker Orange
  },
  myText: { 
    color: '#FF8C00',
    fontWeight: '900'
  },

  rankBadge: { width: 30, height: 30, backgroundColor: '#EEE', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  myBadge: { backgroundColor: '#FF8C00' },
  rankText: { fontWeight: 'bold', color: '#555' },
  
  name: { fontSize: 16, fontWeight: 'bold', color: '#555', flex: 1, marginLeft: 15 },
  score: { fontSize: 18, fontWeight: '900', color: '#C71585' }
});