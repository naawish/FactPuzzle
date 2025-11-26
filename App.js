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
// Note: Ensure these files exist in src/games/ or update path accordingly
import HangmanGame from './src/games/HangmanGame';
import TriviaGame from './src/games/TriviaGame';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppNavigation() {
  const { user } = useContext(AuthContext);
  const { isDark, theme } = useContext(ThemeContext);

  // 1. Pick the base theme to get standard fonts and behaviors
  const BaseTheme = isDark ? DarkTheme : DefaultTheme;

  // 2. Merge with our Custom Colors
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

  // Shared Header Options for Stack Screens
  const stackHeaderOptions = (title) => ({
    headerShown: true, 
    title: title,
    headerStyle: { backgroundColor: theme.primary },
    headerTintColor: '#fff'
  });

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
            {/* Main Tab Bar */}
            <Stack.Screen name="Main" component={AppTabs} />
            
            {/* Settings */}
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={stackHeaderOptions('Account Settings')} 
            />

            {/* --- GAMES --- */}
            <Stack.Screen 
              name="WordFinder" 
              component={WordFinderGame} 
              options={stackHeaderOptions('Word Finder')} 
            />
            
            <Stack.Screen 
              name="Hangman" 
              component={HangmanGame} 
              options={stackHeaderOptions('Hangman')} 
            />

            <Stack.Screen 
              name="Trivia" 
              component={TriviaGame} 
              options={stackHeaderOptions('Trivia Challenge')} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppTabs() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Header Styling
        headerStyle: { backgroundColor: theme.primary, shadowColor: 'transparent' }, 
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        
        // Tab Bar Styling
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
        // Icon Logic
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
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Game Hub' }} 
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen} 
        options={{ title: 'Leaderboard' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </AuthProvider>
  );
}