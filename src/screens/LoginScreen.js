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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    const success = await login(email, password);
    if (!success) Alert.alert('Error', 'Invalid credentials or user not found.');
  };

  return (
    <ImageBackground 
      source={require('../../assets/Login-Background.png')} 
      style={styles.background}
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
          <Image 
            source={require('../../assets/Title.png')} 
            style={styles.titleImage}
          />
        </View>

        {/* --- CUSTOM DESIGNED CARD --- */}
        <View style={styles.card}>
          
          <Text style={styles.cardHeader}>Welcome Back!</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput 
              placeholder="player@example.com" 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput 
              placeholder="••••••••" 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              placeholderTextColor="#999"
            />
          </View>
          
          {/* Main Action Button */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>PLAY NOW</Text>
          </TouchableOpacity>
          
          {/* Secondary Action */}
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupContainer}>
            <Text style={styles.signupText}>
              New Player? <Text style={styles.signupLink}>Create Account</Text>
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

  // --- CARD DESIGN (The "Custom" Part) ---
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 30,
    // Add a Thick Orange Border to match the game vibe
    borderWidth: 4,
    borderColor: '#FF8C00',
    // Heavy Shadow for a "Pop" effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10, 
  },

  cardHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF4500',
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
    color: '#FF8C00',
    marginBottom: 5,
    marginLeft: 5
  },
  input: { 
    backgroundColor: '#F5F5F5', 
    paddingVertical: 15, 
    paddingHorizontal: 20,
    borderRadius: 15, 
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: '#EEEEEE'
  },

  // --- BUTTON STYLING ---
  loginBtn: { 
    backgroundColor: '#FF4500', // Bright Orange/Red
    paddingVertical: 18, 
    borderRadius: 50, // Pill Shape
    alignItems: 'center',
    marginTop: 15,
    // Make the button look 3D
    borderBottomWidth: 6,
    borderBottomColor: '#C03500', // Darker shade for 3D effect
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
    color: '#666',
    fontSize: 14,
  },
  signupLink: { 
    color: '#FF8C00', 
    fontWeight: 'bold',
  }
});