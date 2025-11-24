// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Simple mock validation
    const storedUser = await AsyncStorage.getItem('userProfile');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.email === email && parsed.password === password) {
        setUser(parsed);
        return true;
      }
    }
    return false;
  };

  const signup = async (username, email, password) => {
    const newUser = { username, email, password, solved: [] };
    await AsyncStorage.setItem('userProfile', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};