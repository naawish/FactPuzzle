// src/games/TicTacToeGame.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ImageBackground, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <--- 1. IMPORT THIS
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 
import { Ionicons } from '@expo/vector-icons';

// WINNING COMBINATIONS
const WIN_CONDITIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], 
  [0, 3, 6], [1, 4, 7], [2, 5, 8], 
  [0, 4, 8], [2, 4, 6]             
];

// MODES
const MODES = {
  EASY: { label: 'EASY', icon: 'star-outline' },
  MEDIUM: { label: 'MEDIUM', icon: 'star-half' },
  HARD: { label: 'IMPOSSIBLE', icon: 'star' },
  PVP: { label: '2 PLAYER', icon: 'people' }
};

export default function TicTacToeGame() {
  const navigation = useNavigation(); // <--- 2. INITIALIZE NAVIGATION
  const { theme } = useContext(ThemeContext);
  const { saveSolvedPuzzle } = useContext(AuthContext);

  // Game State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); 
  const [winner, setWinner] = useState(null); 
  const [gameMode, setGameMode] = useState(null); 
  const [difficultyModalVisible, setDifficultyModalVisible] = useState(true);
  const [isCpuThinking, setIsCpuThinking] = useState(false);

  // --- GAME LOOP ---
  useEffect(() => {
    if (gameMode && gameMode.label !== '2 PLAYER' && !isXNext && !winner) {
      const timeOut = setTimeout(() => {
        makeCpuMove();
      }, 600); 
      return () => clearTimeout(timeOut);
    }
  }, [isXNext, winner, gameMode]);

  // --- CORE LOGIC ---
  const handlePress = (index) => {
    if (board[index] || winner || isCpuThinking) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const endGame = (result) => {
    setWinner(result);
    if (result === 'X' && gameMode.label !== '2 PLAYER') {
      saveSolvedPuzzle(`Beat TicTacToe on ${gameMode.label}`);
    }
  };

  const checkWinner = (currentBoard) => {
    for (let logic of WIN_CONDITIONS) {
      const [a, b, c] = logic;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (!currentBoard.includes(null)) return 'Draw';
    return null;
  };

  // --- CPU INTELLIGENCE ---
  const makeCpuMove = () => {
    setIsCpuThinking(true);
    let moveIndex;

    if (gameMode.label === 'EASY') {
      moveIndex = getRandomMove(board);
    } else if (gameMode.label === 'MEDIUM') {
      if (Math.random() > 0.5) moveIndex = getBestMove(board);
      else moveIndex = getRandomMove(board);
    } else {
      moveIndex = getBestMove(board);
    }

    if (moveIndex !== null) {
      const newBoard = [...board];
      newBoard[moveIndex] = 'O';
      setBoard(newBoard);
      
      const result = checkWinner(newBoard);
      if (result) endGame(result);
      else setIsXNext(true);
    }
    setIsCpuThinking(false);
  };

  const getRandomMove = (currentBoard) => {
    const available = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  // --- MINIMAX ALGORITHM ---
  const getBestMove = (currentBoard) => {
    let bestScore = -Infinity;
    let move = null;
    
    currentBoard.forEach((cell, index) => {
      if (cell === null) {
        currentBoard[index] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[index] = null;
        if (score > bestScore) {
          bestScore = score;
          move = index;
        }
      }
    });
    return move;
  };

  const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner(board);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      board.forEach((cell, index) => {
        if (cell === null) {
          board[index] = 'O';
          let score = minimax(board, depth + 1, false);
          board[index] = null;
          bestScore = Math.max(score, bestScore);
        }
      });
      return bestScore;
    } else {
      let bestScore = Infinity;
      board.forEach((cell, index) => {
        if (cell === null) {
          board[index] = 'X';
          let score = minimax(board, depth + 1, true);
          board[index] = null;
          bestScore = Math.min(score, bestScore);
        }
      });
      return bestScore;
    }
  };

  // --- NAVIGATION ---
  const startGame = (modeKey) => {
    setGameMode(MODES[modeKey]);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDifficultyModalVisible(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const openDifficultyMenu = () => {
    setWinner(null);
    setDifficultyModalVisible(true);
  };

  // 3. EXIT HANDLER
  const handleExitToHub = () => {
    setWinner(null);
    navigation.goBack(); // This goes back to Home Screen (Game Hub)
  };

  // --- STYLES ---
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const modalStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const gridStyle = { borderColor: theme.border, backgroundColor: theme.card };
  const btnStyle = { backgroundColor: theme.primary, borderBottomColor: theme.shadow };
  const dangerBtnStyle = { backgroundColor: theme.danger, borderBottomColor: theme.dangerShadow };

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
            <Text style={[styles.modalTitle, { color: theme.primary }]}>SELECT MODE</Text>
            
            <View style={styles.diffGrid}>
              {Object.keys(MODES).map((key) => (
                <TouchableOpacity 
                  key={key}
                  style={[styles.diffCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => startGame(key)}
                >
                  <Ionicons name={MODES[key].icon} size={32} color={theme.primary} />
                  <Text style={[styles.diffText, { color: theme.text }]}>{MODES[key].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. GAME BOARD */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.webContainer}>
          
          {/* Header Card */}
          <View style={[styles.headerCard, cardStyle]}>
            <Text style={[styles.modeLabel, { color: theme.subText }]}>MODE: {gameMode?.label}</Text>
            <Text style={[styles.turnText, { color: isXNext ? theme.primary : theme.danger }]}>
              {isXNext ? "X's TURN" : "O's TURN"}
            </Text>
          </View>

          {/* Grid */}
          <View style={[styles.gridContainer, gridStyle]}>
            {board.map((cell, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cell, 
                  { 
                    borderColor: theme.background === '#0F172A' ? '#334155' : '#eee',
                    borderRightWidth: (index % 3 === 2) ? 0 : 2,
                    borderBottomWidth: (index > 5) ? 0 : 2
                  }
                ]}
                onPress={() => handlePress(index)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.cellText, 
                  { color: cell === 'X' ? theme.primary : theme.danger }
                ]}>
                  {cell}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            
            <TouchableOpacity style={[styles.gameBtn, { backgroundColor: '#E0E0E0', borderBottomColor: '#999' }]} onPress={openDifficultyMenu}>
              <Text style={[styles.btnText, { color: '#555', fontSize: 13 }]}>DIFFICULTY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.gameBtn, dangerBtnStyle]} onPress={resetGame}>
              <Text style={styles.btnText}>RESET</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* 3. GAME OVER MODAL */}
      <Modal visible={!!winner} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            <Text style={[
              styles.modalTitle, 
              { color: winner === 'X' ? theme.success : winner === 'O' ? theme.danger : theme.text }
            ]}>
              {winner === 'Draw' ? "IT'S A DRAW!" : `${winner} WINS!`}
            </Text>

            <View style={styles.modalBtnRow}>
              
              {/* UPDATED: CALLS HANDLE EXIT */}
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#E0E0E0', borderBottomColor: '#999' }]} onPress={handleExitToHub}>
                <Text style={[styles.btnText, { color: '#555', fontSize: 13 }]}>MENU</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.modalBtn, btnStyle]} onPress={resetGame}>
                <Text style={styles.btnText}>PLAY AGAIN</Text>
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
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  webContainer: { width: '100%', maxWidth: 500, alignSelf: 'center', alignItems: 'center' },

  headerCard: { width: '100%', padding: 20, borderRadius: 20, borderWidth: 3, borderBottomWidth: 6, marginBottom: 30, alignItems: 'center', elevation: 5 },
  modeLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  turnText: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },

  gridContainer: { 
    width: '100%', 
    maxWidth: 320, 
    aspectRatio: 1, 
    borderRadius: 20, 
    borderWidth: 4, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    overflow: 'hidden', 
    elevation: 10 
  },
  cell: { 
    width: '33.33%', 
    height: '33.33%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cellText: { fontSize: 60, fontWeight: '900' },

  footer: { marginTop: 40, flexDirection: 'row', gap: 20 },
  gameBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center', borderBottomWidth: 5, minWidth: 120 },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 340, borderRadius: 30, padding: 25, alignItems: 'center', borderWidth: 4, borderBottomWidth: 8, elevation: 20 },
  modalTitle: { fontSize: 32, fontWeight: '900', marginBottom: 30, letterSpacing: 2 },
  
  diffGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  diffCard: { width: 130, padding: 15, borderRadius: 15, borderWidth: 3, borderBottomWidth: 6, justifyContent: 'center', alignItems: 'center' },
  diffText: { fontWeight: '900', fontSize: 14, marginTop: 10 },

  modalBtnRow: { flexDirection: 'row', width: '100%', gap: 15 },
  modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 50, borderBottomWidth: 6, alignItems: 'center' }
});