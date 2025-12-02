import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT, SPACING, TEXT } from '../../src/theme/theme';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const userScore = user?.solved ? user.solved.length : 0;
  const userName = user?.username || "You";

  // --- 1. STATS BREAKDOWN LOGIC ---
  const stats = useMemo(() => {
    let counts = {
      wordfinder: 0,
      hangman: 0,
      trivia: 0,
      tictactoe: 0,
      flags: 0
    };

    const solvedList = user?.solved || [];

    solvedList.forEach((item: any) => {
      // Handle both old string format and new object format
      const text = typeof item === 'string' ? item : item.text;
      
      if (text.startsWith("Solved Hangman")) {
        counts.hangman++;
      } else if (text.startsWith("Beat TicTacToe")) {
        counts.tictactoe++;
      } else if (text.startsWith("Q:")) {
        counts.trivia++;
      } else if (text.startsWith("Flag Master")) {
        counts.flags++;
      } else {
        // Default assumption: It's a Word Finder fact
        counts.wordfinder++;
      }
    });

    return counts;
  }, [user?.solved]);

  // Mock Bots for Leaderboard
  const leaderboardData = useMemo(() => {
    const bots = [
      { id: '1', name: 'PuzzleMaster', score: 42 },
      { id: '2', name: 'TriviaKing', score: 30 },
      { id: '3', name: 'FactFinder', score: 12 },
      { id: '4', name: 'GeoGuesser', score: 8 },
    ];
    const all = [...bots, { id: 'user', name: `${userName} (You)`, score: userScore, isUser: true }];
    return all.sort((a, b) => b.score - a.score);
  }, [userScore, userName]);

  const userRank = leaderboardData.findIndex(p => p.isUser) + 1;

  // Render List Item
  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={[
      styles.row, 
      { 
        backgroundColor: item.isUser ? (isDark ? '#334155' : '#FFFBE6') : themeColors.card,
        borderColor: item.isUser ? themeColors.primary : themeColors.border,
        borderBottomColor: themeColors.shadow
      }
    ]}>
      <View style={[styles.rankBadge, { backgroundColor: themeColors.border }]}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <Text style={[TEXT.body, { flex: 1, marginLeft: SPACING.md, color: item.isUser ? themeColors.primary : themeColors.text, fontWeight: 'bold' }]}>
        {item.name}
      </Text>
      <Text style={[TEXT.header, { fontSize: 18, color: themeColors.primary }]}>{item.score}</Text>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={{ flex: 1, backgroundColor: themeColors.background }}
      imageStyle={{ opacity: isDark ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={[TEXT.header, { color: themeColors.primary, textAlign: 'center', marginBottom: SPACING.lg, fontSize: 28 }]}>
          LEADERBOARD
        </Text>

        {/* --- 2. STATS BREAKDOWN CARD --- */}
        <View style={[LAYOUT.card3D, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderBottomColor: themeColors.shadow, marginBottom: SPACING.lg }]}>
          <Text style={[TEXT.label, { textAlign: 'center', color: themeColors.subText, marginBottom: 15 }]}>
            YOUR GAME BREAKDOWN
          </Text>

          <View style={styles.statsGrid}>
            <StatItem icon="extension-puzzle" count={stats.wordfinder} label="Words" color={themeColors.primary} />
            <StatItem icon="accessibility" count={stats.hangman} label="Hangman" color={themeColors.danger} />
            <StatItem icon="help-buoy" count={stats.trivia} label="Trivia" color="#32CD32" />
            <StatItem icon="grid" count={stats.tictactoe} label="TicTac" color="#4682B4" />
            <StatItem icon="flag" count={stats.flags} label="Flags" color="#FFD700" />
          </View>
        </View>

        {/* --- 3. GLOBAL RANK CARD --- */}
        <View style={[LAYOUT.card3D, { backgroundColor: themeColors.primary, borderColor: '#FFF', marginBottom: SPACING.xl, paddingVertical: 15 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: 12 }}>GLOBAL RANK</Text>
              <Text style={{ color: 'white', fontSize: 32, fontWeight: '900' }}>#{userRank}</Text>
            </View>
            <View style={{ width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: 12 }}>TOTAL WINS</Text>
              <Text style={{ color: 'white', fontSize: 32, fontWeight: '900' }}>{userScore}</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={leaderboardData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ImageBackground>
  );
}

// Helper Component for Icons
const StatItem = ({ icon, count, label, color }: any) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={{ fontSize: 18, fontWeight: '900', color: '#555', marginTop: 2 }}>{count}</Text>
    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg, maxWidth: 600, alignSelf: 'center', width: '100%' },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  statItem: {
    alignItems: 'center',
    width: '18%', // Fits 5 items nicely
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 15,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  rankBadge: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center'
  },
  rankText: { color: 'white', fontWeight: 'bold' }
});