// src/screens/SettingsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, ScrollView, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { user, logout, updateProfile, changePassword } = useContext(AuthContext);
  
  // Access the new Theme Palette
  const { theme, useSystemTheme, toggleSystemTheme, isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  // States
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Form States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // --- Handlers (Same as before) ---
  const openProfileModal = () => {
    setEditName(user?.username || '');
    setEditEmail(user?.email || '');
    setProfileModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName || !editEmail) { Alert.alert("Error", "Fields cannot be empty"); return; }
    await updateProfile(editName, editEmail);
    setProfileModalVisible(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const openPasswordModal = () => {
    setCurrentPass('');
    setNewPass('');
    setPasswordModalVisible(true);
  };

  const handleSavePassword = async () => {
    if (!currentPass || !newPass) { Alert.alert("Error", "Please fill in all fields"); return; }
    const success = await changePassword(currentPass, newPass);
    if (success) {
      setPasswordModalVisible(false);
      Alert.alert("Success", "Password changed successfully!");
    } else {
      Alert.alert("Error", "Current password is incorrect.");
    }
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  // --- DYNAMIC STYLES ---
  // These use the Context variables to switch colors automatically
  const cardStyle = { 
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderBottomColor: theme.shadow
  };
  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };
  const headerStyle = { color: theme.primary };
  const inputStyle = { 
    backgroundColor: theme.background === '#0F172A' ? '#334155' : '#F5F5F5', 
    color: theme.text,
    borderColor: theme.border
  };

  return (
    <ImageBackground 
      // Note: You might want a separate dark background image in the future!
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]} 
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }} // Fade image in dark mode
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* --- ACCOUNT CARD --- */}
          <View style={[styles.gameCard, cardStyle]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardHeader, headerStyle]}>PLAYER ACCOUNT</Text>
              <TouchableOpacity onPress={openProfileModal}>
                <Text style={[styles.editLink, { color: theme.primary }]}>EDIT</Text>
              </TouchableOpacity>
            </View>
            
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

          {/* --- SECURITY CARD --- */}
          <View style={[styles.gameCard, cardStyle]}>
            <Text style={[styles.cardHeader, headerStyle]}>SECURITY</Text>
            <View style={styles.row}>
              <Text style={[styles.label, textStyle]}>PASSWORD</Text>
              <Text style={[styles.value, subTextStyle]}>••••••••</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={openPasswordModal}>
              <Text style={styles.actionBtnText}>CHANGE PASSWORD</Text>
            </TouchableOpacity>
          </View>

          {/* --- APPEARANCE CARD --- */}
          <View style={[styles.gameCard, cardStyle]}>
            <Text style={[styles.cardHeader, headerStyle]}>VISUALS</Text>
            <View style={styles.row}>
              <View>
                <Text style={[styles.label, textStyle]}>AUTO THEME</Text>
                <Text style={styles.hint}>Match device settings</Text>
              </View>
              <Switch 
                value={useSystemTheme} 
                onValueChange={toggleSystemTheme} 
                trackColor={{ false: "#767577", true: theme.primary }}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={[styles.row, useSystemTheme && styles.disabledRow]}>
              <Text style={[styles.label, textStyle]}>DARK MODE</Text>
              <Switch 
                disabled={useSystemTheme}
                value={isDarkMode} 
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#767577", true: theme.primary }}
              />
            </View>
          </View>

          {/* --- LOGOUT --- */}
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL REUSE STYLES --- */}
      {/* (We apply cardStyle to modals to match the theme) */}

      <Modal visible={profileModalVisible} transparent={true} animationType="fade" onRequestClose={() => setProfileModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, headerStyle]}>EDIT PROFILE</Text>
            <Text style={[styles.inputLabel, textStyle]}>USERNAME</Text>
            <TextInput style={[styles.input, inputStyle]} value={editName} onChangeText={setEditName} placeholderTextColor="#999"/>
            <Text style={[styles.inputLabel, textStyle]}>EMAIL</Text>
            <TextInput style={[styles.input, inputStyle]} value={editEmail} onChangeText={setEditEmail} autoCapitalize="none" placeholderTextColor="#999"/>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: theme.primary, borderBottomColor: theme.shadow }]} onPress={handleSaveProfile}>
                <Text style={styles.confirmText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={passwordModalVisible} transparent={true} animationType="fade" onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, headerStyle]}>CHANGE PASSWORD</Text>
            <Text style={[styles.inputLabel, textStyle]}>CURRENT PASSWORD</Text>
            <TextInput style={[styles.input, inputStyle]} value={currentPass} onChangeText={setCurrentPass} secureTextEntry placeholderTextColor="#999"/>
            <Text style={[styles.inputLabel, textStyle]}>NEW PASSWORD</Text>
            <TextInput style={[styles.input, inputStyle]} value={newPass} onChangeText={setNewPass} secureTextEntry placeholderTextColor="#999"/>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: theme.primary, borderBottomColor: theme.shadow }]} onPress={handleSavePassword}>
                <Text style={styles.confirmText}>UPDATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={logoutModalVisible} transparent={true} animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, headerStyle]}>EXIT GAME?</Text>
            <Text style={[styles.modalMessage, textStyle]}>Are you sure you want to sign out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.cancelText}>STAY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.logoutActionBtn]} onPress={confirmLogout}>
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
  
  // Game Card structure (Colors are dynamic now)
  gameCard: {
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderBottomWidth: 6, 
    elevation: 5
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardHeader: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  editLink: { fontWeight: 'bold', fontSize: 12 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  label: { fontSize: 16, fontWeight: '700' },
  value: { fontSize: 16, fontWeight: '500' },
  hint: { fontSize: 12, color: '#999', marginTop: 2, fontStyle: 'italic' },
  divider: { height: 2, marginVertical: 10, opacity: 0.5 },
  disabledRow: { opacity: 0.4 },

  actionBtn: {
    marginTop: 15,
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderBottomWidth: 3,
    borderBottomColor: '#777'
  },
  actionBtnText: { fontWeight: 'bold', color: '#555', fontSize: 12 },

  logoutBtn: { 
    backgroundColor: '#FF4500', 
    paddingVertical: 15, 
    borderRadius: 50, 
    alignItems: 'center',
    marginBottom: 30, 
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FF4500',
    borderBottomWidth: 6,
    borderBottomColor: '#C03500'
  },
  logoutText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { 
    width: '85%', 
    borderRadius: 25, 
    padding: 25, 
    borderWidth: 3,
    borderBottomWidth: 6,
    elevation: 10
  },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 25, fontWeight: '500' },
  
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  input: { 
    borderWidth: 2, 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16,
    marginBottom: 5
  },

  modalButtons: { flexDirection: 'row', width: '100%', gap: 15, marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center', borderBottomWidth: 4 },
  
  cancelBtn: { backgroundColor: '#E0E0E0', borderBottomColor: '#999' },
  confirmBtn: { /* Dynamic Color */ }, 
  logoutActionBtn: { backgroundColor: '#FF4500', borderBottomColor: '#C03500' },
  
  cancelText: { color: '#333', fontWeight: '900' },
  confirmText: { color: 'white', fontWeight: '900' }
});