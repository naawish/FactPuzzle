import React, { useMemo, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  SectionList, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Platform 
} from 'react-native';
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

      // --- FILTER: SHOW ONLY TRIVIA & WORD FINDER ---
      // We exclude the "Game Win" messages from other games to keep the timeline clean
      if (
        factText.startsWith("Solved Hangman") || 
        factText.startsWith("Beat TicTacToe") ||
        factText.startsWith("Flag Master")
      ) {
        return; // Skip these
      }

      // Date Grouping
      let dateLabel = "Previous Collection";
      if (timestamp > 0) {
        const d = new Date(timestamp);
        const today = new Date();
        // Reset time components for accurate date comparison
        const dStr = d.toDateString();
        const todayStr = today.toDateString();

        if (dStr === todayStr) {
          dateLabel = "Today";
        } else {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (dStr === yesterday.toDateString()) {
            dateLabel = "Yesterday";
          } else {
            dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          }
        }
      }

      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push({ text: factText, timestamp });
    });

    // Sort Groups and Items
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      if (a === 'Previous Collection') return 1;
      if (b === 'Previous Collection') return -1;
      return 0; // Keep insertion order for others, or parse dates if needed
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

  // Dynamic Styles
  const cardStyles = { 
    backgroundColor: themeColors.card, 
    borderColor: themeColors.primary, 
    borderBottomColor: themeColors.shadow 
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

        {/* --- PROFILE HEADER --- */}
        <View style={[LAYOUT.card3D, cardStyles]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            
            {/* AVATAR SECTION */}
            <View style={{ marginRight: 15 }}>
               {user?.avatarUri ? (
                 <Image 
                    source={{ uri: user.avatarUri }} 
                    style={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 30, 
                      borderWidth: 3, 
                      borderColor: themeColors.primary 
                    }} 
                 />
               ) : (
                 <View style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 30, 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    borderWidth: 2, 
                    borderColor: themeColors.border 
                  }}>
                    <Ionicons name="person" size={30} color={themeColors.subText} />
                 </View>
               )}
            </View>

            {/* TEXT INFO */}
            <View style={{ flex: 1 }}>
              <Text style={[TEXT.label, { color: themeColors.primary }]}>PLAYER PROFILE</Text>
              <Text style={[TEXT.header, { color: themeColors.text, fontSize: 20 }]}>{user?.username}</Text>
              <Text style={{ color: themeColors.subText, fontWeight: '600', marginTop: 4 }}>
                Facts: {sections.reduce((acc, sec) => acc + sec.data.length, 0)}
              </Text>
            </View>
            
            <Button3D label="⚙️" size="sm" variant="neutral" onPress={() => router.push('/(tabs)/settings')} style={{ minWidth: 50 }} />
          </View>
        </View>

        <View style={styles.divider}>
          <Text style={[styles.dividerText, { textShadowColor: isDark ? themeColors.primary : 'black' }]}>TIMELINE</Text>
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
              <Text style={{ color: themeColors.text, fontSize: 15, lineHeight: 22, fontWeight: '500' }}>{item}</Text>
            </View>
          )}
          
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center', opacity: 0.6 }}>
              <Text style={{ color: themeColors.text, fontWeight: 'bold', fontSize: 16 }}>No facts yet.</Text>
              <Text style={{ color: themeColors.subText, marginTop: 5, textAlign: 'center' }}>
                Play WordFinder or Trivia to collect new facts!
              </Text>
            </View>
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg, maxWidth: 600, alignSelf: 'center', width: '100%' },
  
  divider: { alignItems: 'center', marginBottom: 15 },
  dividerText: { color: '#FFF', fontWeight: '900', fontSize: 14, textShadowRadius: 2 },

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