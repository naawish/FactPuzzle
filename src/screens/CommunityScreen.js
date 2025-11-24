// src/screens/CommunityScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      <View style={styles.rankRow}>
        <Text style={styles.rank}>1. You</Text>
        <Text style={styles.score}>0 Facts</Text>
      </View>
      <View style={styles.rankRow}>
        <Text style={styles.rank}>2. PuzzleMaster</Text>
        <Text style={styles.score}>42 Facts</Text>
      </View>
      <View style={styles.rankRow}>
        <Text style={styles.rank}>3. TriviaKing</Text>
        <Text style={styles.score}>30 Facts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF0F5' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#C71585', marginBottom: 20, textAlign: 'center' },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8 },
  rank: { fontSize: 18, fontWeight: 'bold' },
  score: { fontSize: 18, color: '#C71585' }
});