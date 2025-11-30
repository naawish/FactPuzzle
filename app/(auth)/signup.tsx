import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, ImageBackground, Image, 
  KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Button3D } from '../../src/components/ui/Button3D';
import { COLORS, LAYOUT, SPACING, TEXT } from '../../src/theme/theme';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { signup } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const handleSignup = async () => {
    const success = await signup(username, email, password);
    if (success) {
      router.replace('/(tabs)/home');
    } else {
      alert('Signup failed. Email might be in use.');
    }
  };

  const Wrapper = Platform.OS === 'web' ? View : TouchableWithoutFeedback;
  const wrapperProps = Platform.OS === 'web' ? { style: { flex: 1 } } : { onPress: Keyboard.dismiss };
  const bgImage = Platform.OS === 'web' ? require('../../assets/Login-Background-web.jpg') : require('../../assets/Login-Background.png');

  const inputStyle = { 
    backgroundColor: isDark ? '#334155' : '#F5F5F5',
    color: themeColors.text,
    borderColor: themeColors.border
  };

  return (
    <ImageBackground 
      source={bgImage} 
      style={[styles.background, { backgroundColor: themeColors.background }]}
      imageStyle={{ opacity: isDark ? 0.4 : 1 }} 
      resizeMode="cover"
    >
      <Wrapper {...wrapperProps}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.brandContainer}>
              <Image 
                source={isDark ? require('../../assets/Title-Dark.png') : require('../../assets/Title-Light.png')} 
                style={styles.titleImage}
              />
            </View>

            <View style={[
              LAYOUT.card3D, 
              { 
                backgroundColor: themeColors.card, 
                borderColor: themeColors.border,
                borderBottomColor: themeColors.shadow 
              },
              styles.cardConstraints
            ]}>
              
              <Text style={[TEXT.header, { color: themeColors.primary, textAlign: 'center', marginBottom: SPACING.lg }]}>
                Create Account
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[TEXT.label, { color: themeColors.primary }]}>USERNAME</Text>
                <TextInput value={username} onChangeText={setUsername} style={[styles.input, inputStyle]} placeholder="CoolPlayer1" placeholderTextColor={themeColors.subText} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[TEXT.label, { color: themeColors.primary }]}>EMAIL</Text>
                <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={[styles.input, inputStyle]} placeholder="player@example.com" placeholderTextColor={themeColors.subText} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[TEXT.label, { color: themeColors.primary }]}>PASSWORD</Text>
                <TextInput value={password} onChangeText={setPassword} secureTextEntry style={[styles.input, inputStyle]} placeholder="••••••••" placeholderTextColor={themeColors.subText} />
              </View>

              <Button3D label="START PLAYING" onPress={handleSignup} style={{ marginTop: SPACING.md }} />

              <View style={styles.footerLink}>
                <Text style={{ color: themeColors.subText }}>Already have an account? </Text>
                <Text style={{ color: themeColors.primary, fontWeight: '900' }} onPress={() => router.back()}>Log In</Text>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Wrapper>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg, paddingTop: 60 },
  brandContainer: { marginBottom: SPACING.lg },
  titleImage: { width: 260, height: 70, resizeMode: 'contain' },
  cardConstraints: { width: '100%', maxWidth: 400 },
  inputGroup: { marginBottom: SPACING.md },
  input: { padding: SPACING.md, borderRadius: 12, borderWidth: 2, fontSize: 16 },
  footerLink: { marginTop: SPACING.lg, flexDirection: 'row', justifyContent: 'center' }
});