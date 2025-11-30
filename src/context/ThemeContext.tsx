// src/context/ThemeContext.tsx
import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme/theme';

// Define Context Type
interface ThemeContextType {
  isDark: boolean;
  theme: typeof COLORS.light;
  useSystemTheme: boolean;
  toggleSystemTheme: (val: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: (val: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

// --- EXPORT THE CUSTOM HOOK (This fixes the crash) ---
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
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

  const toggleSystemTheme = async (value: boolean) => {
    setUseSystemTheme(value);
    await AsyncStorage.setItem('useSystemTheme', JSON.stringify(value));
  };

  const toggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(value));
  };

  const isDark = useSystemTheme ? systemScheme === 'dark' : isDarkMode;
  const theme = isDark ? COLORS.dark : COLORS.light;

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