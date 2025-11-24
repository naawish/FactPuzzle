// src/screens/CommunityScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function CommunityScreen() {
  // 1. Get the user data from the global context
  const { user } = useContext(AuthContext);

  // 2. Calculate the user's score (number of solved facts)
  // We use ?. checks to make sure the app doesn't crash if user data is loading
  const userScore = user?.solved ? user.solved.length : 0;
  const userName = user?.username || "You";

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      
      {/* Global Stats Section */}
      <View style={styles.statsBox}>
        <Text style={styles.statsTitle}>Your Global Rank</Text>
        <Text style={styles.statsValue}>#{userScore > 42 ? "1" : userScore > 30 ? "2" : "3"}</Text>
      </View>

      <ScrollView style={styles.list}>
        {/* Dynamic User Row */}
        <View style={[styles.rankRow, styles.myRow]}>
          <Text style={[styles.rank, styles.myText]}>
            {userScore > 42 ? "1" : userScore > 30 ? "2" : "3"}. {userName} (You)
          </Text>
          <Text style={[styles.score, styles.myText]}>{userScore} Facts</Text>
        </View>

        {/* Static Bot Rows (Mock Data) */}
        <View style={styles.rankRow}>
          <Text style={styles.rank}>{userScore > 42 ? "2" : "1"}. PuzzleMaster</Text>
          <Text style={styles.score}>42 Facts</Text>
        </View>

        <View style={styles.rankRow}>
          <Text style={styles.rank}>{userScore > 30 ? "3" : "2"}. TriviaKing</Text>
          <Text style={styles.score}>30 Facts</Text>
        </View>

        <View style={styles.rankRow}>
          <Text style={styles.rank}>4. FactFinder</Text>
          <Text style={styles.score}>12 Facts</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF0F5' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#C71585', marginBottom: 20, textAlign: 'center' },
  
  statsBox: { backgroundColor: '#C71585', padding: 20, borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  statsTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  statsValue: { color: 'white', fontSize: 40, fontWeight: 'bold' },

  list: { flex: 1 },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, alignItems: 'center', elevation: 2 },
  
  // Special styles for the user's own row to make it pop
  myRow: { backgroundColor: '#FFD700', borderColor: '#FFA500', borderWidth: 2 },
  myText: { color: '#000' },

  rank: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  score: { fontSize: 18, fontWeight: 'bold', color: '#C71585' }
});