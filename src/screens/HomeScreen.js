// src/screens/HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR';

export default function HomeScreen() {
  const { user, setUser } = useContext(AuthContext);
  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState(''); // New State for the blanked-out sentence
  const [grid, setGrid] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [showFirstLetter, setShowFirstLetter] = useState(false); // Helper state

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
      Alert.alert('Error', 'Could not fetch fact. Check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const generatePuzzle = (factText) => {
    // 1. Clean text to find suitable words (remove punctuation)
    const cleanText = factText.replace(/[^a-zA-Z ]/g, "");
    const words = cleanText.split(" ").filter(w => w.length > 4);
    
    // Default to "FACTS" if no long words found
    const word = words.length > 0 ? words[Math.floor(Math.random() * words.length)].toUpperCase() : "FACTS";
    setTargetWord(word);

    // 2. Create the Hint: Replace the chosen word in the original text with underscores
    // We use Regex to replace it case-insensitively
    const maskedFact = factText.replace(new RegExp(word, 'gi'), "_______");
    setHint(maskedFact);

    // 3. Create a 6x6 grid
    const gridSize = 6;
    let newGrid = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      newGrid.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }

    // 4. Place the target word horizontally
    // Ensure it fits in the row
    const startRow = Math.floor(Math.random() * gridSize);
    const maxCol = gridSize - word.length;
    const startCol = Math.floor(Math.random() * (maxCol + 1)); 
    const startIndex = startRow * gridSize + startCol;

    for (let i = 0; i < word.length; i++) {
      newGrid[startIndex + i] = word[i];
    }
    
    setGrid(newGrid);
  };

  const handleLetterPress = (index, letter) => {
    const newSelection = [...selectedLetters, { index, letter }];
    setSelectedLetters(newSelection);

    const formedWord = newSelection.map(s => s.letter).join('');
    
    if (formedWord === targetWord) {
      Alert.alert("PUZZLE SOLVED!", `The fact was:\n\n"${fact}"`, [
        { text: "Next Puzzle", onPress: saveFactAndReset }
      ]);
    } else if (formedWord.length >= targetWord.length) {
      // Wrong word, reset selection after short delay
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
      {/* The Hint Section */}
      <View style={styles.hintContainer}>
         <Text style={styles.hintLabel}>Complete the Fact:</Text>
         <Text style={styles.hintText}>"{hint}"</Text>
      </View>

      <Text style={styles.clue}>
        Word Length: {targetWord.length} letters 
        {showFirstLetter ? ` | Starts with: ${targetWord[0]}` : ''}
      </Text>
      
      {/* The Grid */}
      <View style={styles.grid}>
        {grid.map((letter, index) => {
          const isSelected = selectedLetters.find(s => s.index === index);
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.cell, isSelected && styles.cellSelected]} 
              onPress={() => handleLetterPress(index, letter)}
            >
              <Text style={styles.cellText}>{letter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.helperBtn} onPress={() => setShowFirstLetter(true)}>
          <Text style={styles.helperText}>Need a Clue?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={fetchFact}>
          <Text style={styles.skipText}>Skip Puzzle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#FFF5E1', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  hintContainer: { marginBottom: 20, padding: 15, backgroundColor: '#FFF', borderRadius: 10, width: '100%', elevation: 3 },
  hintLabel: { fontSize: 14, color: '#FF8C00', fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  hintText: { fontSize: 18, color: '#333', fontStyle: 'italic', textAlign: 'center', lineHeight: 26 },
  
  clue: { fontSize: 16, color: '#FF4500', marginBottom: 20, fontWeight: 'bold' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 300, height: 300, backgroundColor: '#fff', borderRadius: 10, elevation: 5, borderWidth: 2, borderColor: '#FF8C00' },
  cell: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  cellSelected: { backgroundColor: '#FFFF00' },
  cellText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  footer: { marginTop: 30, flexDirection: 'row', gap: 20 },
  helperBtn: { padding: 12, backgroundColor: '#4682B4', borderRadius: 20 },
  helperText: { color: '#fff', fontWeight: 'bold' },
  skipBtn: { padding: 12, backgroundColor: '#FF6347', borderRadius: 20 },
  skipText: { color: '#fff', fontWeight: 'bold' }
});