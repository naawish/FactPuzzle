// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userProfile');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) { console.log("Failed to load user"); } 
      finally { setLoading(false); }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const userData = response.data;
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) { return false; }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, { username, email, password });
      const userData = response.data;
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) { return false; }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userProfile');
    setUser(null);
  };

  const updateProfile = async (newUsername, newEmail) => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_URL}/update-profile`, {
        id: user.id, username: newUsername, email: newEmail
      });
      const updatedUser = response.data;
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) { console.error(e); }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return false;
    try {
      await axios.post(`${API_URL}/change-password`, {
        id: user.id, currentPassword, newPassword
      });
      const updatedUser = { ...user, password: newPassword };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (e) { return false; }
  };

  // --- REVERTED: Removed gameType parameter ---
  const saveSolvedPuzzle = async (fact) => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_URL}/save-puzzle`, {
        id: user.id,
        fact
      });
      const updatedUser = response.data;
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) { console.error(e); }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, signup, logout, updateProfile, changePassword, saveSolvedPuzzle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};