// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // --- NETWORK MONITOR ---
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => config);
    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        setIsOffline(false);
        return response;
      },
      (error) => {
        if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
          setIsOffline(true);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Check Storage
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

  // --- ACTIONS ---

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

  const saveSolvedPuzzle = async (fact) => {
    if (isOffline) {
      if (!user.solved.includes(fact)) {
        const newSolved = [fact, ...user.solved];
        setUser({ ...user, solved: newSolved });
      }
      return;
    }
    if (!user) return;
    try {
      const response = await axios.post(`${API_URL}/save-puzzle`, { id: user.id, fact });
      const updatedUser = response.data;
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) { console.error(e); }
  };

  // --- NEW: SUBMIT FEEDBACK ---
  const submitFeedback = async (text) => {
    if (!user) return false;
    // If offline, we can't submit
    if (isOffline) return false;

    try {
      await axios.post(`${API_URL}/submit-feedback`, {
        userId: user.id,
        username: user.username,
        text: text
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, isOffline,
      login, signup, logout, 
      updateProfile, changePassword, saveSolvedPuzzle,
      submitFeedback // <--- EXPORTED
    }}>
      {children}
    </AuthContext.Provider>
  );
};