// src/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation(); 

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* 1. Player Card Header */}
      <View style={styles.playerCard}>
        <View>
          <Text style={styles.greeting}>PLAYER PROFILE</Text>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.stats}>Facts Collected: {(user?.solved || []).length}</Text>
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
          // 2. Fact Card
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.factNumber}>FACT #{index + 1}</Text>
              <View style={styles.badge} />
            </View>
            <Text style={styles.factText}>{item}</Text>
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
  container: { 
    flex: 1, 
    padding: 20, 
  },
  
  // --- PLAYER CARD ---
  playerCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: '#FFF', 
    padding: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#4169E1', // Royal Blue Border
    borderBottomWidth: 6,   // 3D Effect
    borderBottomColor: '#27408B',
  },
  greeting: { fontSize: 12, color: '#4169E1', fontWeight: 'bold', marginBottom: 2 },
  username: { fontSize: 26, fontWeight: '900', color: '#333', textTransform: 'uppercase' },
  stats: { marginTop: 5, color: '#666', fontWeight: '600' },
  
  settingsBtn: { 
    backgroundColor: '#E0E0E0', 
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15, 
    borderWidth: 2,
    borderColor: '#999',
    borderBottomWidth: 4,
    borderBottomColor: '#777'
  },
  settingsText: { fontSize: 24 },

  // --- DIVIDER ---
  divider: { alignItems: 'center', marginBottom: 15 },
  dividerText: { color: '#FFF', fontWeight: '900', fontSize: 14, textShadowColor: 'black', textShadowRadius: 2 },

  // --- FACT CARD ---
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 15, 
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderBottomWidth: 5,
    borderBottomColor: '#C06600'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  factNumber: { fontSize: 12, color: '#FF8C00', fontWeight: '900' },
  badge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#32CD32' },
  factText: { fontSize: 16, color: '#333', lineHeight: 24, fontWeight: '500' },
  
  emptyContainer: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 30, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySub: { fontSize: 14, color: '#666', marginTop: 5 }
});