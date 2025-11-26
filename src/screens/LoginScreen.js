// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ImageBackground, 
  Image, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // <--- IMPORT THIS

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); // <--- USE THEME

  const handleLogin = async () => {
    const success = await login(email, password);
    if (!success) Alert.alert('Error', 'Invalid credentials or user not found.');
  };

  // --- DYNAMIC STYLES ---
  const cardStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.border,
    borderBottomColor: theme.shadow // 3D Shadow Color
  };
  
  const inputStyle = { 
    // Darker background for inputs in Dark Mode
    backgroundColor: theme.background === '#0F172A' ? '#334155' : '#F5F5F5', 
    color: theme.text,
    borderColor: theme.border
  };

  const btnStyle = { 
    backgroundColor: theme.primary, 
    borderBottomColor: theme.shadow 
  };

  const textStyle = { color: theme.text };
  const labelStyle = { color: theme.primary };
  const linkStyle = { color: theme.primary };

  return (
    <ImageBackground 
      source={require('../../assets/Login-Background.png')} 
      style={[styles.background, { backgroundColor: theme.background }]}
      // Fade the background image in Dark Mode so it blends with the dark blue theme
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.4 : 1 }} 
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        
        {/* --- BRANDING --- */}
        <View style={styles.brandingContainer}>
          <Image 
            source={require('../../assets/Logo.png')} 
            style={styles.logoImage}
          />
          {/* Note: Title.png might be orange. If you want it dynamic, 
              you might need a separate White version or use Text instead. 
              For now, we keep the image. */}
          <Image 
            source={require('../../assets/Title.png')} 
            style={styles.titleImage}
          />
        </View>

        {/* --- GAME CARD --- */}
        <View style={[styles.card, cardStyle]}>
          
          <Text style={[styles.cardHeader, { color: theme.primary }]}>Welcome Back!</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, labelStyle]}>EMAIL</Text>
            <TextInput 
              placeholder="player@example.com" 
              style={[styles.input, inputStyle]} 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none"
              placeholderTextColor={theme.subText}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, labelStyle]}>PASSWORD</Text>
            <TextInput 
              placeholder="••••••••" 
              style={[styles.input, inputStyle]} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              placeholderTextColor={theme.subText}
            />
          </View>
          
          {/* Main Action Button */}
          <TouchableOpacity style={[styles.loginBtn, btnStyle]} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>PLAY NOW</Text>
          </TouchableOpacity>
          
          {/* Secondary Action */}
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: theme.subText }]}>
              New Player? <Text style={[styles.signupLink, linkStyle]}>Create Account</Text>
            </Text>
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  
  // --- BRANDING ---
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 20, 
  },
  logoImage: {
    width: 100,    
    height: 100,
    resizeMode: 'contain',
    marginBottom: 5, 
  },
  titleImage: {
    width: 240,    
    height: 50,    
    resizeMode: 'contain',
  },

  // --- CARD DESIGN ---
  card: {
    width: '100%',
    maxWidth: 380,
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 30,
    
    // 3D Borders
    borderWidth: 4,
    borderBottomWidth: 8, // Thicker bottom for 3D effect
    
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10, 
  },

  cardHeader: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  // --- INPUT STYLING ---
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5
  },
  input: { 
    paddingVertical: 15, 
    paddingHorizontal: 20,
    borderRadius: 15, 
    fontSize: 16,
    borderWidth: 2,
  },

  // --- BUTTON STYLING ---
  loginBtn: { 
    paddingVertical: 18, 
    borderRadius: 50, // Pill Shape
    alignItems: 'center',
    marginTop: 15,
    // 3D Button Effect
    borderBottomWidth: 6,
  },
  loginBtnText: { 
    color: '#FFF', 
    fontWeight: '900', 
    fontSize: 18,
    letterSpacing: 1
  },

  // --- LINK STYLING ---
  signupContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600'
  },
  signupLink: { 
    fontWeight: '900',
  }
});