// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native'; // <--- This hook listens to the device
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Listen to the device theme (updates automatically)
  const systemScheme = useColorScheme(); 
  
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSystem = await AsyncStorage.getItem('useSystemTheme');
      const savedDark = await AsyncStorage.getItem('isDarkMode');
      if (savedSystem !== null) setUseSystemTheme(JSON.parse(savedSystem));
      if (savedDark !== null) setIsDarkMode(JSON.parse(savedDark));
    } catch (e) {
      console.error("Failed to load theme settings");
    }
  };

  const toggleSystemTheme = async (value) => {
    setUseSystemTheme(value);
    await AsyncStorage.setItem('useSystemTheme', JSON.stringify(value));
  };

  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(value));
  };

  // 2. Logic: If System is ON, use systemScheme. Otherwise use manual toggle.
  // We default to 'light' if systemScheme is undefined (rare)
  const isDark = useSystemTheme ? (systemScheme === 'dark') : isDarkMode;

  // 3. Define Theme Colors (Memoized to prevent flickering)
  const theme = useMemo(() => ({
    // Backgrounds
    background: isDark ? '#0F172A' : '#F5F5F5',
    card:       isDark ? '#1E293B' : '#FFFFFF',
    
    // Text
    text:       isDark ? '#E2E8F0' : '#333333',
    subText:    isDark ? '#94A3B8' : '#666666',
    
    // Branding
    primary:    isDark ? '#8B5CF6' : '#FF8C00', // Violet vs Orange
    
    // UI Elements
    border:     isDark ? '#7C3AED' : '#FF8C00',
    shadow:     isDark ? '#5B21B6' : '#C06600',
    
    // Action Colors
    success:    '#32CD32',
    danger:     isDark ? '#D946EF' : '#FF4500', 
    dangerShadow: isDark ? '#A21CAF' : '#C03500'
  }), [isDark]); // Re-calculate only when isDark changes

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