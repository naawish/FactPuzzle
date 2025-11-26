// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image, KeyboardAvoidingView, Platform } from 'react-native';
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
      {/* KeyboardAvoidingView keeps inputs visible when keyboard opens */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        
        {/* --- LOGO & TITLE SECTION --- */}
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

        {/* --- FORM SECTION --- */}
        <View style={styles.formContainer}>
          <TextInput 
            placeholder="Email" 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
          <TextInput 
            placeholder="Password" 
            style={styles.input} 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            placeholderTextColor="#666"
          />
          
          <TouchableOpacity style={styles.btn} onPress={handleLogin}>
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>Don't have an account? Sign Up</Text>
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
  
  // Branding Styles
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 30, // Space between title and inputs
  },
  logoImage: {
    width: 120,    // Adjust size as needed
    height: 120,
    resizeMode: 'contain',
    marginBottom: 1, // Small gap between Logo and Title
  },
  titleImage: {
    width: 250,    // Adjust width to fit your title text graphic
    height: 80,    // Adjust height based on your aspect ratio
    resizeMode: 'contain',
  },

  // Form Styles
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white box
    padding: 25,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  input: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderColor: '#FFA500', // Matches your orange theme
    borderWidth: 2,
    fontSize: 16
  },
  btn: { 
    backgroundColor: '#FF4500', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  btnText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  link: { 
    marginTop: 20, 
    color: '#FF4500', 
    textAlign: 'center',
    fontWeight: '600'
  }
});