// src/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // <--- IMPORT THIS
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); // <--- USE THEME
  const navigation = useNavigation(); 

  // Dynamic Styles
  const playerCardStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.primary, 
    borderBottomColor: theme.shadow 
  };
  const factCardStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.border,  // <--- DYNAMIC BORDER
    borderBottomColor: theme.shadow 
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
      {/* Player Card */}
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
          // Fact Card
          <View style={[styles.card, factCardStyle]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.factNumber, { color: theme.primary }]}>FACT #{index + 1}</Text>
              <View style={styles.badge} />
            </View>
            <Text style={[styles.factText, textStyle]}>{item}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No facts collected yet.</Text>
            <Text style={styles.emptySub}>Play the daily puzzle to fill this book!</Text>
          </View>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  
  playerCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: 20, padding: 20, borderRadius: 20, borderWidth: 3, borderBottomWidth: 6
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

  card: { 
    padding: 20, borderRadius: 15, marginBottom: 15, borderWidth: 2, borderBottomWidth: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  factNumber: { fontSize: 12, fontWeight: '900' },
  badge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#32CD32' },
  factText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  
  emptyContainer: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 30, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySub: { fontSize: 14, color: '#666', marginTop: 5 }
});