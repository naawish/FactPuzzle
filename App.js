// App.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native'; // Added View, Text, StyleSheet
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import WordFinderGame from './src/games/WordFinderGame';
import ProfileScreen from './src/screens/ProfileScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- NEW: OFFLINE INDICATOR COMPONENT ---
function OfflineBadge() {
  const { isOffline } = useContext(AuthContext);

  if (!isOffline) return null; // Don't show if online

  return (
    <View style={styles.offlineBadge}>
      <Ionicons name="cloud-offline" size={16} color="#FFF" />
      <Text style={styles.offlineText}>OFFLINE</Text>
    </View>
  );
}

function AppNavigation() {
  const { user } = useContext(AuthContext);
  const { isDark, theme } = useContext(ThemeContext);

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
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={AppTabs} />
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
            <Stack.Screen 
              name="Hangman" 
              // Using require for lazy loading logic or direct import
              component={require('./src/games/HangmanGame').default} 
              options={{ 
                headerShown: true, 
                title: 'Hangman',
                headerStyle: { backgroundColor: theme.primary },
                headerTintColor: '#fff'
              }} 
            />
            <Stack.Screen 
              name="Trivia" 
              component={require('./src/games/TriviaGame').default} 
              options={{ 
                headerShown: true, 
                title: 'Trivia Challenge',
                headerStyle: { backgroundColor: theme.primary },
                headerTintColor: '#fff'
              }} 
            />
          </>
        )}
      </Stack.Navigator>
      
      {/* PLACE THE BADGE HERE SO IT FLOATS OVER EVERYTHING */}
      {user && <OfflineBadge />}
      
    </NavigationContainer>
  );
}

function AppTabs() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.primary, shadowColor: 'transparent' }, 
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        
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
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'game-controller' : 'game-controller-outline';
          else if (route.name === 'Community') iconName = focused ? 'trophy' : 'trophy-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
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

// STYLES FOR THE OFFLINE BADGE
const styles = StyleSheet.create({
  offlineBadge: {
    position: 'absolute',
    bottom: 90, // Above the tab bar
    right: 20,
    backgroundColor: '#FF4500', // Danger Red
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: '#FFF',
    gap: 8,
    zIndex: 9999 // Ensure it's on top
  },
  offlineText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1
  }
});

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </AuthProvider>
  );
}