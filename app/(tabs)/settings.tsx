import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Switch, Modal, ScrollView, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Button3D } from '../../src/components/ui/Button3D';
import { COLORS, LAYOUT, SPACING, TEXT } from '../../src/theme/theme';

export default function SettingsScreen() {
  const { user, logout, updateProfile, changePassword, submitFeedback } = useAuth();
  const { isDark, useSystemTheme, toggleSystemTheme, isDarkMode, toggleDarkMode } = useTheme();
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  // Modals State
  const [activeModal, setActiveModal] = useState<'none' | 'profile' | 'password' | 'confirmPassword' | 'feedback' | 'logout' | 'success' | 'error'>('none');
  
  // Content State
  const [feedbackText, setFeedbackText] = useState('');
  const [successInfo, setSuccessInfo] = useState({ title: 'SUCCESS!', message: 'Operation completed.' });
  const [errorMessage, setErrorMessage] = useState(''); 

  // Forms
  const [editName, setEditName] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [passData, setPassData] = useState({ current: '', new: '' });
  const [notifications, setNotifications] = useState(true);

  const closeModal = () => setActiveModal('none');

  // --- ACTIONS ---
  const handleUpdateProfile = async () => {
    if (!editName || !editEmail) {
      setErrorMessage("Fields cannot be empty.");
      setActiveModal('error');
      return;
    }
    await updateProfile(editName, editEmail);
    closeModal();
  };

  const handleSavePassword = () => {
    if (!passData.current || !passData.new) {
      setErrorMessage("Please fill in both your current and new password.");
      setActiveModal('error');
      return;
    }
    if (passData.new.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      setActiveModal('error');
      return;
    }
    setActiveModal('confirmPassword');
  };

  const executePasswordChange = async () => {
    const success = await changePassword(passData.current, passData.new);
    
    if (success) {
      setPassData({ current: '', new: '' }); 
      setSuccessInfo({ title: 'SECURED!', message: 'Your password has been updated successfully.' });
      setActiveModal('success');
    } else {
      setErrorMessage("The current password you entered is incorrect.");
      setActiveModal('error');
    }
  };

  const handleFeedback = async () => {
    if (!feedbackText) return;
    const result = await submitFeedback(feedbackText);
    if (result) {
      setFeedbackText('');
      setSuccessInfo({ title: 'RECEIVED!', message: 'Thank you for your feedback. We read every message.' });
      setActiveModal('success');
    } else {
      setErrorMessage("Failed to send feedback. Please try again.");
      setActiveModal('error');
    }
  };

  const handleLogout = async () => {
    closeModal();
    setTimeout(() => {
      logout();
    }, 100); 
  };

  // Styles Helpers
  const cardStyle = { 
    ...LAYOUT.card3D, 
    backgroundColor: themeColors.card, 
    borderColor: themeColors.border, 
    borderBottomColor: themeColors.shadow 
  };
  const textStyle = { color: themeColors.text };
  const inputStyle = { 
    backgroundColor: isDark ? '#334155' : '#F5F5F5', 
    color: themeColors.text, 
    borderColor: themeColors.border,
    borderWidth: 2, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 10
  };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={{ flex: 1, backgroundColor: themeColors.background }}
      imageStyle={{ opacity: isDark ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* ACCOUNT */}
        <View style={cardStyle}>
          <View style={styles.row}>
            <Text style={[TEXT.header, { color: themeColors.primary, fontSize: 14 }]}>PLAYER ACCOUNT</Text>
            <Button3D label="EDIT" size="sm" variant="neutral" onPress={() => {
              setEditName(user?.username || '');
              setEditEmail(user?.email || '');
              setActiveModal('profile');
            }} style={{ minWidth: 70, paddingVertical: 4 }} />
          </View>
          <InfoRow label="USERNAME" value={user?.username || 'Loading...'} colors={themeColors} />
          <InfoRow label="EMAIL" value={user?.email || 'Loading...'} colors={themeColors} />
        </View>

        {/* SECURITY */}
        <View style={cardStyle}>
          <Text style={[TEXT.header, { color: themeColors.primary, fontSize: 14, marginBottom: 10 }]}>SECURITY</Text>
          <InfoRow label="PASSWORD" value="••••••••" colors={themeColors} />
          <Button3D label="CHANGE PASSWORD" size="sm" variant="neutral" onPress={() => setActiveModal('password')} style={{ marginTop: 10 }} />
        </View>

        {/* VISUALS */}
        <View style={cardStyle}>
          <Text style={[TEXT.header, { color: themeColors.primary, fontSize: 14, marginBottom: 10 }]}>VISUALS</Text>
          <SwitchRow label="AUTO THEME" value={useSystemTheme} onValueChange={toggleSystemTheme} colors={themeColors} />
          
          {/* DARK MODE SWITCH */}
          <SwitchRow 
            label="DARK MODE" 
            value={isDarkMode} 
            onValueChange={toggleDarkMode} 
            disabled={useSystemTheme} // If Auto is ON, this is disabled
            colors={themeColors} 
          />
        </View>

        {/* ALERTS */}
        <View style={cardStyle}>
          <Text style={[TEXT.header, { color: themeColors.primary, fontSize: 14, marginBottom: 10 }]}>ALERTS</Text>
          <SwitchRow label="PUSH NOTIFICATIONS" value={notifications} onValueChange={setNotifications} colors={themeColors} />
        </View>

        {/* SUPPORT */}
        <View style={cardStyle}>
          <Text style={[TEXT.header, { color: themeColors.primary, fontSize: 14, marginBottom: 10 }]}>SUPPORT</Text>
          <Button3D label="GIVE FEEDBACK" size="sm" variant="neutral" onPress={() => setActiveModal('feedback')} />
        </View>

        <Button3D label="LOG OUT" variant="danger" onPress={() => setActiveModal('logout')} style={{ marginTop: 20 }} />

      </ScrollView>

      {/* --- MODALS --- */}
      
      {/* 1. EDIT PROFILE */}
      <CustomModal visible={activeModal === 'profile'} colors={themeColors}>
        <Text style={[TEXT.header, { color: themeColors.primary, textAlign: 'center', marginBottom: 20 }]}>EDIT PROFILE</Text>
        <TextInput value={editName} onChangeText={setEditName} style={inputStyle} placeholder="Username" placeholderTextColor={themeColors.subText} />
        <TextInput value={editEmail} onChangeText={setEditEmail} style={inputStyle} placeholder="Email" placeholderTextColor={themeColors.subText} />
        <View style={styles.modalBtns}>
          <Button3D label="CANCEL" variant="neutral" onPress={closeModal} style={{ flex: 1 }} />
          <Button3D label="SAVE" variant="primary" onPress={handleUpdateProfile} style={{ flex: 1 }} />
        </View>
      </CustomModal>

      {/* 2. PASSWORD INPUT */}
      <CustomModal visible={activeModal === 'password'} colors={themeColors}>
        <Text style={[TEXT.header, { color: themeColors.primary, textAlign: 'center', marginBottom: 20 }]}>SECURITY</Text>
        <TextInput value={passData.current} onChangeText={(t) => setPassData({...passData, current: t})} secureTextEntry style={inputStyle} placeholder="Current Password" placeholderTextColor={themeColors.subText} />
        <TextInput value={passData.new} onChangeText={(t) => setPassData({...passData, new: t})} secureTextEntry style={inputStyle} placeholder="New Password" placeholderTextColor={themeColors.subText} />
        <View style={styles.modalBtns}>
          <Button3D label="CANCEL" variant="neutral" onPress={closeModal} style={{ flex: 1 }} />
          <Button3D label="UPDATE" variant="primary" onPress={handleSavePassword} style={{ flex: 1 }} />
        </View>
      </CustomModal>

      {/* 3. PASSWORD CONFIRMATION */}
      <CustomModal visible={activeModal === 'confirmPassword'} colors={themeColors}>
        <Text style={[TEXT.header, { color: themeColors.primary, textAlign: 'center', marginBottom: 10 }]}>CONFIRM CHANGE</Text>
        <Text style={{ color: themeColors.text, textAlign: 'center', marginBottom: 20, fontSize: 16 }}>
          Are you sure you want to change your password?
        </Text>
        <View style={styles.modalBtns}>
          <Button3D label="NO" variant="neutral" onPress={() => setActiveModal('password')} style={{ flex: 1 }} />
          <Button3D label="YES" variant="primary" onPress={executePasswordChange} style={{ flex: 1 }} />
        </View>
      </CustomModal>

      {/* 4. LOGOUT */}
      <CustomModal visible={activeModal === 'logout'} colors={themeColors}>
        <Text style={[TEXT.header, { color: themeColors.danger, textAlign: 'center', marginBottom: 10 }]}>EXIT GAME?</Text>
        <Text style={{ color: themeColors.text, textAlign: 'center', marginBottom: 20 }}>Are you sure you want to sign out?</Text>
        <View style={styles.modalBtns}>
          <Button3D label="STAY" variant="neutral" onPress={closeModal} style={{ flex: 1 }} />
          <Button3D label="LEAVE" variant="danger" onPress={handleLogout} style={{ flex: 1 }} />
        </View>
      </CustomModal>

      {/* 5. SUCCESS */}
      <CustomModal visible={activeModal === 'success'} colors={themeColors}>
        <Text style={[TEXT.header, { color: themeColors.success, textAlign: 'center', marginBottom: 10 }]}>{successInfo.title}</Text>
        <Text style={{ color: themeColors.text, textAlign: 'center', marginBottom: 20 }}>{successInfo.message}</Text>
        <Button3D label="CLOSE" variant="success" onPress={closeModal} />
      </CustomModal>

      {/* 6. ERROR */}
      <CustomModal visible={activeModal === 'error'} colors={themeColors}>
        <Text style={[TEXT.header, { color: themeColors.danger, textAlign: 'center', marginBottom: 10 }]}>OOPS!</Text>
        <Text style={{ color: themeColors.text, textAlign: 'center', marginBottom: 20 }}>{errorMessage}</Text>
        <Button3D 
          label="TRY AGAIN" 
          variant="danger" 
          onPress={() => {
            if (errorMessage.includes("password")) setActiveModal('password');
            else closeModal();
          }} 
        />
      </CustomModal>

      {/* 7. FEEDBACK INPUT */}
      <CustomModal visible={activeModal === 'feedback'} colors={themeColors}>
        <Text style={[TEXT.header, { color: themeColors.primary, textAlign: 'center', marginBottom: 20 }]}>FEEDBACK</Text>
        <TextInput 
          value={feedbackText} onChangeText={setFeedbackText} multiline numberOfLines={4}
          style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]} placeholder="Your thoughts..." placeholderTextColor={themeColors.subText} 
        />
        <View style={styles.modalBtns}>
          <Button3D label="CLOSE" variant="neutral" onPress={closeModal} style={{ flex: 1 }} />
          <Button3D label="SEND" variant="primary" onPress={handleFeedback} style={{ flex: 1 }} />
        </View>
      </CustomModal>

    </ImageBackground>
  );
}

// --- SUB COMPONENTS ---
const InfoRow = ({ label, value, colors }: { label: string, value: string, colors: any }) => (
  <View style={{ marginTop: 10 }}>
    <Text style={[TEXT.label, { color: colors.text }]}>{label}</Text>
    <Text style={{ color: colors.subText, fontSize: 16 }}>{value}</Text>
    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10, opacity: 0.3 }} />
  </View>
);

// FIXED: Added 'disabled={disabled}' to the Switch component
const SwitchRow = ({ label, value, onValueChange, disabled, colors }: any) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, opacity: disabled ? 0.5 : 1 }}>
    <Text style={[TEXT.label, { color: colors.text, marginBottom: 0 }]}>{label}</Text>
    <Switch 
      value={value} 
      onValueChange={onValueChange} 
      disabled={disabled} // <--- This prevents user interaction
      trackColor={{ false: '#767577', true: colors.primary }} 
    />
  </View>
);

const CustomModal = ({ visible, children, colors }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={[LAYOUT.card3D, { backgroundColor: colors.card, borderColor: colors.border, borderBottomColor: colors.shadow, width: '85%', maxWidth: 400 }]}>
        {children}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  content: { padding: 20, maxWidth: 600, alignSelf: 'center', width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBtns: { flexDirection: 'row', gap: 15, marginTop: 10 }
});