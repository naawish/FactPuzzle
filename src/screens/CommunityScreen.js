// src/screens/CommunityScreen.js
import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function CommunityScreen() {
  const { user } = useContext(AuthContext);

  // 1. Get current user stats
  const userScore = user?.solved ? user.solved.length : 0;
  const userName = user?.username || "You";

  // 2. Define Bot Data (The competition)
  const bots = [
    { id: '1', name: 'PuzzleMaster', score: 42 },
    { id: '2', name: 'TriviaKing', score: 30 },
    { id: '3', name: 'FactFinder', score: 12 },
    { id: '4', name: 'NewbieExplorer', score: 5 },
  ];

  // 3. Combine User + Bots and Sort by Score (High to Low)
  // useMemo ensures we don't recalculate this unless the score changes
  const leaderboard = useMemo(() => {
    const allPlayers = [
      ...bots,
      { id: 'user', name: `${userName} (You)`, score: userScore, isUser: true }
    ];
    
    return allPlayers.sort((a, b) => b.score - a.score);
  }, [userScore, userName]);

  // 4. Find the User's Rank (Index + 1)
  const userRank = leaderboard.findIndex(p => p.isUser) + 1;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      
      {/* Global Stats Section */}
      <View style={styles.statsBox}>
        <Text style={styles.statsTitle}>Your Global Rank</Text>
        <Text style={styles.statsValue}>#{userRank}</Text>
        <Text style={styles.statsSub}>Score: {userScore}</Text>
      </View>

      {/* Dynamic List */}
      <FlatList
        data={leaderboard}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={[
            styles.rankRow, 
            item.isUser && styles.myRow // Apply special style if it's YOU
          ]}>
            <Text style={[styles.rank, item.isUser && styles.myText]}>
              {index + 1}. {item.name}
            </Text>
            <Text style={[styles.score, item.isUser && styles.myText]}>
              {item.score} Facts
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF0F5' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#C71585', marginBottom: 20, textAlign: 'center' },
  
  statsBox: { 
    backgroundColor: '#C71585', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 20, 
    alignItems: 'center',
    elevation: 5
  },
  statsTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', opacity: 0.9 },
  statsValue: { color: 'white', fontSize: 48, fontWeight: 'bold' },
  statsSub: { color: 'white', fontSize: 14, opacity: 0.8 },

  rankRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    backgroundColor: '#fff', 
    marginBottom: 10, 
    borderRadius: 8, 
    alignItems: 'center', 
    elevation: 2 
  },
  
  // Special styles for the user's own row
  myRow: { 
    backgroundColor: '#FFD700', 
    borderColor: '#FFA500', 
    borderWidth: 2 
  },
  myText: { 
    color: '#000',
    fontWeight: '900'
  },

  rank: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  score: { fontSize: 18, fontWeight: 'bold', color: '#C71585' }
});