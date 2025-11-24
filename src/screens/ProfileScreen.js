// src/screens/ProfileScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Instead of an Alert, we just show the Modal
  const handleLogoutPress = () => {
    setModalVisible(true);
  };

  // 2. The actual logout action
  const confirmLogout = () => {
    setModalVisible(false);
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user?.username}</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
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

      {/* --- CUSTOM LOGOUT MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leaving So Soon?</Text>
            <Text style={styles.modalMessage}>Are you sure you want to sign out of Fact Puzzle?</Text>
            
            <View style={styles.modalButtons}>
              {/* Cancel Button */}
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Stay</Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* --------------------------- */}
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
  
  emptyText: { textAlign: 'center', color: '#888', marginTop: 50, fontStyle: 'italic' },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent dark background
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 10
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelBtn: {
    backgroundColor: '#E0E0E0',
  },
  confirmBtn: {
    backgroundColor: '#FF4500',
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});