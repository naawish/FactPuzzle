// src/screens/HomeScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, PanResponder } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR';

// CONFIGURATION
const GRID_SIZE = 8; 

export default function HomeScreen() {
  const { user, setUser } = useContext(AuthContext);
  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState('');
  const [grid, setGrid] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [showFirstLetter, setShowFirstLetter] = useState(false);

  // --- REFS (The Fix for Stale State) ---
  // We use Refs to store data so PanResponder can access the LATEST values instantly
  const gridRef = useRef([]); 
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 });
  const gridViewRef = useRef(null);

  useEffect(() => {
    fetchFact();
  }, []);

  // Sync Ref with State whenever grid changes
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

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
    const cleanText = factText.replace(/[^a-zA-Z ]/g, "");
    const words = cleanText.split(" ").filter(w => w.length > 3 && w.length <= GRID_SIZE);
    
    const word = words.length > 0 ? words[Math.floor(Math.random() * words.length)].toUpperCase() : "FACTS";
    setTargetWord(word);

    const maskedFact = factText.replace(new RegExp(word, 'gi'), "_______");
    setHint(maskedFact);

    let newGrid = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newGrid.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }

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

  // --- GESTURE LOGIC ---

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        handlePan(evt.nativeEvent.pageX, evt.nativeEvent.pageY, true); 
      },
      onPanResponderMove: (evt) => {
        handlePan(evt.nativeEvent.pageX, evt.nativeEvent.pageY, false);
      },
    })
  ).current;

  const handlePan = (pageX, pageY, isStart) => {
    // FIX: Read from the REF, not the state. 
    // The Ref always has the current layout dimensions.
    const layout = layoutRef.current;
    
    if (!layout.width) return; // If we haven't measured yet, stop.

    const relativeX = pageX - layout.pageX;
    const relativeY = pageY - layout.pageY;

    if (relativeX < 0 || relativeY < 0 || relativeX > layout.width || relativeY > layout.height) {
      return;
    }

    const cellSize = layout.width / GRID_SIZE;
    const col = Math.floor(relativeX / cellSize);
    const row = Math.floor(relativeY / cellSize);
    const index = row * GRID_SIZE + col;

    if (index >= 0 && index < GRID_SIZE * GRID_SIZE) {
      updateSelection(index, isStart);
    }
  };

  const updateSelection = (index, isStart) => {
    setSelectedLetters(prev => {
      // FIX: Read grid from Ref to ensure we get the letter
      const currentGrid = gridRef.current; 
      const letter = currentGrid[index];

      if (isStart) {
        return [{ index, letter }];
      }
      
      const alreadySelected = prev.find(item => item.index === index);
      if (alreadySelected) return prev;

      return [...prev, { index, letter }];
    });
  };

  // Win Condition Check
  useEffect(() => {
    if (selectedLetters.length === 0) return;

    const formedWord = selectedLetters.map(s => s.letter).join('');
    
    if (formedWord === targetWord) {
      Alert.alert("SUCCESS!", `The fact was:\n\n"${fact}"`, [
        { text: "Next Puzzle", onPress: saveFactAndReset }
      ]);
    } 
  }, [selectedLetters]);

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
      
      <View 
        style={styles.gridContainer}
        ref={gridViewRef}
        {...panResponder.panHandlers} 
        onLayout={() => {
          // Measure the view and store it in the REF
          gridViewRef.current.measure((x, y, width, height, pageX, pageY) => {
            layoutRef.current = { x, y, width, height, pageX, pageY };
          });
        }}
      >
        {grid.map((letter, index) => {
          const isSelected = selectedLetters.find(s => s.index === index);
          return (
            <View 
              key={index} 
              style={[styles.cell, isSelected && styles.cellSelected]} 
            >
              <Text style={styles.cellText}>{letter}</Text>
            </View>
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
    padding: 20, 
    backgroundColor: '#FFF5E1', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  hintContainer: { marginBottom: 15, padding: 15, backgroundColor: '#FFF', borderRadius: 10, width: '100%', elevation: 3 },
  hintLabel: { fontSize: 12, color: '#FF8C00', fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  hintText: { fontSize: 16, color: '#333', fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  clue: { fontSize: 14, color: '#FF4500', marginBottom: 15, fontWeight: 'bold' },
  
  gridContainer: { 
    width: '100%',             
    aspectRatio: 1,            
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    backgroundColor: '#fff', 
    borderColor: '#FF8C00', 
    borderWidth: 2,
    borderRadius: 5,
    overflow: 'hidden',        
  },
  
  cell: { 
    width: '12.5%',            
    height: '12.5%',           
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