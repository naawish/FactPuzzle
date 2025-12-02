import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TYPES
interface UserProfile {
  id: string;
  username: string;
  email: string;
  solved: any[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<boolean>;
  saveSolvedPuzzle: (fact: any) => Promise<void>;
  submitFeedback: (text: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

// STORAGE KEYS
const USERS_DB_KEY = 'FACTPUZZLE_DATABASE_USERS';
const SESSION_TOKEN_KEY = 'FACTPUZZLE_SESSION_TOKEN';
const FEEDBACK_DB_KEY = 'FACTPUZZLE_DATABASE_FEEDBACK';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      if (token) {
        const userId = token.split('bearer-')[1];
        const allUsersRaw = await AsyncStorage.getItem(USERS_DB_KEY);
        const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
        const foundUser = allUsers.find((u: any) => u.id === userId);
        
        if (foundUser) {
          const { password, ...safeUser } = foundUser;
          setUser(safeUser);
        } else {
          await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
        }
      }
    } catch (e) {
      console.error("Session Load Error", e);
    } finally {
      setLoading(false);
    }
  };

  const updateUserInDb = async (userId: string, updateFn: (user: any) => any) => {
    try {
      const allUsersRaw = await AsyncStorage.getItem(USERS_DB_KEY);
      let allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
      const index = allUsers.findIndex((u: any) => u.id === userId);
      
      if (index === -1) return null;

      const updatedFullUser = updateFn(allUsers[index]);
      allUsers[index] = updatedFullUser;

      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(allUsers));

      // Update UI State immediately
      const { password, ...safeUser } = updatedFullUser;
      setUser(safeUser);
      
      return true;
    } catch (e) {
      console.error("DB Update Error", e);
      return false;
    }
  };

  // --- ACTIONS ---

  const login = async (email: string, pass: string) => {
    try {
      const allUsersRaw = await AsyncStorage.getItem(USERS_DB_KEY);
      const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
      const foundUser = allUsers.find((u: any) => 
        u.email.toLowerCase() === email.trim().toLowerCase() && 
        u.password === pass
      );

      if (foundUser) {
        const token = `bearer-${foundUser.id}`;
        await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
        const { password, ...safeUser } = foundUser;
        setUser(safeUser);
        return true;
      }
      return false;
    } catch (e) { return false; }
  };

  const signup = async (username: string, email: string, pass: string) => {
    try {
      const allUsersRaw = await AsyncStorage.getItem(USERS_DB_KEY);
      const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
      if (allUsers.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        alert("Email already in use");
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        username: username.trim(),
        email: email.trim(),
        password: pass,
        solved: []
      };

      allUsers.push(newUser);
      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(allUsers));
      
      const token = `bearer-${newUser.id}`;
      await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
      const { password, ...safeUser } = newUser;
      setUser(safeUser);
      return true;
    } catch (e) { return false; }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      setUser(null); // This triggers the redirect in app/index.tsx
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = async (newUsername: string, newEmail: string) => {
    if (!user) return;
    await updateUserInDb(user.id, (dbUser) => ({
      ...dbUser,
      username: newUsername,
      email: newEmail
    }));
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    if (!user) return false;
    const allUsersRaw = await AsyncStorage.getItem(USERS_DB_KEY);
    const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    const dbUser = allUsers.find((u: any) => u.id === user.id);

    if (!dbUser || dbUser.password !== currentPass) return false;

    await updateUserInDb(user.id, (u) => ({ ...u, password: newPass }));
    return true;
  };

  const saveSolvedPuzzle = async (fact: any) => {
    if (!user) return;
    const factText = typeof fact === 'string' ? fact : fact.text;
    const alreadyExists = user.solved.some(item => {
      const existingText = typeof item === 'string' ? item : item.text;
      return existingText === factText;
    });

    if (alreadyExists) return;

    const newEntry = { text: factText, date: new Date().toISOString() };
    await updateUserInDb(user.id, (dbUser) => ({
      ...dbUser,
      solved: [newEntry, ...dbUser.solved]
    }));
  };

  const submitFeedback = async (text: string) => {
    if (!user) return false;
    try {
      const rawFeedback = await AsyncStorage.getItem(FEEDBACK_DB_KEY);
      const feedbacks = rawFeedback ? JSON.parse(rawFeedback) : [];
      
      feedbacks.push({
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        text,
        date: new Date().toISOString()
      });

      await AsyncStorage.setItem(FEEDBACK_DB_KEY, JSON.stringify(feedbacks));
      
      // LOGGING HERE SO YOU CAN SEE IT IN TERMINAL
      console.log("----------------------------------------");
      console.log("📩 FEEDBACK RECEIVED from " + user.username);
      console.log("📝 MESSAGE: " + text);
      console.log("----------------------------------------");
      
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, signup, logout, 
      updateProfile, changePassword, saveSolvedPuzzle, submitFeedback 
    }}>
      {children}
    </AuthContext.Provider>
  );
};