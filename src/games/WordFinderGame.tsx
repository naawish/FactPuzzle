import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Modal, 
  ImageBackground, 
  Alert, 
  PanResponder, 
  LayoutChangeEvent,
  Platform
} from 'react-native';
import { useNavigation } from 'expo-router'; // <--- 1. IMPORT THIS
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 
import { Ionicons } from '@expo/vector-icons';

// API & CONFIG
const API_KEY = process.env.EXPO_PUBLIC_API_NINJAS_KEY || ''; 
const GRID_SIZE = 8; 

// TYPES
type Direction = [number, number];
interface Difficulty {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  minLen: number;
  maxLen: number;
  directions: Direction[];
}

// DIFFICULTY SETTINGS
const DIFFICULTIES: Record<string, Difficulty> = {
  EASY: { 
    label: 'EASY', 
    icon: 'star', 
    minLen: 3, 
    maxLen: 5, 
    directions: [[0, 1]] 
  },
  MEDIUM: { 
    label: 'MEDIUM', 
    icon: 'flash', 
    minLen: 5, 
    maxLen: 7, 
    directions: [[0, 1], [1, 0]] 
  },
  HARD: { 
    label: 'HARD', 
    icon: 'skull', 
    minLen: 6, 
    maxLen: 8, 
    directions: [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]]
  }
};

export default function WordFinderGame() {
  const navigation = useNavigation(); // <--- 2. INITIALIZE NAVIGATION
  const { user, saveSolvedPuzzle } = useContext(AuthContext); 
  const { theme } = useContext(ThemeContext); 

  // Game Data
  const [fact, setFact] = useState('');
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState('');
  const [grid, setGrid] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{index: number, letter: string}[]>([]);
  
  // Solution Tracking
  const [solutionIndices, setSolutionIndices] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // UI States
  const [loading, setLoading] = useState(false);
  const [difficultyModalVisible, setDifficultyModalVisible] = useState(true); 
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null); 
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  // Hints
  const [hintLevel, setHintLevel] = useState(0);
  const [definition, setDefinition] = useState('');
  const [defLoading, setDefLoading] = useState(false);

  // Refs
  const gridRef = useRef<string[]>([]); 
  const targetWordRef = useRef(''); 
  const factRef = useRef('');
  const selectionRef = useRef<{index: number, letter: string}[]>([]);  
  const selectionOriginRef = useRef<number | null>(null); 
  const containerRef = useRef<View>(null);
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Refs
  useEffect(() => { targetWordRef.current = targetWord; }, [targetWord]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { factRef.current = fact; }, [fact]); 

  // --- 1. START GAME ---
  const startGame = (diffKey: string) => {
    const settings = DIFFICULTIES[diffKey];
    setSelectedDifficulty(settings); 
    setDifficultyModalVisible(false);
    fetchFact(settings);
  };

  // --- 2. FETCH LOGIC ---
  const fetchFact = async (difficultySettings?: Difficulty) => {
    const activeDifficulty = (difficultySettings && difficultySettings.minLen) 
      ? difficultySettings 
      : selectedDifficulty;

    if (!activeDifficulty) {
      setDifficultyModalVisible(true);
      return;
    }

    setLoading(true);
    setSuccessModalVisible(false); 
    setSelectedLetters([]);
    selectionRef.current = []; 
    setHintLevel(0);
    setDefinition('');
    setGameStatus('playing'); 
    
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/facts', {
        headers: { 'X-Api-Key': API_KEY }
      });
      const factText = response.data[0].fact;
      setFact(factText);
      generatePuzzle(factText, activeDifficulty);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Could not load puzzle. Check internet connection.");
    }
  };

  // --- 3. PUZZLE GENERATION ---
  const generatePuzzle = (factText: string, difficulty: Difficulty) => {
    const cleanText = factText.replace(/[^a-zA-Z ]/g, "");
    const words = cleanText.split(" ").filter(w => w.length >= difficulty.minLen && w.length <= difficulty.maxLen);
    
    let word = words.length > 0 ? words[Math.floor(Math.random() * words.length)].toUpperCase() : "PUZZLE"; 
    if (word.length > GRID_SIZE) word = "FACTS"; 

    setTargetWord(word);
    const maskedFact = factText.replace(new RegExp(word, 'gi'), "_______");
    setHint(maskedFact);

    let newGrid = new Array(GRID_SIZE * GRID_SIZE).fill('');
    const dirs = difficulty.directions;
    const [dRow, dCol] = dirs[Math.floor(Math.random() * dirs.length)];

    let placed = false;
    let attempts = 0;
    let solution: number[] = [];
    
    while (!placed && attempts < 100) {
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);
      const endRow = startRow + (dRow * (word.length - 1));
      const endCol = startCol + (dCol * (word.length - 1));

      if (endRow >= 0 && endRow < GRID_SIZE && endCol >= 0 && endCol < GRID_SIZE) {
        solution = [];
        for (let i = 0; i < word.length; i++) {
          const r = startRow + (dRow * i);
          const c = startCol + (dCol * i);
          const idx = r * GRID_SIZE + c;
          newGrid[idx] = word[i];
          solution.push(idx);
        }
        placed = true;
      }
      attempts++;
    }

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < newGrid.length; i++) {
      if (newGrid[i] === '') newGrid[i] = alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    setGrid(newGrid);
    setSolutionIndices(solution);
    setLoading(false);
  };

  // --- 4. GESTURE LOGIC ---
  const getLineBetween = (startIdx: number, endIdx: number) => {
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
    const lineIndices = [];
    for (let i = 0; i <= steps; i++) {
      const r = startRow + (diffRow === 0 ? 0 : Math.sign(diffRow) * i);
      const c = startCol + (diffCol === 0 ? 0 : Math.sign(diffCol) * i);
      lineIndices.push(r * GRID_SIZE + c);
    }
    return lineIndices;
  };

  const handlePan = (evt: any, isStart: boolean) => {
    if (gameStatus !== 'playing') return;

    const touchX = evt.moveX;
    const touchY = evt.moveY;

    // Get stored layout
    const { x, y, width, height } = layoutRef.current;
    
    if (!width || !height) return;

    const relativeX = touchX - x;
    const relativeY = touchY - y;

    if (relativeX < 0 || relativeY < 0 || relativeX > width || relativeY > height) return;

    const cellSize = width / GRID_SIZE;
    const col = Math.floor(relativeX / cellSize);
    const row = Math.floor(relativeY / cellSize);
    
    if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return;

    const index = row * GRID_SIZE + col;
    updateSelection(index, isStart);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      
      onPanResponderGrant: (evt, gestureState) => {
        if (gameStatus !== 'playing') return;
        
        // Re-measure on start to be safe
        containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
          layoutRef.current = { x: pageX, y: pageY, width, height };
          
          if (clearTimerRef.current) {
            clearTimeout(clearTimerRef.current);
            clearTimerRef.current = null;
          }
          // Use pageX/Y from native event for the first touch
          handlePan({ moveX: evt.nativeEvent.pageX, moveY: evt.nativeEvent.pageY }, true);
        });
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (gameStatus !== 'playing') return;
        // Use moveX/Y from gestureState for dragging
        handlePan(gestureState, false);
      },

      onPanResponderRelease: () => {
        if (gameStatus !== 'playing') return;

        const currentSelection = selectionRef.current.map(s => s.letter).join('');
        const correct = targetWordRef.current;
        selectionOriginRef.current = null;

        const reversedSelection = currentSelection.split('').reverse().join('');
        
        if (currentSelection === correct || reversedSelection === correct) {
          setGameStatus('won');
          saveFact(); 
          setSuccessModalVisible(true);
        } else {
           clearTimerRef.current = setTimeout(() => {
            setSelectedLetters([]);
            selectionRef.current = [];
          }, 300); 
        }
      }
    })
  ).current;

  const updateSelection = (currentIndex: number, isStart: boolean) => {
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

  // --- 5. ACTIONS ---
  const handleNextPuzzle = () => {
    setSuccessModalVisible(false);
    fetchFact();
  };

  const handleBackToMenu = () => {
    setSuccessModalVisible(false);
    navigation.goBack(); // <--- 3. CORRECT NAVIGATION BACK
  };

  const handleSkip = () => {
    fetchFact(selectedDifficulty || DIFFICULTIES.EASY);
  };

  const handleGiveUp = () => {
    setGameStatus('lost');
    const solution = solutionIndices.map(idx => ({
      index: idx,
      letter: grid[idx]
    }));
    setSelectedLetters(solution);
    setSuccessModalVisible(true);
  };

  const saveFact = async () => {
    const currentFact = factRef.current; 
    if (!user || !user.solved) return;
    
    const isAlreadySolved = user.solved.some((item: any) => {
      if (typeof item === 'string') return item === currentFact;
      return item.text === currentFact;
    });
    
    if (isAlreadySolved) return;
    await saveSolvedPuzzle(currentFact);
  };

  const handleHintPress = async () => {
    if (hintLevel === 0) {
      setHintLevel(1);
    } else if (hintLevel === 1) {
      setDefLoading(true);
      try {
        const res = await axios.get(`https://api.api-ninjas.com/v1/dictionary?word=${targetWord}`, {
          headers: { 'X-Api-Key': API_KEY }
        });
        if (res.data.definition) {
          let cleanDef = res.data.definition.replace(new RegExp(targetWord, 'gi'), "___");
          cleanDef = cleanDef.replace(/^\d+\.\s*/, "").trim();
          if (cleanDef.length > 120) cleanDef = cleanDef.substring(0, 120) + "...";
          setDefinition(cleanDef);
        } else {
          setDefinition("Definition unavailable.");
        }
        setHintLevel(2);
      } catch (error) {
        setDefinition("Could not fetch definition.");
        setHintLevel(2);
      } finally {
        setDefLoading(false);
      }
    }
  };

  // Styles
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const gridStyle = { borderColor: theme.border, backgroundColor: theme.card };
  const modalStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const textStyle = { color: theme.text };
  const hintBtnColor = hintLevel === 0 ? '#4682B4' : hintLevel === 1 ? '#8A2BE2' : '#555';

  if (loading && !difficultyModalVisible) return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary}/></View>;

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      
      {/* 1. DIFFICULTY MODAL */}
      <Modal visible={difficultyModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>SELECT DIFFICULTY</Text>
            <View style={styles.difficultyContainer}>
              {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                <TouchableOpacity 
                  key={level}
                  style={[styles.diffCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => startGame(level)}
                >
                  <Ionicons name={DIFFICULTIES[level].icon as any} size={40} color={theme.primary} />
                  <Text style={[styles.diffText, { color: theme.text }]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. GAME UI */}
      <View style={styles.webContainer}>
        
        <View style={[styles.card, cardStyle]}>
           <Text style={[styles.hintLabel, { color: theme.primary }]}>Complete the Fact:</Text>
           <Text style={[styles.hintText, textStyle]}>"{hint}"</Text>
        </View>

        <View style={[styles.clueContainer, { borderColor: theme.danger }]}>
          <Text style={[styles.clueText, { color: theme.danger }]}>
            Length: {targetWord.length} 
            {hintLevel >= 1 ? ` | Starts: ${targetWord[0]}` : ''}
            {selectedDifficulty ? ` | ${selectedDifficulty.label}` : ''}
          </Text>
        </View>

        {hintLevel >= 2 && (
          <View style={[styles.defContainer, cardStyle]}>
            <Text style={[styles.defLabel, { color: theme.primary }]}>DEFINITION:</Text>
            <Text style={[styles.defText, textStyle]}>{definition}</Text>
          </View>
        )}
        
        {/* GRID */}
        <View 
          ref={containerRef}
          style={[styles.gridContainer, gridStyle]}
          {...panResponder.panHandlers} 
        >
          <View style={styles.touchOverlay} />

          {grid.map((letter, index) => {
            const isSelected = selectedLetters.find(s => s.index === index);
            return (
              <View 
                key={index} 
                style={[
                  styles.cell, 
                  { borderColor: theme.background === '#0F172A' ? '#64748B' : '#eee' }, 
                  isSelected && { backgroundColor: gameStatus === 'lost' ? theme.danger : theme.primary }
                ]}
              >
                <Text style={[
                  styles.cellText, 
                  { color: isSelected ? '#FFF' : theme.text }
                ]}>
                  {letter}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.gameBtn, { backgroundColor: hintBtnColor, borderBottomColor: '#222', flex: 1 }]} 
            onPress={handleHintPress} disabled={hintLevel >= 2 || gameStatus !== 'playing'}
          >
            <Text style={styles.btnText}>{hintLevel === 0 ? "HINT 1" : hintLevel === 1 ? "HINT 2" : "MAX"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gameBtn, { backgroundColor: theme.danger, borderBottomColor: theme.dangerShadow, flex: 1 }]} 
            onPress={handleGiveUp}
            disabled={gameStatus !== 'playing'}
          >
            <Text style={styles.btnText}>GIVE UP</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gameBtn, { backgroundColor: '#475569', borderBottomColor: '#1E293B', flex: 0.8 }]} 
            onPress={handleSkip}
          >
            <Text style={styles.btnText}>SKIP</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* SUCCESS / FAIL MODAL */}
      <Modal visible={successModalVisible} transparent={true} animationType="slide" onRequestClose={handleNextPuzzle}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            <Text style={[styles.modalTitle, { color: gameStatus === 'won' ? theme.primary : theme.danger }]}>
              {gameStatus === 'won' ? "PUZZLE SOLVED!" : "GAME OVER"}
            </Text>
            <View style={styles.modalContent}>
              <Text style={[styles.factLabel, { color: theme.subText }]}>DID YOU KNOW?</Text>
              <Text style={[styles.fullFactText, textStyle]}>"{fact}"</Text>
            </View>
            
            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#E0E0E0', borderBottomColor: '#999' }]} 
                onPress={handleBackToMenu}
              >
                <Text style={[styles.btnText, { color: '#555' }]}>MENU</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.primary, borderBottomColor: theme.shadow, flex: 1.5 }]} 
                onPress={handleNextPuzzle}
              >
                <Text style={styles.btnText}>NEXT</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  webContainer: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 20 },
  
  card: { marginBottom: 10, padding: 15, borderRadius: 20, width: '100%', borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5 },
  hintLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  hintText: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', fontWeight: '500' },
  
  clueContainer: { backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 15, marginBottom: 10, borderWidth: 2 },
  clueText: { fontSize: 14, fontWeight: 'bold' },

  defContainer: { width: '100%', padding: 10, borderRadius: 15, borderWidth: 2, marginBottom: 10, alignItems: 'center' },
  defLabel: { fontSize: 10, fontWeight: '900', marginBottom: 2 },
  defText: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  
  gridContainer: { 
    width: '100%', aspectRatio: 1, flexDirection: 'row', flexWrap: 'wrap', 
    borderWidth: 4, borderRadius: 10, overflow: 'hidden', position: 'relative' 
  },
  
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.001)',
    zIndex: 10
  },

  cell: { width: '12.5%', height: '12.5%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5 },
  cellText: { fontSize: 20, fontWeight: 'bold' },
  
  footer: { marginTop: 20, flexDirection: 'row', gap: 10, width: '100%' },
  gameBtn: { paddingVertical: 12, borderRadius: 15, alignItems: 'center', borderBottomWidth: 4 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 340, borderRadius: 30, padding: 25, alignItems: 'center', borderWidth: 4, borderBottomWidth: 8, elevation: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20, letterSpacing: 1 },
  
  difficultyContainer: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  diffCard: { width: 90, height: 120, borderRadius: 15, borderWidth: 3, borderBottomWidth: 6, justifyContent: 'center', alignItems: 'center', padding: 5 },
  diffText: { fontWeight: '900', fontSize: 12, marginTop: 10 },

  modalContent: { marginBottom: 25, alignItems: 'center' },
  factLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  fullFactText: { fontSize: 16, textAlign: 'center', fontWeight: '600' },
  
  modalBtnRow: { flexDirection: 'row', width: '100%', gap: 15 },
  modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 50, borderBottomWidth: 6, alignItems: 'center' }
});