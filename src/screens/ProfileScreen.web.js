// src/screens/ProfileScreen.web.js
import React, { useContext, useMemo } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// NOTE: ViewShot and Sharing removed for Web compatibility

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation(); 

  const sections = useMemo(() => {
    const rawData = user?.solved || [];
    const groups = {};

    rawData.forEach(item => {
      let factObj = typeof item === 'string' ? { text: item, timestamp: 0 } : { text: item.text, timestamp: new Date(item.date).getTime() };
      
      let dateLabel = "Previous Collection";
      if (typeof item !== 'string') {
        const d = new Date(item.date);
        if (d.toDateString() === new Date().toDateString()) dateLabel = "Today";
        else dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(factObj);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Today') return -1; 
      if (b === 'Today') return 1;
      return new Date(b) - new Date(a); 
    });

    return sortedKeys.map(date => ({
      title: date,
      data: groups[date].sort((a, b) => b.timestamp - a.timestamp).map(i => i.text) 
    }));
  }, [user?.solved]);

  const handleShare = () => {
    alert("Sharing is only available on the mobile app!");
  };

  const playerCardStyle = { backgroundColor: theme.card, borderColor: theme.primary, borderBottomColor: theme.shadow };
  const factCardStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      {/* WEB CONTAINER */}
      <View style={styles.webContainer}>
        
        {/* HEADER */}
        <View style={[styles.playerCard, playerCardStyle]}>
          <View>
            <Text style={[styles.greeting, { color: theme.primary }]}>PLAYER PROFILE</Text>
            <Text style={[styles.username, textStyle]}>{user?.username}</Text>
            <Text style={[styles.stats, subTextStyle]}>Total Solved: {(user?.solved || []).length}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <Text style={styles.dividerText}>TIMELINE</Text>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item + index}
          contentContainerStyle={{ paddingBottom: 20 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.timelineHeader}>
              <View style={[styles.dateBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.dateText}>{title}</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.timelineRow}>
              <View style={styles.timelineGuide}>
                <View style={[styles.line, { backgroundColor: theme.border }]} />
                <View style={[styles.dot, { backgroundColor: theme.primary, borderColor: theme.background }]} />
              </View>
              <View style={[styles.card, factCardStyle]}>
                <View style={styles.cardHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <Text style={[styles.factNumber, { color: theme.primary }]}>PUZZLE SOLVED</Text>
                    <View style={[styles.badge, { backgroundColor: theme.success }]} />
                  </View>
                  <TouchableOpacity onPress={handleShare} style={{cursor: 'pointer'}}>
                    <Ionicons name="share-social" size={24} color={theme.subText} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.factText, textStyle]}>{item}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  
  webContainer: {
    width: '100%',
    maxWidth: 600, // Central column for Web
    alignSelf: 'center',
    padding: 20
  },

  playerCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: 20, padding: 30, borderRadius: 20, borderWidth: 3, borderBottomWidth: 6
  },
  greeting: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  username: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase' },
  stats: { marginTop: 5, fontWeight: '600', fontSize: 16 },
  
  settingsBtn: { backgroundColor: '#E0E0E0', width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 15, borderWidth: 2, borderColor: '#999', borderBottomWidth: 4, cursor: 'pointer' },
  settingsText: { fontSize: 30 },

  divider: { alignItems: 'center', marginBottom: 25 },
  dividerText: { color: '#FFF', fontWeight: '900', fontSize: 16, textShadowColor: 'black', textShadowRadius: 2 },

  timelineHeader: { alignItems: 'center', marginBottom: 20 },
  dateBadge: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  dateText: { color: 'white', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },

  timelineRow: { flexDirection: 'row', marginBottom: 20 },
  timelineGuide: { width: 40, alignItems: 'center', marginRight: 15 },
  line: { position: 'absolute', top: -20, bottom: -20, width: 4, borderRadius: 2, opacity: 0.5 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 3, marginTop: 30, zIndex: 1 },

  card: { flex: 1, padding: 20, borderRadius: 15, borderWidth: 3, borderBottomWidth: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  factNumber: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  badge: { width: 12, height: 12, borderRadius: 6 },
  factText: { fontSize: 18, lineHeight: 26, fontWeight: '500' }
});