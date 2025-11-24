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
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user?.username}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>
        Facts Collected: <Text style={styles.count}>{(user?.solved || []).length}</Text>
      </Text>
      
      <View style={styles.divider} />

      <FlatList
        data={user?.solved || []}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.factNumber}>#{index + 1}</Text>
            <Text style={styles.factText}>{item}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You haven't solved any puzzles yet!</Text>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    // backgroundColor: '#F0F8FF', <--- REMOVED
  },
  
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.8)', // Added semi-transparent bg for header clarity
    padding: 10,
    borderRadius: 10
  },
  greeting: { fontSize: 16, color: '#666' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#4169E1' },
  
  settingsBtn: { 
    backgroundColor: '#E0E0E0', 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 20, 
    elevation: 2 
  },
  settingsText: { color: '#333', fontWeight: 'bold', fontSize: 14 },

  subHeader: { fontSize: 16, color: '#333', marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.6)', padding: 5, alignSelf: 'flex-start', borderRadius: 5 },
  count: { fontWeight: 'bold', color: '#4169E1' },
  
  divider: { height: 1, backgroundColor: '#ccc', marginBottom: 15 },

  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  factNumber: { fontSize: 12, color: '#999', marginBottom: 5, fontWeight: 'bold' },
  factText: { fontSize: 15, color: '#333', lineHeight: 22 },
  
  emptyText: { textAlign: 'center', color: '#888', marginTop: 50, fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.7)', padding: 10, borderRadius: 10 }
});