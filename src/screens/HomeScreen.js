// src/screens/HomeScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, PanResponder, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // <--- IMPORT THIS

const API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR';
const GRID_SIZE = 8; 

export default function HomeScreen() {
  const { user, setUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); // <--- USE THEME

  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState('');
  const [grid, setGrid] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [showFirstLetter, setShowFirstLetter] = useState(false);

  // Refs
  const gridRef = useRef([]); 
  const targetWordRef = useRef(''); 
  const selectionRef = useRef([]);  
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 });
  const gridViewRef = useRef(null);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    fetchFact();
  }, []);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    targetWordRef.current = targetWord;
  }, [targetWord]);

  const fetchFact = async () => {
    setLoading(true);
    setSelectedLetters([]);
    selectionRef.current = []; 
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

  // Gesture Logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (clearTimerRef.current) {
          clearTimeout(clearTimerRef.current);
          clearTimerRef.current = null;
        }
        handlePan(evt.nativeEvent.pageX, evt.nativeEvent.pageY, true); 
      },
      onPanResponderMove: (evt) => {
        handlePan(evt.nativeEvent.pageX, evt.nativeEvent.pageY, false);
      },
      onPanResponderRelease: () => {
        const currentWord = selectionRef.current.map(s => s.letter).join('');
        const correctWord = targetWordRef.current;
        if (currentWord !== correctWord) {
          clearTimerRef.current = setTimeout(() => {
            setSelectedLetters([]);
            selectionRef.current = [];
          }, 500); 
        }
      }
    })
  ).current;

  const handlePan = (pageX, pageY, isStart) => {
    const layout = layoutRef.current;
    if (!layout.width) return; 
    const relativeX = pageX - layout.pageX;
    const relativeY = pageY - layout.pageY;
    if (relativeX < 0 || relativeY < 0 || relativeX > layout.width || relativeY > layout.height) return;

    const cellSize = layout.width / GRID_SIZE;
    const col = Math.floor(relativeX / cellSize);
    const row = Math.floor(relativeY / cellSize);
    const index = row * GRID_SIZE + col;

    if (index >= 0 && index < GRID_SIZE * GRID_SIZE) {
      updateSelection(index, isStart);
    }
  };

  const updateSelection = (index, isStart) => {
    const currentGrid = gridRef.current; 
    const letter = currentGrid[index];
    if (isStart) {
      const newSel = [{ index, letter }];
      selectionRef.current = newSel; 
      setSelectedLetters(newSel);    
      return;
    }
    const prev = selectionRef.current;
    const alreadySelected = prev.find(item => item.index === index);
    if (!alreadySelected) {
      const newSel = [...prev, { index, letter }];
      selectionRef.current = newSel; 
      setSelectedLetters(newSel);    
    }
  };

  useEffect(() => {
    const formedWord = selectedLetters.map(s => s.letter).join('');
    if (formedWord && formedWord === targetWord) {
      Alert.alert("SUCCESS!", `The fact was:\n\n"${fact}"`, [
        { text: "Next Puzzle", onPress: saveFactAndReset }
      ]);
    } 
  }, [selectedLetters, targetWord, fact]); 

  const saveFactAndReset = async () => {
    const updatedUser = { ...user, solved: [...(user.solved || []), fact] };
    setUser(updatedUser);
    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
    fetchFact();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary}/></View>;

  // DYNAMIC STYLES
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const hintTextStyle = { color: theme.text };
  const hintLabelStyle = { color: theme.primary };
  const gridStyle = { borderColor: theme.border, backgroundColor: theme.card };
  
  // Skip Button Style
  const skipBtnStyle = { 
    backgroundColor: theme.danger, 
    borderColor: theme.danger,
    borderBottomColor: theme.dangerShadow 
  };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <View style={[styles.card, cardStyle]}>
         <Text style={[styles.hintLabel, hintLabelStyle]}>Complete the Fact:</Text>
         <Text style={[styles.hintText, hintTextStyle]}>"{hint}"</Text>
      </View>

      <View style={[styles.clueContainer, { borderColor: theme.danger }]}>
        <Text style={[styles.clueText, { color: theme.danger }]}>
          Length: {targetWord.length} 
          {showFirstLetter ? ` | Starts: ${targetWord[0]}` : ''}
        </Text>
      </View>
      
      <View 
        style={[styles.gridContainer, gridStyle]}
        ref={gridViewRef}
        {...panResponder.panHandlers} 
        onLayout={() => {
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
              style={[
                styles.cell, 
                // Grid Lines Color (lighter in dark mode)
                { borderColor: theme.background === '#0F172A' ? '#334155' : '#eee' }, 
                isSelected && { backgroundColor: theme.primary } // Purple selection
              ]} 
            >
              <Text style={[
                styles.cellText,
                // Text color changes on selection
                isSelected && { color: '#FFF' }
              ]}>{letter}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.gameBtn, styles.hintBtn]} onPress={() => setShowFirstLetter(true)}>
          <Text style={styles.btnText}>HINT</Text>
        </TouchableOpacity>

        {/* Dynamic Skip Button */}
        <TouchableOpacity style={[styles.gameBtn, skipBtnStyle]} onPress={fetchFact}>
          <Text style={styles.btnText}>SKIP</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  card: { 
    marginBottom: 15, padding: 20, borderRadius: 20, width: '100%', 
    borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, shadowRadius: 5, elevation: 5
  },
  hintLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  hintText: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  
  clueContainer: { 
    backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 5, paddingHorizontal: 15, 
    borderRadius: 15, marginBottom: 15, borderWidth: 2
  },
  clueText: { fontSize: 16, fontWeight: 'bold' },
  
  gridContainer: { 
    width: '100%', aspectRatio: 1, flexDirection: 'row', flexWrap: 'wrap', 
    borderWidth: 4, borderRadius: 10, overflow: 'hidden',        
  },
  
  cell: { width: '12.5%', height: '12.5%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5 },
  cellText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  footer: { marginTop: 25, flexDirection: 'row', gap: 20 },
  gameBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', borderBottomWidth: 5 },
  
  hintBtn: { backgroundColor: '#4682B4', borderColor: '#4682B4', borderBottomColor: '#2F5D85' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});