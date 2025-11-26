// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const storedUser = await AsyncStorage.getItem('userProfile');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email === email && parsed.password === password) {
          setUser(parsed);
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const signup = async (username, email, password) => {
    const newUser = { username, email, password, solved: [] };
    await AsyncStorage.setItem('userProfile', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  // --- NEW: UPDATE PROFILE (Name & Email) ---
  const updateProfile = async (newUsername, newEmail) => {
    const updatedUser = { ...user, username: newUsername, email: newEmail };
    setUser(updatedUser);
    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
  };

  // --- NEW: CHANGE PASSWORD ---
  const changePassword = async (currentPassword, newPassword) => {
    // Verify old password
    if (user.password !== currentPassword) {
      return false; // Wrong password
    }
    
    // Save new password
    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);
    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
    return true; // Success
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      setUser,
      updateProfile,   // Exported
      changePassword   // Exported
    }}>
      {children}
    </AuthContext.Provider>
  );
};