import React, { useMemo, useState, useRef } from 'react';
import { View, Text, SectionList, StyleSheet, ImageBackground, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT, SPACING, TEXT } from '../../src/theme/theme';
import { Button3D } from '../../src/components/ui/Button3D';

// --- SHARING LIBRARIES ---
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const [sharingFact, setSharingFact] = useState("Loading...");
  const viewShotRef = useRef<any>(null);

  // --- DATA PROCESSING ---
  const sections = useMemo(() => {
    const rawData = user?.solved || [];
    const groups: Record<string, any[]> = {};

    rawData.forEach((item: any) => {
      let factText = "";
      let timestamp = 0;

      if (typeof item === 'string') {
        factText = item;
      } else {
        factText = item.text;
        timestamp = new Date(item.date).getTime();
      }

      // Filter out Game Win messages
      if (factText.startsWith("Solved Hangman") || factText.startsWith("Beat TicTacToe")) return;

      // Date Grouping
      let dateLabel = "Previous Collection";
      if (timestamp > 0) {
        const d = new Date(timestamp);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) dateLabel = "Today";
        else dateLabel = d.toLocaleDateString();
      }

      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push({ text: factText, timestamp });
    });

    // Sort Groups and Items
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      return a.localeCompare(b); // Fallback sort
    });

    return sortedKeys.map(date => ({
      title: date,
      data: groups[date].sort((a, b) => b.timestamp - a.timestamp).map(i => i.text)
    }));
  }, [user?.solved]);

  // --- SHARE HANDLER ---
  const handleShare = async (factText: string) => {
    if (Platform.OS === 'web') {
      alert("Sharing is only available on the mobile app.");
      return;
    }

    setSharingFact(factText);

    // Wait 100ms for the hidden view to update with new text
    setTimeout(async () => {
      try {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Error", "Sharing is not available on this device");
            return;
          }
          await Sharing.shareAsync(uri);
        }
      } catch (error) {
        console.error("Share Error", error);
        Alert.alert("Error", "Could not generate image.");
      }
    }, 100);
  };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={{ flex: 1, backgroundColor: themeColors.background }}
      imageStyle={{ opacity: isDark ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        
        {/* --- HIDDEN SHARE TEMPLATE --- */}
        {/* Positioned off-screen but rendered so ViewShot can see it */}
        <View style={{ position: 'absolute', left: -3000, top: 0 }}>
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
            <View style={[styles.shareCard, { backgroundColor: themeColors.background, borderColor: themeColors.primary }]}>
              <View style={{flexDirection:'row', alignItems:'center', marginBottom: 20, gap: 15}}>
                <Image source={require('../../assets/app-icon.png')} style={{width:60, height:60, borderRadius:15}} />
                <Image 
                  source={isDark ? require('../../assets/Title-Dark.png') : require('../../assets/Title-Light.png')} 
                  style={{width:180, height:50, resizeMode:'contain'}} 
                />
              </View>
              <View style={{ backgroundColor: themeColors.card, padding: 30, borderRadius: 20, borderWidth: 3, borderColor: themeColors.border, width: '100%', minHeight: 150, justifyContent: 'center' }}>
                 <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: themeColors.text, fontStyle: 'italic' }}>
                   "{sharingFact}"
                 </Text>
              </View>
              <Text style={{ marginTop: 20, fontSize: 18, fontWeight: '900', color: themeColors.primary, textTransform: 'uppercase' }}>
                PLAY FACT PUZZLE!
              </Text>
            </View>
          </ViewShot>
        </View>
        {/* ----------------------------- */}

        {/* Profile Header */}
        <View style={[LAYOUT.card3D, { backgroundColor: themeColors.card, borderColor: themeColors.primary, borderBottomColor: themeColors.shadow }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[TEXT.label, { color: themeColors.primary }]}>PLAYER PROFILE</Text>
              <Text style={[TEXT.header, { color: themeColors.text }]}>{user?.username}</Text>
              <Text style={{ color: themeColors.subText }}>Facts: {(user?.solved || []).length}</Text>
            </View>
            <Button3D label="⚙️" size="sm" variant="neutral" onPress={() => router.push('/(tabs)/settings')} style={{ minWidth: 60 }} />
          </View>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ alignItems: 'center', marginVertical: SPACING.md }}>
              <View style={{ backgroundColor: themeColors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{title}</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.factCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderBottomColor: themeColors.shadow }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Text style={{ color: themeColors.primary, fontWeight: 'bold', fontSize: 12 }}>FACT UNLOCKED</Text>
                
                {/* Share Button */}
                <TouchableOpacity onPress={() => handleShare(item)}>
                  <Ionicons name="share-social" size={24} color={themeColors.subText} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: themeColors.text, fontSize: 15, lineHeight: 22 }}>{item}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center', opacity: 0.5 }}>
              <Text style={{ color: themeColors.text, fontWeight: 'bold' }}>No facts yet.</Text>
              <Text style={{ color: themeColors.subText }}>Solve puzzles to fill your book!</Text>
            </View>
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg, maxWidth: 600, alignSelf: 'center', width: '100%' },
  factCard: {
    padding: SPACING.lg,
    borderRadius: 15,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginBottom: SPACING.md
  },
  shareCard: {
    width: 450,
    padding: 40,
    alignItems: 'center',
    borderWidth: 10,
    borderRadius: 30
  }
});