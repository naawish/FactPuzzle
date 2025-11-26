// src/screens/SettingsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Import Theme Context

export default function SettingsScreen() {
  const { user, logout } = useContext(AuthContext);
  
  // Get Theme Data
  const { 
    isDark, 
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

  // Dynamic Styles Wrapper
  const containerStyle = { backgroundColor: theme.background };
  const cardStyle = { backgroundColor: theme.card };
  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView>
        {/* Account Info Section */}
        <View style={[styles.section, cardStyle]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={[styles.label, textStyle]}>Username</Text>
            <Text style={[styles.value, subTextStyle]}>{user?.username}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, textStyle]}>Email</Text>
            <Text style={[styles.value, subTextStyle]}>{user?.email}</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, cardStyle]}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          {/* 1. System Theme Toggle */}
          <View style={styles.row}>
            <View>
              <Text style={[styles.label, textStyle]}>Use System Settings</Text>
              <Text style={styles.hint}>Adjust automatically based on device</Text>
            </View>
            <Switch 
              value={useSystemTheme} 
              onValueChange={toggleSystemTheme} 
              trackColor={{ false: "#767577", true: "#FF8C00" }}
            />
          </View>

          {/* 2. Manual Dark Mode Toggle */}
          {/* Disabled/Opacity lowered if System Theme is ON */}
          <View style={[styles.row, useSystemTheme && styles.disabledRow]}>
            <Text style={[styles.label, textStyle]}>Dark Mode</Text>
            <Switch 
              disabled={useSystemTheme} // Disable if system is on
              value={isDarkMode} 
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#767577", true: "#FF8C00" }}
              // Visual feedback for disabled state
              thumbColor={useSystemTheme ? "#ccc" : "#f4f3f4"} 
            />
          </View>
        </View>

        <View style={[styles.section, cardStyle]}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={[styles.label, textStyle]}>Push Notifications</Text>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#FF8C00" }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* --- LOGOUT MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, cardStyle]}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={[styles.modalMessage, textStyle]}>Are you sure you want to log out?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  
  section: { marginBottom: 20, borderRadius: 10, padding: 15, elevation: 2 },
  sectionTitle: { fontSize: 14, color: '#FF8C00', fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '500' },
  value: { fontSize: 16 },
  hint: { fontSize: 12, color: '#999', marginTop: 2 },

  disabledRow: { opacity: 0.4 }, // Visual style when disabled

  logoutBtn: { 
    backgroundColor: '#FF6347', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 'auto', 
    marginBottom: 20
  },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FF8C00', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 25 },
  modalButtons: { flexDirection: 'row', width: '100%', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  confirmBtn: { backgroundColor: '#FF4500' },
  cancelText: { color: '#333', fontWeight: 'bold' },
  confirmText: { color: 'white', fontWeight: 'bold' }
});