// src/screens/SettingsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, ScrollView, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  // 1. Get submitFeedback from Context
  const { user, logout, updateProfile, changePassword, submitFeedback, isOffline } = useContext(AuthContext);
  
  const { 
    theme, 
    useSystemTheme, 
    toggleSystemTheme, 
    isDarkMode, 
    toggleDarkMode 
  } = useContext(ThemeContext);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackSuccessModalVisible, setFeedbackSuccessModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [notifications, setNotifications] = useState(true);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // --- Handlers ---
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

  // --- UPDATED FEEDBACK LOGIC ---
  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert("Empty", "Please write some feedback first!");
      return;
    }

    if (isOffline) {
      Alert.alert("Offline", "Cannot send feedback while offline.");
      return;
    }

    // Call API
    const success = await submitFeedback(feedbackText);
    
    if (success) {
      setFeedbackModalVisible(false);
      setFeedbackText('');
      setFeedbackSuccessModalVisible(true); // Show Success Modal
    } else {
      Alert.alert("Error", "Failed to send feedback. Try again later.");
    }
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  // --- DYNAMIC STYLES ---
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
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
              <Switch value={useSystemTheme} onValueChange={toggleSystemTheme} trackColor={{ false: "#767577", true: theme.primary }} />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={[styles.row, useSystemTheme && styles.disabledRow]}>
              <Text style={[styles.label, textStyle]}>DARK MODE</Text>
              <Switch disabled={useSystemTheme} value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: "#767577", true: theme.primary }} />
            </View>
          </View>

          <View style={[styles.gameCard, cardStyle]}>
            <Text style={[styles.cardHeader, headerStyle]}>ALERTS</Text>
            <View style={styles.row}>
              <Text style={[styles.label, textStyle]}>PUSH NOTIFICATIONS</Text>
              <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#767577", true: theme.primary }} />
            </View>
          </View>

          <View style={[styles.gameCard, cardStyle]}>
            <Text style={[styles.cardHeader, headerStyle]}>SUPPORT</Text>
            <View style={styles.row}>
              <Text style={[styles.label, textStyle]}>HAVE A SUGGESTION?</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setFeedbackModalVisible(true)}>
              <Text style={styles.actionBtnText}>GIVE FEEDBACK</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.logoutBtn, logoutBtnStyle]} onPress={() => setLogoutModalVisible(true)}>
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL: EDIT PROFILE --- */}
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

      {/* --- MODAL: CHANGE PASSWORD --- */}
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

      {/* --- MODAL: FEEDBACK INPUT --- */}
      <Modal visible={feedbackModalVisible} transparent={true} animationType="fade" onRequestClose={() => setFeedbackModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, headerStyle]}>FEEDBACK</Text>
            <Text style={[styles.modalMessage, textStyle]}>Let us know what you think!</Text>
            
            <TextInput 
              style={[styles.input, styles.textArea, inputStyle]} 
              value={feedbackText} 
              onChangeText={setFeedbackText} 
              placeholder="Type your message here..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setFeedbackModalVisible(false)}>
                <Text style={styles.cancelText}>CLOSE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: theme.primary, borderBottomColor: theme.shadow }]} 
                onPress={handleSendFeedback}
              >
                <Text style={styles.confirmText}>SEND</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: FEEDBACK SUCCESS --- */}
      <Modal visible={feedbackSuccessModalVisible} transparent={true} animationType="fade" onRequestClose={() => setFeedbackSuccessModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, cardStyle]}>
            <Text style={[styles.modalTitle, { color: theme.success || theme.primary }]}>RECEIVED!</Text>
            <Text style={[styles.modalMessage, textStyle]}>
              Thank you for your feedback. We read every message.
            </Text>
            
            <TouchableOpacity 
              style={[styles.logoutBtn, { backgroundColor: theme.success || theme.primary, borderColor: theme.success || theme.primary, marginBottom: 0 }]} 
              onPress={() => setFeedbackSuccessModalVisible(false)}
            >
              <Text style={styles.confirmText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: LOGOUT --- */}
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
  gameCard: { marginBottom: 20, borderRadius: 20, padding: 20, borderWidth: 3, borderBottomWidth: 6, elevation: 5 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardHeader: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  editLink: { fontWeight: 'bold', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  label: { fontSize: 16, fontWeight: '700' },
  value: { fontSize: 16, fontWeight: '500' },
  hint: { fontSize: 12, color: '#999', marginTop: 2, fontStyle: 'italic' },
  divider: { height: 2, marginVertical: 10, opacity: 0.5 },
  disabledRow: { opacity: 0.4 },
  actionBtn: { marginTop: 15, backgroundColor: '#E0E0E0', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#999', borderBottomWidth: 3, borderBottomColor: '#777' },
  actionBtnText: { fontWeight: 'bold', color: '#555', fontSize: 12 },
  logoutBtn: { paddingVertical: 15, borderRadius: 50, alignItems: 'center', marginBottom: 30, marginTop: 10, borderWidth: 2, borderBottomWidth: 6 },
  logoutText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', borderRadius: 25, padding: 25, borderWidth: 3, borderBottomWidth: 6, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 25, fontWeight: '500' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 2, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 5 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', width: '100%', gap: 15, marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center', borderBottomWidth: 4 },
  cancelBtn: { backgroundColor: '#E0E0E0', borderBottomColor: '#999' },
  confirmBtn: { /* Dynamic */ }, 
  logoutActionBtn: { backgroundColor: '#FF4500', borderBottomColor: '#C03500' },
  cancelText: { color: '#333', fontWeight: '900' },
  confirmText: { color: 'white', fontWeight: '900' }
});