// src/screens/ProfileScreen.js
import React, { useContext, useState, useRef, useMemo } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, ImageBackground, Image, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext);
  const navigation = useNavigation(); 

  const [sharingFact, setSharingFact] = useState("Loading...");
  const viewShotRef = useRef();

  // --- DATA PROCESSING: Group by Date ---
  const sections = useMemo(() => {
    const rawData = user?.solved || [];
    const groups = {};

    rawData.forEach(item => {
      let factText = "";
      let dateLabel = "Previous Collection"; // Default for old data

      // Handle Old Data (String) vs New Data (Object)
      if (typeof item === 'string') {
        factText = item;
      } else {
        factText = item.text;
        // Format Date: "Wed, Nov 26"
        const d = new Date(item.date);
        dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        // Check if Today
        if (d.toDateString() === new Date().toDateString()) dateLabel = "Today";
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(factText);
    });

    // Convert to SectionList format
    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date]
    }));
  }, [user?.solved]);

  // --- SHARE FUNCTION ---
  const handleShare = async (factText) => {
    setSharingFact(factText);
    setTimeout(async () => {
      try {
        const uri = await viewShotRef.current.capture();
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert("Error", "Sharing is not available");
          return;
        }
        await Sharing.shareAsync(uri);
      } catch (error) {
        Alert.alert("Error", "Could not generate share image.");
      }
    }, 100); 
  };

  // Styles
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
      {/* HIDDEN SHARE TEMPLATE */}
      <View style={{ position: 'absolute', left: -1000, top: 0 }}>
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
          <View style={[styles.shareTemplate, { backgroundColor: theme.background, borderColor: theme.primary }]}>
            <View style={styles.shareHeader}>
              <Image source={require('../../assets/app-icon.png')} style={styles.shareIcon} />
              <Image source={isDark ? require('../../assets/Title-Dark.png') : require('../../assets/Title-Light.png')} style={styles.shareTitleImg} />
            </View>
            <View style={[styles.shareContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.shareText, { color: theme.text }]}>"{sharingFact}"</Text>
            </View>
            <Text style={[styles.shareFooter, { color: theme.primary }]}>Play Fact Puzzle!</Text>
          </View>
        </ViewShot>
      </View>

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

      {/* TIMELINE SECTION LIST */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item + index}
        contentContainerStyle={{ paddingBottom: 20 }}
        
        // 1. The Date Header
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.timelineHeader}>
            <View style={[styles.dateBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.dateText}>{title}</Text>
            </View>
          </View>
        )}

        // 2. The Fact Card with Timeline Line
        renderItem={({ item, index, section }) => (
          <View style={styles.timelineRow}>
            
            {/* Left Side: The Line & Dot */}
            <View style={styles.timelineGuide}>
              <View style={[styles.line, { backgroundColor: theme.border }]} />
              <View style={[styles.dot, { backgroundColor: theme.primary, borderColor: theme.background }]} />
            </View>

            {/* Right Side: The Card */}
            <View style={[styles.card, factCardStyle]}>
              <View style={styles.cardHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Text style={[styles.factNumber, { color: theme.primary }]}>PUZZLE SOLVED</Text>
                  <View style={[styles.badge, { backgroundColor: theme.success }]} />
                </View>
                <TouchableOpacity onPress={() => handleShare(item)}>
                  <Ionicons name="share-social" size={24} color={theme.subText} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.factText, textStyle]}>{item}</Text>
            </View>
          </View>
        )}

        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, textStyle]}>No facts yet.</Text>
            <Text style={[styles.emptySub, subTextStyle]}>Start solving puzzles!</Text>
          </View>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingBottom: 0 },
  
  playerCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: 20, padding: 20, borderRadius: 20, 
    borderWidth: 3, borderBottomWidth: 6
  },
  greeting: { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  username: { fontSize: 26, fontWeight: '900', textTransform: 'uppercase' },
  stats: { marginTop: 5, fontWeight: '600' },
  
  settingsBtn: { 
    backgroundColor: '#E0E0E0', width: 50, height: 50, justifyContent: 'center', alignItems: 'center', 
    borderRadius: 15, borderWidth: 2, borderColor: '#999', borderBottomWidth: 4, borderBottomColor: '#777'
  },
  settingsText: { fontSize: 24 },

  divider: { alignItems: 'center', marginBottom: 15 },
  dividerText: { color: '#FFF', fontWeight: '900', fontSize: 14, textShadowColor: 'black', textShadowRadius: 2 },

  // --- TIMELINE STYLES ---
  timelineHeader: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  dateBadge: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  dateText: { color: 'white', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },

  timelineRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineGuide: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  line: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 4,
    borderRadius: 2,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    marginTop: 25, // Align with the card
    zIndex: 1,
  },

  // Fact Card
  card: { 
    flex: 1,
    padding: 15, 
    borderRadius: 15, 
    borderWidth: 3, 
    borderBottomWidth: 6,
    elevation: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  factNumber: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  badge: { width: 10, height: 10, borderRadius: 5 },
  factText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  
  emptyContainer: { padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
  emptyText: { fontSize: 18, fontWeight: 'bold' },
  emptySub: { fontSize: 14, marginTop: 5 },

  // Share (Hidden)
  shareTemplate: { width: 400, padding: 30, alignItems: 'center', borderWidth: 10 },
  shareHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
  shareIcon: { width: 60, height: 60, borderRadius: 15 },
  shareTitleImg: { width: 180, height: 50, resizeMode: 'contain' },
  shareContent: { width: '100%', padding: 30, borderRadius: 20, borderWidth: 4, marginBottom: 20, alignItems: 'center' },
  shareText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', lineHeight: 32, fontStyle: 'italic' },
  shareFooter: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});