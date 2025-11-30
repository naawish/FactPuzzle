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

  // Mock Data + User
  const leaderboardData = useMemo(() => {
    const bots = [
      { id: '1', name: 'PuzzleMaster', score: 42 },
      { id: '2', name: 'TriviaKing', score: 30 },
      { id: '3', name: 'FactFinder', score: 12 },
    ];
    const all = [...bots, { id: 'user', name: `${userName} (You)`, score: userScore, isUser: true }];
    return all.sort((a, b) => b.score - a.score);
  }, [userScore, userName]);

  const userRank = leaderboardData.findIndex(p => p.isUser) + 1;

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

        {/* Stats Card */}
        <View style={[LAYOUT.card3D, { backgroundColor: themeColors.primary, borderColor: '#FFF', marginBottom: SPACING.xl }]}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', textAlign: 'center' }}>YOUR RANK</Text>
          <Text style={{ color: 'white', fontSize: 48, fontWeight: '900', textAlign: 'center' }}>#{userRank}</Text>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Total Solved: {userScore}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg, maxWidth: 600, alignSelf: 'center', width: '100%' },
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