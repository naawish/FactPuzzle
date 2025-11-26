// src/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation(); 

  // --- DYNAMIC STYLES ---
  
  // 1. Player Header Card
  const playerCardStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.primary, 
    borderBottomColor: theme.shadow 
  };

  // 2. Solved Puzzle Card (The requested update)
  const factCardStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.border,  
    borderBottomColor: theme.shadow // 3D Shadow effect
  };

  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      {/* Player Header */}
      <View style={[styles.playerCard, playerCardStyle]}>
        <View>
          <Text style={[styles.greeting, { color: theme.primary }]}>PLAYER PROFILE</Text>
          <Text style={[styles.username, textStyle]}>{user?.username}</Text>
          <Text style={[styles.stats, subTextStyle]}>Facts Collected: {(user?.solved || []).length}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <Text style={styles.dividerText}>YOUR COLLECTION</Text>
      </View>

      <FlatList
        data={user?.solved || []}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          
          // --- UPDATED SOLVED CARD ---
          <View style={[styles.card, factCardStyle]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.factNumber, { color: theme.primary }]}>FACT #{index + 1}</Text>
              
              {/* Success Badge (Green) */}
              <View style={[styles.badge, { backgroundColor: theme.success }]} />
            </View>
            <Text style={[styles.factText, textStyle]}>{item}</Text>
          </View>

        )}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, textStyle]}>No facts collected yet.</Text>
            <Text style={[styles.emptySub, subTextStyle]}>Play the daily puzzle to fill this book!</Text>
          </View>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  
  // Header Card
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

  // Fact Card (General Structure)
  card: { 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 15, 
    // 3D Borders handled by dynamic styles
    borderWidth: 3, 
    borderBottomWidth: 6,
    elevation: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  factNumber: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  badge: { width: 12, height: 12, borderRadius: 6 },
  factText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  
  // Empty State
  emptyContainer: { 
    padding: 30, borderRadius: 20, alignItems: 'center', 
    borderWidth: 2, borderStyle: 'dashed' 
  },
  emptyText: { fontSize: 18, fontWeight: 'bold' },
  emptySub: { fontSize: 14, marginTop: 5 }
});