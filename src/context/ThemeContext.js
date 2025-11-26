// src/context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
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

  const isDark = useSystemTheme ? systemScheme === 'dark' : isDarkMode;

  // --- DEFINING THE COLOR SCHEMES ---
  const theme = {
    // 1. Backgrounds
    background: isDark ? '#0F172A' : '#F5F5F5', // Deep Space Blue vs Light Grey
    card:       isDark ? '#1E293B' : '#FFFFFF', // Slate Blue vs White
    
    // 2. Text
    text:       isDark ? '#E2E8F0' : '#333333', // Light Blue-Grey vs Dark Grey
    subText:    isDark ? '#94A3B8' : '#666666',
    
    // 3. Branding (The Main Change)
    // Light = Orange, Dark = Neon Violet
    primary:    isDark ? '#8B5CF6' : '#FF8C00', 
    
    // 4. UI Elements (Borders & Shadows)
    border:     isDark ? '#7C3AED' : '#FF8C00', // Darker Violet vs Orange
    shadow:     isDark ? '#5B21B6' : '#C06600', // Deep Violet Shadow vs Dark Orange Shadow
    
    // 5. Success/Action Colors
    success:    '#32CD32',
    danger:     '#FF4500'
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