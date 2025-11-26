// src/games/HangmanGame.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ImageBackground, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext'; 

// YOUR API KEYS
const FACTS_API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR'; 

export default function HangmanGame() {
  const { theme } = useContext(ThemeContext); 

  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [lives, setLives] = useState(6); // Head, Body, L-Arm, R-Arm, L-Leg, R-Leg
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWord = async () => {
    setLoading(true);
    setGameStatus('playing');
    setGuessedLetters(new Set());
    setLives(6);
    
    try {
      // Fetch a random word
      const response = await axios.get('https://api.api-ninjas.com/v1/randomword', {
        headers: { 'X-Api-Key': FACTS_API_KEY }
      });
      // Ensure word is uppercase for comparison
      const randomWord = response.data.word.toUpperCase();
      setWord(randomWord);
      setLoading(false);
    } catch (error) {
      Alert.alert("Error", "Could not fetch a word.");
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
      // Check for win
      const isWon = word.split('').every(char => newGuessed.has(char));
      if (isWon) setGameStatus('won');
    }
  };

  // --- RENDERERS ---

  const renderStickFigure = () => {
    // Dynamic colors based on theme
    const figureColor = theme.text;
    const ropeColor = theme.primary;

    return (
      <View style={styles.gallowsContainer}>
        {/* The Gallows */}
        <View style={[styles.gallowBase, { backgroundColor: ropeColor }]} />
        <View style={[styles.gallowPole, { backgroundColor: ropeColor }]} />
        <View style={[styles.gallowTop, { backgroundColor: ropeColor }]} />
        <View style={[styles.gallowRope, { backgroundColor: ropeColor }]} />

        {/* The Man (Opacity 0 if life not lost yet) */}
        {lives < 6 && <View style={[styles.head, { borderColor: figureColor }]} />} 
        {lives < 5 && <View style={[styles.body, { backgroundColor: figureColor }]} />}
        {lives < 4 && <View style={[styles.leftArm, { backgroundColor: figureColor }]} />}
        {lives < 3 && <View style={[styles.rightArm, { backgroundColor: figureColor }]} />}
        {lives < 2 && <View style={[styles.leftLeg, { backgroundColor: figureColor }]} />}
        {lives < 1 && <View style={[styles.rightLeg, { backgroundColor: figureColor }]} />}
      </View>
    );
  };

  const renderWord = () => {
    return (
      <View style={styles.wordContainer}>
        {word.split('').map((char, index) => (
          <View key={index} style={[styles.charBox, { borderBottomColor: theme.text }]}>
            <Text style={[styles.charText, { color: theme.text }]}>
              {guessedLetters.has(char) || gameStatus === 'lost' ? char : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderKeyboard = () => {
    const rows = [
      "QWERTYUIOP".split(''),
      "ASDFGHJKL".split(''),
      "ZXCVBNM".split('')
    ];

    return (
      <View style={styles.keyboardContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((letter) => {
              const isSelected = guessedLetters.has(letter);
              const isCorrect = word.includes(letter);
              
              // Dynamic Key Styling
              let keyBg = theme.card;
              let keyBorder = theme.border;
              let textColor = theme.text;

              if (isSelected) {
                if (isCorrect) {
                  keyBg = theme.success;
                  keyBorder = theme.success;
                  textColor = '#FFF';
                } else {
                  keyBg = theme.background === '#0F172A' ? '#333' : '#ccc'; // Dimmed
                  keyBorder = 'transparent';
                  textColor = '#777';
                }
              }

              return (
                <TouchableOpacity
                  key={letter}
                  style={[styles.key, { backgroundColor: keyBg, borderColor: keyBorder }]}
                  onPress={() => handleGuess(letter)}
                  disabled={isSelected || gameStatus !== 'playing'}
                >
                  <Text style={[styles.keyText, { color: textColor }]}>{letter}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // Dynamic Styles
  const cardStyle = { backgroundColor: theme.card, borderColor: theme.border };
  const modalStyle = { backgroundColor: theme.card, borderColor: theme.border, borderBottomColor: theme.shadow };
  const modalText = { color: theme.text };
  const primaryBtn = { backgroundColor: theme.primary, borderBottomColor: theme.shadow };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary}/></View>;

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      {/* Game Area */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. The Drawing */}
        <View style={[styles.drawingCard, cardStyle]}>
          {renderStickFigure()}
        </View>

        {/* 2. The Word */}
        {renderWord()}

        {/* 3. Status Text */}
        <Text style={[styles.statusText, { color: theme.subText }]}>
          LIVES REMAINING: <Text style={{ color: theme.danger, fontWeight: 'bold' }}>{lives}</Text>
        </Text>

        {/* 4. Keyboard */}
        {renderKeyboard()}

      </ScrollView>

      {/* GAME OVER / WIN MODAL */}
      <Modal 
        visible={gameStatus !== 'playing'} 
        transparent={true} 
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            <Text style={[styles.modalTitle, { color: gameStatus === 'won' ? theme.success : theme.danger }]}>
              {gameStatus === 'won' ? "YOU SURVIVED!" : "GAME OVER"}
            </Text>
            
            <View style={styles.modalContent}>
              <Text style={[styles.modalLabel, { color: theme.subText }]}>THE WORD WAS:</Text>
              <Text style={[styles.modalWord, modalText]}>{word}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.nextBtn, primaryBtn]} 
              onPress={fetchWord}
            >
              <Text style={styles.nextBtnText}>PLAY AGAIN</Text>
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
  scrollContent: { flexGrow: 1, padding: 20, alignItems: 'center' },

  // Draw Area
  drawingCard: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  // Stick Figure CSS
  gallowsContainer: { width: 150, height: 180, position: 'relative' },
  gallowBase: { position: 'absolute', bottom: 10, left: 10, width: 100, height: 5, borderRadius: 2 },
  gallowPole: { position: 'absolute', bottom: 10, left: 30, width: 5, height: 150, borderRadius: 2 },
  gallowTop: { position: 'absolute', top: 20, left: 30, width: 80, height: 5, borderRadius: 2 },
  gallowRope: { position: 'absolute', top: 20, right: 40, width: 3, height: 20 },
  
  head: { position: 'absolute', top: 40, right: 26, width: 30, height: 30, borderRadius: 15, borderWidth: 3 },
  body: { position: 'absolute', top: 70, right: 40, width: 3, height: 50 },
  leftArm: { position: 'absolute', top: 80, right: 42, width: 30, height: 3, transform: [{ rotate: '-30deg' }] },
  rightArm: { position: 'absolute', top: 80, right: 10, width: 30, height: 3, transform: [{ rotate: '30deg' }] },
  leftLeg: { position: 'absolute', top: 120, right: 42, width: 30, height: 3, transform: [{ rotate: '-60deg' }] },
  rightLeg: { position: 'absolute', top: 120, right: 10, width: 30, height: 3, transform: [{ rotate: '60deg' }] },

  // Word Area
  wordContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 30 },
  charBox: { width: 30, height: 40, borderBottomWidth: 3, justifyContent: 'center', alignItems: 'center' },
  charText: { fontSize: 24, fontWeight: 'bold' },

  statusText: { fontSize: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 20 },

  // Keyboard
  keyboardContainer: { width: '100%', alignItems: 'center' },
  keyboardRow: { flexDirection: 'row', marginBottom: 10, gap: 5 },
  key: { width: 32, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 6, borderWidth: 1, borderBottomWidth: 3 },
  keyText: { fontSize: 16, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 4, borderBottomWidth: 8, elevation: 20 },
  modalTitle: { fontSize: 28, fontWeight: '900', marginBottom: 20, letterSpacing: 1 },
  modalContent: { marginBottom: 30, alignItems: 'center' },
  modalLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  modalWord: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  nextBtn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 50, borderBottomWidth: 6 },
  nextBtnText: { color: '#FFF', fontWeight: '900', fontSize: 18 }
});