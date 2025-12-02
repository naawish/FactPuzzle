import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '900', letterSpacing: 1 },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        }
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'FactPuzzle', // <--- APP TITLE IN HEADER
          tabBarLabel: 'Hub',  // Short label for bottom bar
          tabBarIcon: ({ color, size }) => <Ionicons name="game-controller" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="community" 
        options={{ 
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          href: null, 
          title: 'Settings' 
        }} 
      />
    </Tabs>
  );
}