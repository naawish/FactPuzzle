import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

// --- STORAGE KEYS ---
const USERS_KEY = 'FACTPUZZLE_USERS';       // Stores array of all user objects
const SESSION_KEY = 'FACTPUZZLE_SESSION';   // Stores the ID of the currently logged-in user
const FEEDBACK_KEY = 'FACTPUZZLE_FEEDBACK'; // Stores array of feedback messages

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Since we are using local storage, we are effectively "always online" relative to the DB.
  // We keep this variable false so the Offline Badge doesn't show up in the UI.
  const isOffline = false; 

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      // Check if a user was previously logged in
      const sessionId = await AsyncStorage.getItem(SESSION_KEY);
      
      if (sessionId) {
        // Find that user in the main "Database" (Array)
        const allUsersRaw = await AsyncStorage.getItem(USERS_KEY);
        const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
        
        const foundUser = allUsers.find(u => u.id === sessionId);
        
        if (foundUser) {
          setUser(foundUser);
        } else {
          // ID exists but user data missing? Clear session.
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: SAVE CHANGES TO STORAGE ---
  // This function takes the CURRENT user object, finds it in the big array, updates it, and saves everything.
  const commitUserToStorage = async (updatedUser) => {
    try {
      const allUsersRaw = await AsyncStorage.getItem(USERS_KEY);
      let allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
      
      // Find index of current user
      const index = allUsers.findIndex(u => u.id === updatedUser.id);
      
      if (index !== -1) {
        allUsers[index] = updatedUser; // Update existing
      } else {
        allUsers.push(updatedUser); // Add new (fallback)
      }

      // Save back to phone
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
      
      // Update State so UI reflects changes immediately
      setUser(updatedUser); 
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  // --- 2. AUTH ACTIONS ---

  const login = async (email, password) => {
    try {
      const allUsersRaw = await AsyncStorage.getItem(USERS_KEY);
      const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];

      // Simple case-insensitive email match
      const foundUser = allUsers.find(u => 
        u.email.toLowerCase() === email.trim().toLowerCase() && 
        u.password === password
      );

      if (foundUser) {
        await AsyncStorage.setItem(SESSION_KEY, foundUser.id);
        setUser(foundUser);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const allUsersRaw = await AsyncStorage.getItem(USERS_KEY);
      const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];

      // Check duplicates
      if (allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        alert("Email already in use");
        return false;
      }

      // Create New User Object
      const newUser = {
        id: Date.now().toString(),
        username: username.trim(),
        email: email.trim(),
        password,
        solved: [] // Array to hold puzzles: { text, date }
      };

      // Save to "Database"
      allUsers.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
      
      // Auto-login
      await AsyncStorage.setItem(SESSION_KEY, newUser.id);
      setUser(newUser);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  // --- 3. DATA ACTIONS ---

  const updateProfile = async (newUsername, newEmail) => {
    if (!user) return;
    const updatedUser = { ...user, username: newUsername, email: newEmail };
    await commitUserToStorage(updatedUser);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return false;
    
    // Verify old password
    if (user.password !== currentPassword) return false;

    const updatedUser = { ...user, password: newPassword };
    await commitUserToStorage(updatedUser);
    return true;
  };

  const saveSolvedPuzzle = async (fact) => {
    if (!user) return;

    // Normalize fact text
    const factText = typeof fact === 'string' ? fact : fact.text;

    // Check for duplicates
    const alreadyExists = user.solved.some(item => {
      const existingText = typeof item === 'string' ? item : item.text;
      return existingText === factText;
    });

    if (alreadyExists) return;

    // Create Entry with Date
    const newEntry = {
      text: factText,
      date: new Date().toISOString()
    };

    // Add to TOP of the list
    const updatedUser = { ...user, solved: [newEntry, ...user.solved] };
    await commitUserToStorage(updatedUser);
  };

  const submitFeedback = async (text) => {
    try {
      const rawFeedback = await AsyncStorage.getItem(FEEDBACK_KEY);
      const feedbacks = rawFeedback ? JSON.parse(rawFeedback) : [];
      
      feedbacks.push({
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        text,
        date: new Date().toISOString()
      });

      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
      
      // Log for debugging/verification since we don't have an admin panel
      console.log("✅ Feedback Saved Locally:", text); 
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isOffline, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      changePassword, 
      saveSolvedPuzzle,
      submitFeedback 
    }}>
      {children}
    </AuthContext.Provider>
  );
};