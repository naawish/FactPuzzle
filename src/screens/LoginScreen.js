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
  Platform,
  TouchableWithoutFeedback, // <--- IMPORT THIS
  Keyboard                  // <--- IMPORT THIS
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext); 

  const handleLogin = async () => {
    const success = await login(email, password);
    if (!success) Alert.alert('Error', 'Invalid credentials or user not found.');
  };

  // --- DYNAMIC STYLES ---
  const cardStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.border,
    borderBottomColor: theme.shadow 
  };
  
  const inputStyle = { 
    backgroundColor: theme.background === '#0F172A' ? '#334155' : '#F5F5F5', 
    color: theme.text,
    borderColor: theme.border
  };

  const btnStyle = { 
    backgroundColor: theme.primary, 
    borderBottomColor: theme.shadow 
  };

  const labelStyle = { color: theme.primary };
  const linkStyle = { color: theme.primary };

  return (
    <ImageBackground 
      source={require('../../assets/Login-Background.png')} 
      style={[styles.background, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.4 : 1 }} 
      resizeMode="cover"
    >
      {/* 1. Wrap everything in TouchableWithoutFeedback to detect outside clicks */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          
          {/* --- BRANDING --- */}
          <View style={styles.brandingContainer}>
            <Image 
              source={
                isDark 
                  ? require('../../assets/Title-Dark.png') 
                  : require('../../assets/Title-Light.png')
              } 
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
      </TouchableWithoutFeedback>
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
    marginBottom: 40,
  },
  titleImage: {
    width: 280,    
    height: 130,    
    resizeMode: 'contain',
  },

  // --- CARD DESIGN ---
  card: {
    width: '100%',
    maxWidth: 380,
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 30,
    borderWidth: 4,
    borderBottomWidth: 8, 
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
    borderRadius: 50, 
    alignItems: 'center',
    marginTop: 15,
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