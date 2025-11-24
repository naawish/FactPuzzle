// src/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hello, {user?.username}!</Text>
      <Text style={styles.subHeader}>Facts You Collected: {(user?.solved || []).length}</Text>
      
      <FlatList
        data={user?.solved || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.factText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F0F8FF' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#4169E1', marginBottom: 5 },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  factText: { fontSize: 14, color: '#333', lineHeight: 20 }
});