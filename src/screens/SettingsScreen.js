// src/screens/SettingsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, ScrollView, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { user, logout } = useContext(AuthContext);
  
  const { 
    theme, 
    useSystemTheme, 
    toggleSystemTheme, 
    isDarkMode, 
    toggleDarkMode 
  } = useContext(ThemeContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogoutPress = () => {
    setModalVisible(true);
  };

  const confirmLogout = () => {
    setModalVisible(false);
    logout();
  };

  // Dynamic Styles helpers
  const cardStyle = { 
    backgroundColor: theme.card,
    borderColor: theme.primary, // Keep the Orange border even in dark mode
  };
  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- ACCOUNT CARD --- */}
        <View style={[styles.gameCard, cardStyle]}>
          <Text style={styles.cardHeader}>PLAYER ACCOUNT</Text>
          
          <View style={styles.row}>
            <Text style={[styles.label, textStyle]}>USERNAME</Text>
            <Text style={[styles.value, subTextStyle]}>{user?.username}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.row}>
            <Text style={[styles.label, textStyle]}>EMAIL</Text>
            <Text style={[styles.value, subTextStyle]}>{user?.email}</Text>
          </View>
        </View>

        {/* --- APPEARANCE CARD --- */}
        <View style={[styles.gameCard, cardStyle]}>
          <Text style={styles.cardHeader}>VISUALS</Text>
          
          {/* System Theme */}
          <View style={styles.row}>
            <View>
              <Text style={[styles.label, textStyle]}>AUTO THEME</Text>
              <Text style={styles.hint}>Match device settings</Text>
            </View>
            <Switch 
              value={useSystemTheme} 
              onValueChange={toggleSystemTheme} 
              trackColor={{ false: "#767577", true: "#FF8C00" }}
              thumbColor={useSystemTheme ? "#FFF" : "#f4f3f4"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Dark Mode */}
          <View style={[styles.row, useSystemTheme && styles.disabledRow]}>
            <Text style={[styles.label, textStyle]}>DARK MODE</Text>
            <Switch 
              disabled={useSystemTheme}
              value={isDarkMode} 
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#767577", true: "#FF8C00" }}
              thumbColor={isDarkMode ? "#FFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* --- NOTIFICATIONS CARD --- */}
        <View style={[styles.gameCard, cardStyle]}>
          <Text style={styles.cardHeader}>ALERTS</Text>
          <View style={styles.row}>
            <Text style={[styles.label, textStyle]}>PUSH NOTIFICATIONS</Text>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#FF8C00" }}
              thumbColor={notifications ? "#FFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* --- LOGOUT BUTTON (3D Style) --- */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* --- CUSTOM MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={styles.modalTitle}>EXIT GAME?</Text>
            <Text style={[styles.modalMessage, textStyle]}>
              Are you sure you want to sign out?
            </Text>
            
            <View style={styles.modalButtons}>
              {/* Cancel Button */}
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>STAY</Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>LEAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  
  // --- GAME CARD STYLING ---
  gameCard: {
    marginBottom: 25,
    borderRadius: 20,
    padding: 20,
    // 3D Borders
    borderWidth: 3,
    borderBottomWidth: 6, 
    borderBottomColor: '#C06600', // Darker Orange shadow
    
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  
  cardHeader: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: 1
  },
  
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 5 
  },
  
  label: { fontSize: 16, fontWeight: '700' },
  value: { fontSize: 16, fontWeight: '500' },
  hint: { fontSize: 12, color: '#999', marginTop: 2, fontStyle: 'italic' },
  
  divider: { height: 2, marginVertical: 10, opacity: 0.5 },
  disabledRow: { opacity: 0.4 },

  // --- LOGOUT BUTTON ---
  logoutBtn: { 
    backgroundColor: '#FF4500', 
    paddingVertical: 15, 
    borderRadius: 50, 
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    
    // 3D Effect
    borderWidth: 2,
    borderColor: '#FF4500',
    borderBottomWidth: 6,
    borderBottomColor: '#C03500'
  },
  logoutText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  // --- MODAL STYLING ---
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalCard: { 
    width: '85%', 
    borderRadius: 25, 
    padding: 25, 
    alignItems: 'center', 
    elevation: 10,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderBottomColor: '#C06600',
  },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#FF8C00', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 25, fontWeight: '500' },
  
  modalButtons: { flexDirection: 'row', width: '100%', gap: 15 },
  modalBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 15, 
    alignItems: 'center',
    borderBottomWidth: 4,
  },
  
  cancelBtn: { 
    backgroundColor: '#E0E0E0',
    borderBottomColor: '#999'
  },
  confirmBtn: { 
    backgroundColor: '#FF4500',
    borderBottomColor: '#C03500'
  },
  
  cancelText: { color: '#333', fontWeight: '900' },
  confirmText: { color: 'white', fontWeight: '900' }
});