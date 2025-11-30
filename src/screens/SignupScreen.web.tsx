// src/screens/SignupScreen.web.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { signup } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext);

  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const inputStyle = { backgroundColor: theme.background === '#0F172A' ? '#334155' : '#F5F5F5', color: theme.text, borderColor: theme.border };
  const btnStyle = { backgroundColor: theme.primary, borderBottomColor: theme.shadow };
  const textStyle = { color: theme.primary };

  return (
    <ImageBackground 
      source={require('../../assets/Login-Background-web.jpg')} 
      style={[styles.background, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.4 : 1 }} 
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.centerContainer}>
        <View style={styles.brandingContainer}>
          <Image 
            source={isDark ? require('../../assets/Title-Dark.png') : require('../../assets/Title-Light.png')} 
            style={styles.titleImage}
          />
        </View>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardHeader, textStyle]}>CREATE ACCOUNT</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, textStyle]}>USERNAME</Text>
            <TextInput placeholder="CoolPlayer123" style={[styles.input, inputStyle]} value={username} onChangeText={setUsername} placeholderTextColor={theme.subText} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, textStyle]}>EMAIL</Text>
            <TextInput placeholder="player@example.com" style={[styles.input, inputStyle]} value={email} onChangeText={setEmail} autoCapitalize="none" placeholderTextColor={theme.subText} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, textStyle]}>PASSWORD</Text>
            <TextInput placeholder="••••••••" style={[styles.input, inputStyle]} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={theme.subText} />
          </View>
          
          <TouchableOpacity style={[styles.signupBtn, btnStyle]} onPress={() => signup(username, email, password)}>
            <Text style={styles.signupBtnText}>START PLAYING</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLinkContainer}>
            <Text style={[styles.loginText, { color: theme.subText }]}>
              Already have an account? <Text style={[styles.loginLink, textStyle]}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  centerContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  brandingContainer: { alignItems: 'center', marginBottom: 30 },
  titleImage: { width: 300, height: 80, resizeMode: 'contain' },
  card: { width: 400, paddingVertical: 40, paddingHorizontal: 30, borderRadius: 30, borderWidth: 4, borderBottomWidth: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10 },
  cardHeader: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 30, textTransform: 'uppercase', letterSpacing: 1 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  input: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, fontSize: 16, borderWidth: 2, outlineStyle: 'none' },
  signupBtn: { paddingVertical: 20, borderRadius: 50, alignItems: 'center', marginTop: 20, borderBottomWidth: 6, cursor: 'pointer' },
  signupBtnText: { color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  loginLinkContainer: { marginTop: 25, alignItems: 'center' },
  loginText: { fontSize: 14, fontWeight: '600' },
  loginLink: { fontWeight: '900', cursor: 'pointer' }
});