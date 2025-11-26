// src/context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' or 'dark' from the phone OS
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved settings on app start
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSystem = await AsyncStorage.getItem('useSystemTheme');
      const savedDark = await AsyncStorage.getItem('isDarkMode');

      if (savedSystem !== null) {
        setUseSystemTheme(JSON.parse(savedSystem));
      }
      if (savedDark !== null) {
        setIsDarkMode(JSON.parse(savedDark));
      }
    } catch (e) {
      console.error("Failed to load theme settings");
    }
  };

  // Toggle System Setting
  const toggleSystemTheme = async (value) => {
    setUseSystemTheme(value);
    await AsyncStorage.setItem('useSystemTheme', JSON.stringify(value));
  };

  // Toggle Manual Dark Mode
  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(value));
  };

  // Logic: Are we actually in dark mode right now?
  // If System is ON, use systemScheme. If OFF, use manual isDarkMode.
  const isDark = useSystemTheme ? systemScheme === 'dark' : isDarkMode;

  // Define Colors
  const theme = {
    background: isDark ? '#121212' : '#F5F5F5',
    card: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#333333',
    subText: isDark ? '#AAAAAA' : '#666666',
    border: isDark ? '#333333' : '#E0E0E0',
    primary: '#FF8C00', // Orange stays the same
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      theme, 
      useSystemTheme, 
      toggleSystemTheme, 
      isDarkMode, 
      toggleDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};