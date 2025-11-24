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
  const [grid, setGrid] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);

  useEffect(() => {
    fetchFact();
  }, []);

  const fetchFact = async () => {
    setLoading(true);
    setSelectedLetters([]);
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/facts', {
        headers: { 'X-Api-Key': API_KEY }
      });
      const factText = response.data[0].fact;
      setFact(factText);
      generatePuzzle(factText);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch fact');
    } finally {
      setLoading(false);
    }
  };

  const generatePuzzle = (factText) => {
    // 1. Pick a random word from the fact longer than 4 letters
    const words = factText.replace(/[^a-zA-Z ]/g, "").split(" ").filter(w => w.length > 4);
    const word = words.length > 0 ? words[Math.floor(Math.random() * words.length)].toUpperCase() : "FACTS";
    setTargetWord(word);

    // 2. Create a 6x6 grid filled with random letters
    const gridSize = 6;
    let newGrid = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      newGrid.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }

    // 3. Place the target word horizontally (simplified for newbie)
    const startRow = Math.floor(Math.random() * gridSize);
    const startCol = Math.floor(Math.random() * (gridSize - word.length));
    const startIndex = startRow * gridSize + startCol;

    for (let i = 0; i < word.length; i++) {
      newGrid[startIndex + i] = word[i];
    }
    
    setGrid(newGrid);
  };

  const handleLetterPress = (index, letter) => {
    const newSelection = [...selectedLetters, { index, letter }];
    setSelectedLetters(newSelection);

    // Check if the formed word matches target
    const formedWord = newSelection.map(s => s.letter).join('');
    
    if (formedWord === targetWord) {
      Alert.alert("PUZZLE SOLVED!", `The fact was:\n\n"${fact}"`, [
        { text: "Awesome!", onPress: saveFactAndReset }
      ]);
    } else if (formedWord.length >= targetWord.length) {
      // Wrong word, reset selection
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
      <Text style={styles.hint}>Find the hidden word related to the fact!</Text>
      <Text style={styles.clue}>Length: {targetWord.length} letters</Text>
      
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

      <TouchableOpacity style={styles.skipBtn} onPress={fetchFact}>
        <Text style={styles.skipText}>Skip Puzzle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#FFF5E1', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  clue: { fontSize: 16, color: '#FF4500', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 300, height: 300, backgroundColor: '#fff', borderRadius: 10, elevation: 5 },
  cell: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  cellSelected: { backgroundColor: '#FFFF00' },
  cellText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  skipBtn: { marginTop: 30, padding: 10, backgroundColor: '#ddd', borderRadius: 20 },
  skipText: { color: '#555' }
});