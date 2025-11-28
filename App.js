// App.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
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
import ProfileScreen from './src/screens/ProfileScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import Games (Direct imports or requires are fine)
import WordFinderGame from './src/games/WordFinderGame'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- OFFLINE INDICATOR ---
function OfflineBadge() {
  const { isOffline } = useContext(AuthContext);
  if (!isOffline) return null;
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

  // --- CUSTOM BACK BUTTON ---
  const renderBackButton = (navigation) => (
    <TouchableOpacity 
      onPress={() => navigation.goBack()}
      style={styles.backBtn}
    >
      <Text style={[styles.backBtnText, { color: theme.primary }]}>BACK</Text>
    </TouchableOpacity>
  );

  const gameScreenOptions = ({ navigation, title }) => ({
    headerShown: true, 
    title: title,
    headerStyle: { backgroundColor: theme.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '900', letterSpacing: 1 },
    headerLeft: () => renderBackButton(navigation), 
  });

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
              options={({ navigation }) => gameScreenOptions({ navigation, title: 'SETTINGS' })} 
            />
            
            {/* --- GAME ROUTES --- */}
            
            <Stack.Screen 
              name="WordFinder" 
              component={WordFinderGame} 
              options={({ navigation }) => gameScreenOptions({ navigation, title: 'WORD FINDER' })} 
            />
            
            <Stack.Screen 
              name="Hangman" 
              component={require('./src/games/HangmanGame').default} 
              options={({ navigation }) => gameScreenOptions({ navigation, title: 'HANGMAN' })} 
            />
            
            <Stack.Screen 
              name="Trivia" 
              component={require('./src/games/TriviaGame').default} 
              options={({ navigation }) => gameScreenOptions({ navigation, title: 'TRIVIA' })} 
            />

            {/* REGISTER TIC TAC TOE HERE */}
            <Stack.Screen 
              name="TicTacToe" 
              component={require('./src/games/TicTacToeGame').default} 
              options={({ navigation }) => gameScreenOptions({ navigation, title: 'TIC TAC TOE' })} 
            />

          </>
        )}
      </Stack.Navigator>
      
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
        headerTitleStyle: { fontWeight: '900', letterSpacing: 1 },
        
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'GAME HUB' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'LEADERBOARD' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'MY PROFILE' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  offlineBadge: {
    position: 'absolute', bottom: 90, right: 20, backgroundColor: '#FF4500', 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, 
    borderRadius: 20, elevation: 5, zIndex: 9999, borderWidth: 2, borderColor: '#FFF'
  },
  offlineText: { color: '#FFF', fontWeight: '900', fontSize: 12, marginLeft: 5 },
  backBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    marginRight: 10
  },
  backBtnText: { fontWeight: '900', fontSize: 12, letterSpacing: 1 }
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