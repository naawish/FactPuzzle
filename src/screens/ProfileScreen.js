// src/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          onPress: () => logout(),
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section with Logout */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user?.username}</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>
        Facts Collected: <Text style={styles.count}>{(user?.solved || []).length}</Text>
      </Text>
      
      <View style={styles.divider} />

      {/* List of Solved Facts */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F0F8FF' },
  
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  greeting: { fontSize: 16, color: '#666' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#4169E1' },
  
  logoutBtn: { 
    backgroundColor: '#FF6347', 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 20, 
    elevation: 2 
  },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  subHeader: { fontSize: 16, color: '#333', marginBottom: 10 },
  count: { fontWeight: 'bold', color: '#4169E1' },
  
  divider: { height: 1, backgroundColor: '#ccc', marginBottom: 15 },

  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  factNumber: { fontSize: 12, color: '#999', marginBottom: 5, fontWeight: 'bold' },
  factText: { fontSize: 15, color: '#333', lineHeight: 22 },
  
  emptyText: { textAlign: 'center', color: '#888', marginTop: 50, fontStyle: 'italic' }
});