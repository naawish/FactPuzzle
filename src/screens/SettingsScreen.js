// src/screens/SettingsScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, ScrollView, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { user, logout, updateProfile, changePassword } = useContext(AuthContext);
  const { theme, useSystemTheme, toggleSystemTheme, isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  // --- STATES ---
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Form States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // --- HANDLERS ---

  // Open Profile Edit
  const openProfileModal = () => {
    setEditName(user?.username || '');
    setEditEmail(user?.email || '');
    setProfileModalVisible(true);
  };

  // Save Profile
  const handleSaveProfile = async () => {
    if (!editName || !editEmail) {
      Alert.alert("Error", "Fields cannot be empty");
      return;
    }
    await updateProfile(editName, editEmail);
    setProfileModalVisible(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  // Open Password Edit
  const openPasswordModal = () => {
    setCurrentPass('');
    setNewPass('');
    setPasswordModalVisible(true);
  };

  // Save Password
  const handleSavePassword = async () => {
    if (!currentPass || !newPass) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
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

  // Dynamic Styles
  const cardStyle = { 
    backgroundColor: theme.card,
    borderColor: theme.primary, 
  };
  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };
  const inputStyle = { 
    backgroundColor: theme.background === '#121212' ? '#333' : '#F5F5F5', 
    color: theme.text,
    borderColor: theme.border
  };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* --- ACCOUNT CARD --- */}
          <View style={[styles.gameCard, cardStyle]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeader}>PLAYER ACCOUNT</Text>
              <TouchableOpacity onPress={openProfileModal}>
                <Text style={styles.editLink}>EDIT</Text>
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

          {/* --- SECURITY CARD (NEW) --- */}
          <View style={[styles.gameCard, cardStyle]}>
            <Text style={styles.cardHeader}>SECURITY</Text>
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
            <Text style={styles.cardHeader}>VISUALS</Text>
            
            <View style={styles.row}>
              <View>
                <Text style={[styles.label, textStyle]}>AUTO THEME</Text>
                <Text style={styles.hint}>Match device settings</Text>
              </View>
              <Switch 
                value={useSystemTheme} 
                onValueChange={toggleSystemTheme} 
                trackColor={{ false: "#767577", true: "#FF8C00" }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={[styles.row, useSystemTheme && styles.disabledRow]}>
              <Text style={[styles.label, textStyle]}>DARK MODE</Text>
              <Switch 
                disabled={useSystemTheme}
                value={isDarkMode} 
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#767577", true: "#FF8C00" }}
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
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL: EDIT PROFILE --- */}
      <Modal visible={profileModalVisible} transparent={true} animationType="fade" onRequestClose={() => setProfileModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={styles.modalTitle}>EDIT PROFILE</Text>
            
            <Text style={[styles.inputLabel, textStyle]}>USERNAME</Text>
            <TextInput style={[styles.input, inputStyle]} value={editName} onChangeText={setEditName} />

            <Text style={[styles.inputLabel, textStyle]}>EMAIL</Text>
            <TextInput style={[styles.input, inputStyle]} value={editEmail} onChangeText={setEditEmail} autoCapitalize="none" />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleSaveProfile}>
                <Text style={styles.confirmText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: CHANGE PASSWORD --- */}
      <Modal visible={passwordModalVisible} transparent={true} animationType="fade" onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={styles.modalTitle}>CHANGE PASSWORD</Text>
            
            <Text style={[styles.inputLabel, textStyle]}>CURRENT PASSWORD</Text>
            <TextInput 
              style={[styles.input, inputStyle]} 
              value={currentPass} 
              onChangeText={setCurrentPass} 
              secureTextEntry 
              placeholder="Enter current password"
              placeholderTextColor="#999"
            />

            <Text style={[styles.inputLabel, textStyle]}>NEW PASSWORD</Text>
            <TextInput 
              style={[styles.input, inputStyle]} 
              value={newPass} 
              onChangeText={setNewPass} 
              secureTextEntry 
              placeholder="Enter new password"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleSavePassword}>
                <Text style={styles.confirmText}>UPDATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: LOGOUT --- */}
      <Modal visible={logoutModalVisible} transparent={true} animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={styles.modalTitle}>EXIT GAME?</Text>
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
  
  // --- CARDS ---
  gameCard: {
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderBottomWidth: 6, 
    borderBottomColor: '#C06600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 5
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardHeader: { fontSize: 14, color: '#FF8C00', fontWeight: '900', letterSpacing: 1 },
  editLink: { color: '#4682B4', fontWeight: 'bold', fontSize: 12 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  label: { fontSize: 16, fontWeight: '700' },
  value: { fontSize: 16, fontWeight: '500' },
  hint: { fontSize: 12, color: '#999', marginTop: 2, fontStyle: 'italic' },
  divider: { height: 2, marginVertical: 10, opacity: 0.5 },
  disabledRow: { opacity: 0.4 },

  // --- BUTTONS ---
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

  // --- MODALS ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { 
    width: '85%', 
    borderRadius: 25, 
    padding: 25, 
    borderWidth: 3,
    borderBottomWidth: 6,
    borderBottomColor: '#C06600',
    elevation: 10
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FF8C00', marginBottom: 20, textAlign: 'center' },
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
  confirmBtn: { backgroundColor: '#4682B4', borderBottomColor: '#2F5D85' }, // Blue for Save
  logoutActionBtn: { backgroundColor: '#FF4500', borderBottomColor: '#C03500' }, // Red for Logout
  
  cancelText: { color: '#333', fontWeight: '900' },
  confirmText: { color: 'white', fontWeight: '900' }
});