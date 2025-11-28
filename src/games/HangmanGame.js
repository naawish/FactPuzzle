// src/games/HangmanGame.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ImageBackground, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 

// API CONFIG
const API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR'; 

// --- OFFLINE BACKUP LIST ---
// If the API fails (no internet/CORS), we use these words.
const FALLBACK_WORDS = [
  "PUZZLE", "REACT", "NATIVE", "CODING", "JAVASCRIPT", "PYTHON", "DATABASE",
  "SERVER", "MOBILE", "DESIGN", "PIXEL", "VECTOR", "SYNTAX", "DEBUG", "DEPLOY",
  "WIDGET", "SCREEN", "BUTTON", "INPUT", "STYLE", "LAYOUT", "LOGIC", "ASYNC"
];

export default function HangmanGame() {
  const { saveSolvedPuzzle } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); 

  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [lives, setLives] = useState(6);
  const [gameStatus, setGameStatus] = useState('playing'); 
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWord = async () => {
    setLoading(true);
    setErrorVisible(false);
    setGameStatus('playing');
    setGuessedLetters(new Set());
    setLives(6);
    
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/randomword', {
        headers: { 'X-Api-Key': API_KEY },
        timeout: 5000 // Stop waiting after 5 seconds
      });
      
      let rawWord = '';
      if (response.data.word) {
        rawWord = response.data.word;
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        rawWord = response.data[0];
      }

      if (!rawWord) throw new Error("No word returned");

      const cleanWord = rawWord.replace(/[^a-zA-Z]/g, '').toUpperCase();

      if (cleanWord.length < 3) {
        // Retry logic logic here if needed, or fallback
        throw new Error("Word too short");
      }

      setWord(cleanWord);
      setLoading(false);

    } catch (error) {
      console.log("API Error (Switching to Offline Mode):", error.message);
      
      // --- FALLBACK LOGIC ---
      // Instead of showing error, pick a random local word
      const randomFallback = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
      setWord(randomFallback);
      setLoading(false);
    }
  };

  const handleGuess = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) setGameStatus('lost');
    } else {
      const isWon = word.split('').every(char => newGuessed.has(char));
      if (isWon) {
        setGameStatus('won');
        saveSolvedPuzzle(`Solved Hangman: ${word}`); 
      }
    }
  };

  // --- RENDERERS ---
  const renderStickFigure = () => {
    const color = theme.text;
    const ropeColor = theme.primary; 

    return (
      <View style={styles.gallowsContainer}>
        <View style={[styles.barBase, { backgroundColor: ropeColor }]} />
        <View style={[styles.barPole, { backgroundColor: ropeColor }]} />
        <View style={[styles.barTop, { backgroundColor: ropeColor }]} />
        <View style={[styles.rope, { backgroundColor: ropeColor }]} />

        {lives < 6 && <View style={[styles.head, { borderColor: color }]} />} 
        {lives < 5 && <View style={[styles.body, { backgroundColor: color }]} />}
        {lives < 4 && <View style={[styles.armL, { backgroundColor: color }]} />}
        {lives < 3 && <View style={[styles.armR, { backgroundColor: color }]} />}
        {lives < 2 && <View style={[styles.legL, { backgroundColor: color }]} />}
        {lives < 1 && <View style={[styles.legR, { backgroundColor: color }]} />}
      </View>
    );
  };

  const renderWord = () => {
    return (
      <View style={styles.wordRow}>
        {word.split('').map((char, index) => (
          <View key={index} style={[styles.charSlot, { borderBottomColor: theme.text }]}>
            <Text style={[styles.charText, { color: theme.text }]}>
              {(guessedLetters.has(char) || gameStatus === 'lost') ? char : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderKeyboard = () => {
    const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split('');
    return (
      <View style={styles.keyboard}>
        {keys.map((char) => {
          const isSelected = guessedLetters.has(char);
          const isCorrect = word.includes(char);
          
          let btnColor = theme.card;
          let txtColor = theme.text;
          let borderColor = theme.border;

          if (isSelected) {
            if (isCorrect) {
              btnColor = theme.success; 
              borderColor = theme.success;
              txtColor = '#FFF';
            } else {
              btnColor = theme.background === '#0F172A' ? '#333' : '#CCC'; 
              borderColor = 'transparent';
              txtColor = '#888';
            }
          }

          return (
            <TouchableOpacity
              key={char}
              style={[styles.key, { backgroundColor: btnColor, borderColor: borderColor }]}
              onPress={() => handleGuess(char)}
              disabled={isSelected || gameStatus !== 'playing'}
            >
              <Text style={[styles.keyText, { color: txtColor }]}>{char}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Styles Helpers
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const modalStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const btnStyle = { backgroundColor: theme.primary, borderBottomColor: theme.shadow };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary}/></View>;

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.gameWrapper}>
          <View style={[styles.drawCard, cardStyle]}>
            {renderStickFigure()}
          </View>

          {renderWord()}

          <Text style={[styles.status, { color: theme.subText }]}>
            LIVES: <Text style={{ color: theme.danger, fontWeight: 'bold' }}>{lives}</Text>
          </Text>

          {renderKeyboard()}
        </View>
      </ScrollView>

      {/* --- ERROR MODAL (Only shows if something goes catastrophically wrong with fallback) --- */}
      <Modal visible={errorVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            <Text style={[styles.modalTitle, { color: theme.danger }]}>ERROR</Text>
            <View style={styles.modalContent}>
              <Text style={[styles.label, { color: theme.text, textAlign: 'center' }]}>
                Something went wrong.
              </Text>
            </View>
            <TouchableOpacity style={[styles.nextBtn, btnStyle]} onPress={fetchWord}>
              <Text style={styles.btnText}>RETRY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* GAME OVER / WIN MODAL */}
      <Modal visible={gameStatus !== 'playing'} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            <Text style={[
              styles.modalTitle, 
              { color: gameStatus === 'won' ? theme.success : theme.danger }
            ]}>
              {gameStatus === 'won' ? "YOU ESCAPED!" : "GAME OVER"}
            </Text>
            
            <View style={styles.modalContent}>
              <Text style={[styles.label, { color: theme.subText }]}>THE WORD WAS:</Text>
              <Text style={[styles.revealWord, { color: theme.text }]}>{word}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.nextBtn, btnStyle]} 
              onPress={fetchWord}
            >
              <Text style={styles.btnText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1, padding: 20 },
  
  gameWrapper: { width: '100%', maxWidth: 500, alignSelf: 'center', alignItems: 'center' },

  // Drawing
  drawCard: {
    width: '100%', height: 220, borderRadius: 20, borderWidth: 3, borderBottomWidth: 6,
    marginBottom: 30, justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  gallowsContainer: { width: 120, height: 160, position: 'relative' },
  barBase: { position: 'absolute', bottom: 0, left: 0, width: 80, height: 5, borderRadius: 3 },
  barPole: { position: 'absolute', bottom: 0, left: 20, width: 5, height: 160, borderRadius: 3 },
  barTop: { position: 'absolute', top: 0, left: 20, width: 80, height: 5, borderRadius: 3 },
  rope: { position: 'absolute', top: 0, right: 20, width: 3, height: 30 },
  
  head: { position: 'absolute', top: 30, right: 6, width: 30, height: 30, borderRadius: 15, borderWidth: 3 },
  body: { position: 'absolute', top: 60, right: 20, width: 3, height: 50 },
  armL: { position: 'absolute', top: 70, right: 22, width: 25, height: 3, transform: [{ rotate: '-30deg' }] },
  armR: { position: 'absolute', top: 70, right: -2, width: 25, height: 3, transform: [{ rotate: '30deg' }] },
  legL: { position: 'absolute', top: 105, right: 22, width: 25, height: 3, transform: [{ rotate: '-45deg' }] },
  legR: { position: 'absolute', top: 105, right: -2, width: 25, height: 3, transform: [{ rotate: '45deg' }] },

  // Word
  wordRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  charSlot: { minWidth: 25, borderBottomWidth: 3, alignItems: 'center', paddingBottom: 2 },
  charText: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },

  status: { fontSize: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 20 },

  // Keyboard
  keyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  key: { width: 34, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderBottomWidth: 3 },
  keyText: { fontSize: 16, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', maxWidth: 400, borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 4, borderBottomWidth: 8, elevation: 20 },
  modalTitle: { fontSize: 28, fontWeight: '900', marginBottom: 20, letterSpacing: 1, textAlign: 'center' },
  modalContent: { marginBottom: 30, alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  revealWord: { fontSize: 28, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  
  nextBtn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 50, borderBottomWidth: 6, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 1 }
});