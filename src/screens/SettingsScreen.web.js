// src/screens/SettingsScreen.web.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, ScrollView, ImageBackground, TextInput } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { user, logout, updateProfile, changePassword } = useContext(AuthContext);
  const { theme, useSystemTheme, toggleSystemTheme, isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Handlers
  const openProfileModal = () => {
    setEditName(user?.username || '');
    setEditEmail(user?.email || '');
    setProfileModalVisible(true);
  };
  const handleSaveProfile = async () => {
    if (!editName || !editEmail) return alert("Fields cannot be empty");
    await updateProfile(editName, editEmail);
    setProfileModalVisible(false);
  };
  const openPasswordModal = () => {
    setCurrentPass('');
    setNewPass('');
    setPasswordModalVisible(true);
  };
  const handleSavePassword = async () => {
    if (!currentPass || !newPass) return alert("Please fill in all fields");
    const success = await changePassword(currentPass, newPass);
    if (success) {
      setPasswordModalVisible(false);
      alert("Password changed successfully!");
    } else {
      alert("Error: Current password is incorrect.");
    }
  };
  const confirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  // Styles
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.subText };
  const headerStyle = { color: theme.primary };
  const inputStyle = { backgroundColor: theme.background === '#0F172A' ? '#334155' : '#F5F5F5', color: theme.text, borderColor: theme.border };
  const logoutBtnStyle = { backgroundColor: theme.danger, borderColor: theme.danger, borderBottomColor: theme.dangerShadow };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]} 
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }} 
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CENTERED WEB CONTAINER */}
        <View style={styles.centerWrapper}>
          <View style={styles.webContainer}>

            <View style={[styles.gameCard, cardStyle]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardHeader, headerStyle]}>PLAYER ACCOUNT</Text>
                <TouchableOpacity onPress={openProfileModal} style={{cursor: 'pointer'}}>
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

            <View style={[styles.gameCard, cardStyle]}>
              <Text style={[styles.cardHeader, headerStyle]}>VISUALS</Text>
              <View style={styles.row}>
                <View>
                  <Text style={[styles.label, textStyle]}>AUTO THEME</Text>
                  <Text style={styles.hint}>Match device settings</Text>
                </View>
                <Switch value={useSystemTheme} onValueChange={toggleSystemTheme} />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={[styles.row, useSystemTheme && styles.disabledRow]}>
                <Text style={[styles.label, textStyle]}>DARK MODE</Text>
                <Switch disabled={useSystemTheme} value={isDarkMode} onValueChange={toggleDarkMode} />
              </View>
            </View>

            <View style={[styles.gameCard, cardStyle]}>
              <Text style={[styles.cardHeader, headerStyle]}>ALERTS</Text>
              <View style={styles.row}>
                <Text style={[styles.label, textStyle]}>PUSH NOTIFICATIONS</Text>
                <Switch value={notifications} onValueChange={setNotifications} />
              </View>
            </View>

            <TouchableOpacity style={[styles.logoutBtn, logoutBtnStyle]} onPress={() => setLogoutModalVisible(true)}>
              <Text style={styles.logoutText}>LOG OUT</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>

      {/* --- MODALS --- */}
      <Modal visible={profileModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, headerStyle]}>EDIT PROFILE</Text>
            <Text style={[styles.inputLabel, textStyle]}>USERNAME</Text>
            <TextInput style={[styles.input, inputStyle]} value={editName} onChangeText={setEditName} />
            <Text style={[styles.inputLabel, textStyle]}>EMAIL</Text>
            <TextInput style={[styles.input, inputStyle]} value={editEmail} onChangeText={setEditEmail} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleSaveProfile}>
                <Text style={styles.confirmText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={passwordModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, headerStyle]}>CHANGE PASSWORD</Text>
            <Text style={[styles.inputLabel, textStyle]}>CURRENT PASSWORD</Text>
            <TextInput style={[styles.input, inputStyle]} value={currentPass} onChangeText={setCurrentPass} secureTextEntry />
            <Text style={[styles.inputLabel, textStyle]}>NEW PASSWORD</Text>
            <TextInput style={[styles.input, inputStyle]} value={newPass} onChangeText={setNewPass} secureTextEntry />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleSavePassword}>
                <Text style={styles.confirmText}>UPDATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={logoutModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, headerStyle]}>EXIT GAME?</Text>
            <Text style={[styles.modalMessage, textStyle]}>Are you sure you want to sign out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.cancelText}>STAY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.danger }]} onPress={confirmLogout}>
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
  container: { flex: 1, width: '100%', height: '100%' },
  scrollContent: { flexGrow: 1, padding: 30 },
  
  // Centering Logic
  centerWrapper: { width: '100%', alignItems: 'center' },
  webContainer: { width: '100%', maxWidth: 600 },

  gameCard: { marginBottom: 30, borderRadius: 20, padding: 30, borderWidth: 3, borderBottomWidth: 6, elevation: 5 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardHeader: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  editLink: { fontWeight: 'bold', fontSize: 14, cursor: 'pointer' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { fontSize: 16, fontWeight: '700' },
  value: { fontSize: 16, fontWeight: '500' },
  hint: { fontSize: 12, color: '#999', marginTop: 2, fontStyle: 'italic' },
  divider: { height: 2, marginVertical: 15, opacity: 0.5 },
  disabledRow: { opacity: 0.4 },

  actionBtn: { marginTop: 20, backgroundColor: '#E0E0E0', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#999', borderBottomWidth: 3, cursor: 'pointer' },
  actionBtnText: { fontWeight: 'bold', color: '#555', fontSize: 14 },

  logoutBtn: { paddingVertical: 18, borderRadius: 50, alignItems: 'center', marginBottom: 30, marginTop: 20, borderWidth: 2, borderBottomWidth: 6, cursor: 'pointer' },
  logoutText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 500, borderRadius: 25, padding: 40, borderWidth: 3, borderBottomWidth: 6, elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  modalMessage: { fontSize: 18, textAlign: 'center', marginBottom: 30, fontWeight: '500' },
  
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 2, borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 5, outlineStyle: 'none' },

  modalButtons: { flexDirection: 'row', width: '100%', gap: 20, marginTop: 30 },
  modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 15, alignItems: 'center', cursor: 'pointer' },
  
  cancelBtn: { backgroundColor: '#E0E0E0' },
  cancelText: { color: '#333', fontWeight: '900' },
  confirmText: { color: 'white', fontWeight: '900' }
});