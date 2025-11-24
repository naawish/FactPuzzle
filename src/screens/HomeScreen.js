// src/screens/HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR';

// --- DYNAMIC SIZING CALCULATIONS ---
const { width } = Dimensions.get('window');
const GRID_SIZE = 8; // 8x8 Grid
const CONTAINER_PADDING = 20; // The padding of the main screen
const GRID_BORDER_WIDTH = 2; 

// Calculate the available width for the grid
// Screen Width - (Padding * 2) - (Border * 2)
const AVAILABLE_WIDTH = width - (CONTAINER_PADDING * 2) - (GRID_BORDER_WIDTH * 2);

// Calculate exact size per cell to fit 8 in a row
const CELL_SIZE = Math.floor(AVAILABLE_WIDTH / GRID_SIZE);

// Recalculate total grid size to be perfectly snug
const FINAL_GRID_SIZE = CELL_SIZE * GRID_SIZE;

export default function HomeScreen() {
  const { user, setUser } = useContext(AuthContext);
  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState('');
  const [grid, setGrid] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [showFirstLetter, setShowFirstLetter] = useState(false);

  useEffect(() => {
    fetchFact();
  }, []);

  const fetchFact = async () => {
    setLoading(true);
    setSelectedLetters([]);
    setShowFirstLetter(false);
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/facts', {
        headers: { 'X-Api-Key': API_KEY }
      });
      const factText = response.data[0].fact;
      setFact(factText);
      generatePuzzle(factText);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch fact.');
      setLoading(false);
    }
  };

  const generatePuzzle = (factText) => {
    // 1. Filter words: Length > 3 AND Length <= 8
    const cleanText = factText.replace(/[^a-zA-Z ]/g, "");
    const words = cleanText.split(" ").filter(w => w.length > 3 && w.length <= GRID_SIZE);
    
    const word = words.length > 0 ? words[Math.floor(Math.random() * words.length)].toUpperCase() : "FACTS";
    setTargetWord(word);

    // 2. Create Hint
    const maskedFact = factText.replace(new RegExp(word, 'gi'), "_______");
    setHint(maskedFact);

    // 3. Create Grid
    let newGrid = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newGrid.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }

    // 4. Place Word
    const startRow = Math.floor(Math.random() * GRID_SIZE);
    const maxCol = GRID_SIZE - word.length; 
    const startCol = Math.floor(Math.random() * (maxCol + 1)); 
    const startIndex = startRow * GRID_SIZE + startCol;

    for (let i = 0; i < word.length; i++) {
      newGrid[startIndex + i] = word[i];
    }
    
    setGrid(newGrid);
    setLoading(false);
  };

  const handleLetterPress = (index, letter) => {
    if (selectedLetters.find(s => s.index === index)) return;

    const newSelection = [...selectedLetters, { index, letter }];
    setSelectedLetters(newSelection);

    const formedWord = newSelection.map(s => s.letter).join('');
    
    if (formedWord === targetWord) {
      Alert.alert("SUCCESS!", `The fact was:\n\n"${fact}"`, [
        { text: "Next Puzzle", onPress: saveFactAndReset }
      ]);
    } else if (formedWord.length >= targetWord.length) {
      setTimeout(() => setSelectedLetters([]), 500);
    }
  };

  const saveFactAndReset = async () => {
    const updatedUser = { ...user, solved: [...(user.solved || []), fact] };
    setUser(updatedUser);
    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
    fetchFact();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF8C00"/></View>;

  return (
    <View style={styles.container}>
      <View style={styles.hintContainer}>
         <Text style={styles.hintLabel}>Complete the Fact:</Text>
         <Text style={styles.hintText}>"{hint}"</Text>
      </View>

      <Text style={styles.clue}>
        Word Length: {targetWord.length} letters 
        {showFirstLetter ? ` | Starts with: ${targetWord[0]}` : ''}
      </Text>
      
      {/* GRID CONTAINER */}
      {/* We set explicit Width and Height based on calculations so border fits perfectly */}
      <View style={[styles.grid, { width: FINAL_GRID_SIZE, height: FINAL_GRID_SIZE }]}>
        {grid.map((letter, index) => {
          const isSelected = selectedLetters.find(s => s.index === index);
          return (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.cell, 
                { width: CELL_SIZE, height: CELL_SIZE }, // Dynamic Size
                isSelected && styles.cellSelected
              ]} 
              onPress={() => handleLetterPress(index, letter)}
            >
              <Text style={styles.cellText}>{letter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.helperBtn} onPress={() => setShowFirstLetter(true)}>
          <Text style={styles.helperText}>Hint</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={fetchFact}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: CONTAINER_PADDING, 
    alignItems: 'center', 
    backgroundColor: '#FFF5E1', 
    justifyContent: 'center' 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  hintContainer: { marginBottom: 15, padding: 15, backgroundColor: '#FFF', borderRadius: 10, width: '100%', elevation: 3 },
  hintLabel: { fontSize: 12, color: '#FF8C00', fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  hintText: { fontSize: 16, color: '#333', fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  clue: { fontSize: 14, color: '#FF4500', marginBottom: 15, fontWeight: 'bold' },
  
  // Grid Styles
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    backgroundColor: '#fff', 
    borderColor: '#FF8C00', 
    borderWidth: GRID_BORDER_WIDTH,
    borderRadius: 5,
    overflow: 'hidden' // Ensures nothing spills out
  },
  
  cell: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 0.5, 
    borderColor: '#eee' 
  },
  
  cellSelected: { backgroundColor: '#FFFF00' },
  cellText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  footer: { marginTop: 20, flexDirection: 'row', gap: 20 },
  helperBtn: { paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#4682B4', borderRadius: 20 },
  helperText: { color: '#fff', fontWeight: 'bold' },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#FF6347', borderRadius: 20 },
  skipText: { color: '#fff', fontWeight: 'bold' }
});