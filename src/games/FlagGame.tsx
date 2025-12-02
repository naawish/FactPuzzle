import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, ImageBackground, Image, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 
import { Button3D } from '../components/ui/Button3D';
import { COLORS, LAYOUT, SPACING, TEXT } from '../theme/theme';

// API: Get ALL countries, but only specific fields to keep it fast
const ALL_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,capital';

interface CountryData {
  name: { common: string };
  flags: { png: string; svg: string };
  capital: string[];
}

export default function FlagGame() {
  const { saveSolvedPuzzle } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext); 
  
  // Data State
  const [countryPool, setCountryPool] = useState<CountryData[]>([]);
  const [isPoolReady, setIsPoolReady] = useState(false);

  // Game State
  const [flagUrl, setFlagUrl] = useState('');
  const [correctCountry, setCorrectCountry] = useState('');
  const [capital, setCapital] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing'); 

  // Initial Load: Fetch World Data
  useEffect(() => {
    const initGame = async () => {
      try {
        const response = await axios.get(ALL_COUNTRIES_URL);
        const data: CountryData[] = response.data;

        // Filter out countries without capitals or weird data
        const validCountries = data.filter(c => c.name?.common && c.flags?.png && c.capital?.[0]);
        
        setCountryPool(validCountries);
        setIsPoolReady(true);
      } catch (error) {
        console.error("Failed to load countries:", error);
        Alert.alert("Connection Error", "Could not load country data. Please check internet.");
      }
    };

    initGame();
  }, []);

  // Start Round only when pool is ready
  useEffect(() => {
    if (isPoolReady && countryPool.length > 0) {
      startNewRound();
    }
  }, [isPoolReady]);

  const startNewRound = () => {
    setGameStatus('playing');
    
    if (countryPool.length < 4) return; // Safety check

    // 1. Pick 4 random UNIQUE indices
    const indices = new Set<number>();
    while (indices.size < 4) {
      indices.add(Math.floor(Math.random() * countryPool.length));
    }
    
    const selection = Array.from(indices).map(i => countryPool[i]);
    
    // 2. Pick a winner from the 4
    const winner = selection[Math.floor(Math.random() * 4)];
    
    // 3. Set State (Instant, no API call needed per round)
    setOptions(selection.map(c => c.name.common));
    setCorrectCountry(winner.name.common);
    setFlagUrl(winner.flags.png);
    setCapital(winner.capital[0]);
  };

  const handleGuess = (selected: string) => {
    if (selected === correctCountry) {
      setGameStatus('won');
      const factString = `Flag Master: The capital of ${correctCountry} is ${capital}.`;
      saveSolvedPuzzle(factString);
    } else {
      setGameStatus('lost');
    }
  };

  // Styles Helpers
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const modalStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const textStyle = { color: theme.text };

  // If initial data hasn't loaded yet
  if (!isPoolReady) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10, fontWeight: 'bold' }}>Loading World Data...</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.webContainer}>

          {/* FLAG CARD */}
          <View style={[styles.flagCard, cardStyle]}>
             <Text style={[styles.header, { color: theme.primary }]}>GUESS THE COUNTRY</Text>
             
             <View style={styles.imageContainer}>
               {flagUrl ? (
                 <Image source={{ uri: flagUrl }} style={styles.flagImage} resizeMode="stretch" />
               ) : (
                 <ActivityIndicator size="large" color={theme.primary} />
               )}
             </View>
          </View>

          {/* OPTIONS GRID */}
          <View style={styles.optionsGrid}>
            {options.map((option) => (
              <Button3D 
                key={option}
                label={option} 
                onPress={() => handleGuess(option)}
                style={styles.optionBtn}
                textStyle={{ fontSize: option.length > 15 ? 11 : 13 }} // Shrink text for long names like "Bosnia and Herzegovina"
                disabled={gameStatus !== 'playing'}
              />
            ))}
          </View>

        </View>
      </ScrollView>

      {/* RESULT MODAL */}
      <Modal visible={gameStatus !== 'playing'} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            
            <Text style={[
              styles.modalTitle, 
              { color: gameStatus === 'won' ? theme.success : theme.danger }
            ]}>
              {gameStatus === 'won' ? "CORRECT!" : "WRONG!"}
            </Text>
            
            <View style={styles.modalContent}>
              {gameStatus === 'won' ? (
                <Text style={[styles.factText, textStyle]}>
                  You identified <Text style={{fontWeight:'bold', color: theme.primary}}>{correctCountry}</Text>!
                  {"\n\n"}The capital is {capital}.
                </Text>
              ) : (
                <Text style={[styles.factText, textStyle]}>
                  That was <Text style={{fontWeight:'bold', color: theme.primary}}>{correctCountry}</Text>.
                </Text>
              )}
            </View>
            
            <Button3D 
              label={gameStatus === 'won' ? "NEXT FLAG" : "TRY AGAIN"} 
              variant="primary" 
              onPress={startNewRound} 
              style={{ width: '100%' }}
            />

          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  webContainer: { width: '100%', maxWidth: 500, alignSelf: 'center', alignItems: 'center' },

  flagCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    marginBottom: 30,
    alignItems: 'center',
    elevation: 5
  },
  header: { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  
  imageContainer: {
    width: 300, 
    height: 180, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#ccc',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  flagImage: { 
    width: '100%', 
    height: '100%', 
  },

  optionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15
  },
  optionBtn: {
    width: '47%', 
    marginBottom: 10
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 340, borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 4, borderBottomWidth: 8, elevation: 20 },
  modalTitle: { fontSize: 32, fontWeight: '900', marginBottom: 20, letterSpacing: 1 },
  modalContent: { marginBottom: 30, alignItems: 'center' },
  factText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
});