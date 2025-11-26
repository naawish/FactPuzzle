// App.js
import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';

// --- SCREENS ---
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen'; // The Game Hub
import ProfileScreen from './src/screens/ProfileScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// --- GAMES ---
import WordFinderGame from './src/games/WordFinderGame';
import HangmanGame from './src/games/HangmanGame';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- MAIN NAVIGATION STACK ---
function AppNavigation() {
  const { user } = useContext(AuthContext);
  const { isDark, theme } = useContext(ThemeContext);

  // Merge Default Navigation Theme with our Custom Colors
  const BaseTheme = isDark ? DarkTheme : DefaultTheme;
  const MyNavTheme = {
    ...BaseTheme,
    colors: {
      ...BaseTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={MyNavTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // --- AUTH STACK ---
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          // --- APP STACK ---
          <>
            {/* Main Tabs (Hub, Leaderboard, Profile) */}
            <Stack.Screen name="Main" component={AppTabs} />
            
            {/* Settings Screen */}
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ 
                headerShown: true, 
                title: 'Account Settings',
                headerStyle: { backgroundColor: theme.primary },
                headerTintColor: '#fff'
              }} 
            />

            {/* --- GAMES --- */}
            
            {/* 1. Word Finder */}
            <Stack.Screen 
              name="WordFinder" 
              component={WordFinderGame} 
              options={{ 
                headerShown: true, 
                title: 'Word Finder',
                headerStyle: { backgroundColor: theme.primary },
                headerTintColor: '#fff'
              }} 
            />

            {/* 2. Hangman */}
            <Stack.Screen 
              name="Hangman" 
              component={HangmanGame} 
              options={{ 
                headerShown: true, 
                title: 'Hangman',
                headerStyle: { backgroundColor: theme.primary },
                headerTintColor: '#fff'
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- BOTTOM TAB NAVIGATION ---
function AppTabs() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Header Style
        headerStyle: { backgroundColor: theme.primary, shadowColor: 'transparent' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        
        // Tab Bar Style
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          height: 70,        
          paddingBottom: 10, 
          paddingTop: 10,    
          backgroundColor: theme.card, 
          borderTopWidth: 0,
          borderTopColor: theme.border,
          elevation: 10, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 5, 
        },
        // Dynamic Icons
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Game Hub' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Leaderboard' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Tab.Navigator>
  );
}

// --- ROOT COMPONENT ---
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </AuthProvider>
  );
}