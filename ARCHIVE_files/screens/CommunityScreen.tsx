// src/screens/CommunityScreen.js
import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, Dimensions } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityScreen() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const solvedList = user?.solved || [];
  const totalScore = solvedList.length;
  const userName = user?.username || "You";

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    let hangman = 0;
    let tictactoe = 0;
    let trivia = 0;
    let wordfinder = 0;

    solvedList.forEach(item => {
      const text = typeof item === 'string' ? item : item.text;
      
      if (text.startsWith("Solved Hangman")) hangman++;
      else if (text.startsWith("Beat TicTacToe")) tictactoe++;
      else if (text.startsWith("Q:")) trivia++;
      else wordfinder++; // Default/Old data is assumed WordFinder
    });

    return { hangman, tictactoe, trivia, wordfinder };
  }, [solvedList]);

  // Mock Bots
  const bots = [
    { id: '1', name: 'PuzzleMaster', score: 42 },
    { id: '2', name: 'TriviaKing', score: 30 },
    { id: '3', name: 'FactFinder', score: 12 },
    { id: '4', name: 'NewbieExplorer', score: 5 },
  ];

  const leaderboard = useMemo(() => {
    const allPlayers = [
      ...bots,
      { id: 'user', name: `${userName} (You)`, score: totalScore, isUser: true }
    ];
    return allPlayers.sort((a, b) => b.score - a.score);
  }, [totalScore, userName]);

  const userRank = leaderboard.findIndex(p => p.isUser) + 1;

  // Styles
  const headerStyle = { color: theme.primary };
  const statsCardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const rowStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const myRowStyle = { backgroundColor: theme.background === '#0F172A' ? '#334155' : '#FFFBE6', borderColor: theme.primary, borderBottomColor: theme.shadow };
  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };
  const rankBadgeStyle = { backgroundColor: theme.border };
  const myBadgeStyle = { backgroundColor: theme.primary };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <View style={styles.centerWrapper}>
        <View style={styles.webContainer}>
          
          <Text style={[styles.header, headerStyle]}>LEADERBOARD</Text>
          
          {/* --- NEW STATS GRID --- */}
          <View style={[styles.statsCard, statsCardStyle]}>
            <Text style={[styles.statsHeader, textStyle]}>YOUR STATS</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="extension-puzzle" size={24} color={theme.primary} />
                <Text style={[styles.statNum, textStyle]}>{stats.wordfinder}</Text>
                <Text style={[styles.statLabel, subTextStyle]}>Words</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="accessibility" size={24} color={theme.danger} />
                <Text style={[styles.statNum, textStyle]}>{stats.hangman}</Text>
                <Text style={[styles.statLabel, subTextStyle]}>Hangman</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="help-buoy" size={24} color="#32CD32" />
                <Text style={[styles.statNum, textStyle]}>{stats.trivia}</Text>
                <Text style={[styles.statLabel, subTextStyle]}>Trivia</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="grid" size={24} color="#4682B4" />
                <Text style={[styles.statNum, textStyle]}>{stats.tictactoe}</Text>
                <Text style={[styles.statLabel, subTextStyle]}>TicTac</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={[styles.totalScore, { color: theme.primary }]}>
              GLOBAL RANK: #{userRank} <Text style={{color: theme.text, fontSize: 16}}>({totalScore} Wins)</Text>
            </Text>
          </View>

          <FlatList
            data={leaderboard}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={[
                styles.rankRow, 
                rowStyle, 
                item.isUser && myRowStyle 
              ]}>
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
  container: { flex: 1, padding: 20 },
  centerWrapper: { flex: 1, alignItems: 'center', width: '100%' },
  webContainer: { width: '100%', maxWidth: 600, flex: 1 },

  header: { fontSize: 30, fontWeight: '900', marginBottom: 20, textAlign: 'center', letterSpacing: 2, textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  
  // Stats Card
  statsCard: { padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 3, borderBottomWidth: 6, elevation: 5 },
  statsHeader: { fontSize: 14, fontWeight: '900', textAlign: 'center', marginBottom: 15, letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 20, fontWeight: '900', marginTop: 5 },
  statLabel: { fontSize: 10, fontWeight: 'bold' },
  
  divider: { height: 2, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 15 },
  totalScore: { textAlign: 'center', fontSize: 20, fontWeight: '900' },

  // List
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, marginBottom: 12, borderRadius: 15, alignItems: 'center', borderWidth: 2, borderBottomWidth: 5 },
  rankBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontWeight: 'bold', color: '#FFF' },
  name: { fontSize: 16, fontWeight: 'bold', flex: 1, marginLeft: 15 },
  score: { fontSize: 18, fontWeight: '900' }
});