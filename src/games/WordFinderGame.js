// src/games/WordFinderGame.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, PanResponder, ImageBackground, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 

// YOUR API KEYS
const FACTS_API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR'; 
const GRID_SIZE = 8; 

export default function WordFinderGame() {
  const { user, saveSolvedPuzzle } = useContext(AuthContext); 
  const { theme } = useContext(ThemeContext); 

  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState('');
  const [grid, setGrid] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  
  // Hint States
  const [hintLevel, setHintLevel] = useState(0);
  const [definition, setDefinition] = useState('');
  const [defLoading, setDefLoading] = useState(false);

  // Modal
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Refs
  const gridRef = useRef([]); 
  const targetWordRef = useRef(''); 
  const selectionRef = useRef([]);  
  const selectionOriginRef = useRef(null); 
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
    setSuccessModalVisible(false); 
    setSelectedLetters([]);
    selectionRef.current = []; 
    setHintLevel(0);
    setDefinition('');
    
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/facts', {
        headers: { 'X-Api-Key': FACTS_API_KEY }
      });
      const factText = response.data[0].fact;
      setFact(factText);
      generatePuzzle(factText);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Could not load puzzle.");
    }
  };

  // --- FIXED SAVE LOGIC ---
  const saveFact = async () => {
    if (!user || !user.solved) return;

    // Check if this fact is already saved
    // We handle both old data (strings) and new data (objects with .text)
    const isAlreadySolved = user.solved.some(item => {
      if (typeof item === 'string') return item === fact;
      return item.text === fact;
    });

    if (isAlreadySolved) {
      console.log("Fact already solved, skipping save.");
      return;
    }
    
    console.log("Saving new fact:", fact);
    await saveSolvedPuzzle(fact);
  };
  // -----------------------

  const handleHintPress = async () => {
    if (hintLevel === 0) {
      setHintLevel(1);
    } else if (hintLevel === 1) {
      setDefLoading(true);
      try {
        console.log("Fetching definition for:", targetWord);
        const res = await axios.get(`https://api.api-ninjas.com/v1/dictionary?word=${targetWord}`, {
          headers: { 'X-Api-Key': FACTS_API_KEY }
        });
        
        if (res.data.definition) {
          let cleanDef = res.data.definition.replace(new RegExp(targetWord, 'gi'), "___");
          cleanDef = cleanDef.replace(/^\d+\.\s*/, "").trim();
          if (cleanDef.length > 120) cleanDef = cleanDef.substring(0, 120) + "...";
          setDefinition(cleanDef);
        } else {
          setDefinition("Definition unavailable for this word.");
        }
        setHintLevel(2);
      } catch (error) {
        console.error(error);
        setDefinition("Could not fetch definition.");
        setHintLevel(2);
      } finally {
        setDefLoading(false);
      }
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

  const getLineBetween = (startIdx, endIdx) => {
    const startRow = Math.floor(startIdx / GRID_SIZE);
    const startCol = startIdx % GRID_SIZE;
    const endRow = Math.floor(endIdx / GRID_SIZE);
    const endCol = endIdx % GRID_SIZE;

    const diffRow = endRow - startRow;
    const diffCol = endCol - startCol;

    const isHorizontal = diffRow === 0;
    const isVertical = diffCol === 0;
    const isDiagonal = Math.abs(diffRow) === Math.abs(diffCol);

    if (!isHorizontal && !isVertical && !isDiagonal) return null; 

    const steps = Math.max(Math.abs(diffRow), Math.abs(diffCol));
    const stepRow = steps === 0 ? 0 : diffRow / steps;
    const stepCol = steps === 0 ? 0 : diffCol / steps;

    const lineIndices = [];
    for (let i = 0; i <= steps; i++) {
      const r = startRow + (stepRow * i);
      const c = startCol + (stepCol * i);
      lineIndices.push(r * GRID_SIZE + c);
    }
    return lineIndices;
  };

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
        selectionOriginRef.current = null;

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

  const updateSelection = (currentIndex, isStart) => {
    const currentGrid = gridRef.current;
    if (isStart) {
      selectionOriginRef.current = currentIndex; 
      const newSel = [{ index: currentIndex, letter: currentGrid[currentIndex] }];
      selectionRef.current = newSel;
      setSelectedLetters(newSel);
      return;
    }

    const originIndex = selectionOriginRef.current;
    if (originIndex === null) return;
    const lineIndices = getLineBetween(originIndex, currentIndex);

    if (lineIndices) {
      const newSel = lineIndices.map(idx => ({
        index: idx,
        letter: currentGrid[idx]
      }));
      selectionRef.current = newSel;
      setSelectedLetters(newSel);
    } 
  };

  useEffect(() => {
    const formedWord = selectedLetters.map(s => s.letter).join('');
    if (formedWord && formedWord === targetWord) {
      saveFact(); // Save First
      setSuccessModalVisible(true); // Then Show Modal
    } 
  }, [selectedLetters, targetWord]); 

  const handleNextPuzzle = () => {
    setSuccessModalVisible(false);
    fetchFact();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary}/></View>;

  // Styles
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const hintTextStyle = { color: theme.text };
  const hintLabelStyle = { color: theme.primary };
  const gridStyle = { borderColor: theme.border, backgroundColor: theme.card };
  const skipBtnStyle = { backgroundColor: theme.danger, borderColor: theme.danger, borderBottomColor: theme.dangerShadow };
  const modalStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const modalTextStyle = { color: theme.text };
  const primaryBtnStyle = { backgroundColor: theme.primary, borderBottomColor: theme.shadow };

  const getHintBtnColor = () => {
    if (hintLevel === 0) return '#4682B4'; 
    if (hintLevel === 1) return '#8A2BE2'; 
    return '#555'; 
  };
  
  const getHintBtnText = () => {
    if (defLoading) return "...";
    if (hintLevel === 0) return "HINT (1/2)";
    if (hintLevel === 1) return "HINT (2/2)";
    return "MAX HINTS";
  };

  const hintBtnStyle = { 
    backgroundColor: getHintBtnColor(), 
    borderColor: getHintBtnColor(), 
    borderBottomColor: hintLevel === 2 ? '#333' : '#2F5D85' 
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
          {hintLevel >= 1 ? ` | Starts: ${targetWord[0]}` : ''}
        </Text>
      </View>

      {hintLevel >= 2 && (
        <View style={[styles.defContainer, { backgroundColor: theme.card, borderColor: theme.primary }]}>
          <Text style={[styles.defLabel, { color: theme.primary }]}>DEFINITION:</Text>
          <Text style={[styles.defText, { color: theme.text }]}>{definition}</Text>
        </View>
      )}
      
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
                { borderColor: theme.background === '#0F172A' ? '#334155' : '#eee' }, 
                isSelected && { backgroundColor: theme.primary } 
              ]} 
            >
              <Text style={[
                styles.cellText,
                isSelected && { color: '#FFF' }
              ]}>{letter}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.gameBtn, hintBtnStyle]} onPress={handleHintPress} disabled={hintLevel >= 2}>
          <Text style={styles.btnText}>{getHintBtnText()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gameBtn, skipBtnStyle]} onPress={fetchFact}>
          <Text style={styles.btnText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={successModalVisible} transparent={true} animationType="slide" onRequestClose={handleNextPuzzle}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>PUZZLE SOLVED!</Text>
            <View style={styles.modalContent}>
              <Text style={[styles.factLabel, { color: theme.subText }]}>DID YOU KNOW?</Text>
              <Text style={[styles.fullFactText, modalTextStyle]}>"{fact}"</Text>
            </View>
            <TouchableOpacity style={[styles.nextBtn, primaryBtnStyle]} onPress={handleNextPuzzle}>
              <Text style={styles.nextBtnText}>NEXT PUZZLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 10, padding: 15, borderRadius: 20, width: '100%', borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  hintLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  hintText: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  clueContainer: { backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 15, marginBottom: 10, borderWidth: 2 },
  clueText: { fontSize: 14, fontWeight: 'bold' },
  defContainer: { width: '100%', padding: 10, borderRadius: 15, borderWidth: 2, marginBottom: 10, alignItems: 'center', minHeight: 60, justifyContent: 'center' },
  defLabel: { fontSize: 10, fontWeight: '900', marginBottom: 2 },
  defText: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  gridContainer: { width: '100%', aspectRatio: 1, flexDirection: 'row', flexWrap: 'wrap', borderWidth: 4, borderRadius: 10, overflow: 'hidden' },
  cell: { width: '12.5%', height: '12.5%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5 },
  cellText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  footer: { marginTop: 20, flexDirection: 'row', gap: 20 },
  gameBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center', borderBottomWidth: 5, minWidth: 120 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', borderRadius: 30, padding: 25, alignItems: 'center', borderWidth: 4, borderBottomWidth: 8, elevation: 20 },
  modalTitle: { fontSize: 28, fontWeight: '900', marginBottom: 15, letterSpacing: 1, textAlign: 'center' },
  modalContent: { marginBottom: 25, alignItems: 'center' },
  factLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  fullFactText: { fontSize: 18, textAlign: 'center', lineHeight: 26, fontWeight: '600' },
  nextBtn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 50, borderBottomWidth: 6, elevation: 5 },
  nextBtnText: { color: '#FFF', fontWeight: '900', fontSize: 20, letterSpacing: 1 }
});