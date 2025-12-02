import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, 
  Modal, ImageBackground, ScrollView, Alert 
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 
import { Button3D } from '../components/ui/Button3D'; // Using your reusable component
import { COLORS, LAYOUT, SPACING, TEXT } from '../theme/theme';

// 1. NEW API: Free Dictionary API (No Key Required)
const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// 2. CURATED WORD LIST (Ensures playable, common words)
const WORD_POOL = [
  "GALAXY", "JUNGLE", "PIRATE", "ROCKET", "CASTLE", "DRAGON", "WIZARD", 
  "PLANET", "ROBOT", "CIRCUS", "CACTUS", "TURTLE", "BANANA", "GUITAR", 
  "SUMMER", "WINTER", "FROZEN", "SPIRIT", "FUTURE", "NATURE", "ORANGE", 
  "PURPLE", "YELLOW", "WINDOW", "DOCTOR", "LAWYER", "POLICE", "ARTIST",
  "MONKEY", "DONKEY", "RABBIT", "ZOMBIE", "VAMPIRE", "GHOST", "SHADOW",
  "BRIDGE", "STREAM", "FOREST", "ISLAND", "CANYON", "DESERT", "OCEAN",
  "COFFEE", "DINNER", "PICNIC", "BURGER", "CHEESE", "COOKIE", "MUFFIN"
];

export default function HangmanGame() {
  const { saveSolvedPuzzle } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext); 
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  // Game State
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState(new Set<string>());
  const [lives, setLives] = useState(6);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing'); 
  
  // Hint State
  const [definition, setDefinition] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setGameStatus('playing');
    setGuessedLetters(new Set());
    setLives(6);
    setDefinition('');
    setHintVisible(false);
    
    // Pick random word from local pool
    const randomWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    setWord(randomWord);
  };

  // --- API CALL: FETCH DEFINITION ---
  const handleGetHint = async () => {
    if (definition) {
      setHintVisible(true); // Already fetched
      return;
    }

    setLoadingHint(true);
    try {
      const response = await axios.get(`${DICT_API}${word.toLowerCase()}`);
      
      if (response.data && response.data[0]) {
        // Extract first definition
        let rawDef = response.data[0].meanings[0].definitions[0].definition;
        
        // Hide the word if it appears in the definition (Spoiler protection)
        const cleanDef = rawDef.replace(new RegExp(word, 'gi'), "____");
        
        setDefinition(cleanDef);
        setHintVisible(true);
      } else {
        Alert.alert("Hint Unavailable", "No definition found for this word.");
      }
    } catch (error) {
      console.error("Hint API Error:", error);
      Alert.alert("Connection Error", "Could not fetch hint.");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleGuess = (letter: string) => {
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
    const color = themeColors.text;
    const ropeColor = themeColors.primary; 

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
          <View key={index} style={[styles.charSlot, { borderBottomColor: themeColors.text }]}>
            <Text style={[styles.charText, { color: themeColors.text }]}>
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
          
          let btnColor = themeColors.card;
          let txtColor = themeColors.text;
          let borderColor = themeColors.border;

          if (isSelected) {
            if (isCorrect) {
              btnColor = themeColors.success; 
              borderColor = themeColors.success;
              txtColor = '#FFF';
            } else {
              btnColor = isDark ? '#333' : '#CCC'; 
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
  const cardStyle = { backgroundColor: themeColors.card, borderColor: themeColors.border };
  const modalStyle = { ...LAYOUT.card3D, backgroundColor: themeColors.card, borderColor: themeColors.border, borderBottomColor: themeColors.shadow, width: '85%', maxWidth: 400 };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: themeColors.background }]}
      imageStyle={{ opacity: isDark ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.webContainer}>

          {/* 1. DRAWING AREA */}
          <View style={[styles.drawCard, cardStyle]}>
            {renderStickFigure()}
          </View>

          {/* 2. WORD DISPLAY */}
          {renderWord()}

          {/* 3. LIVES STATUS */}
          <Text style={[styles.status, { color: themeColors.subText }]}>
            LIVES: <Text style={{ color: themeColors.danger, fontWeight: 'bold' }}>{lives}</Text>
          </Text>

          {/* 4. KEYBOARD */}
          {renderKeyboard()}
          
          {/* 5. HINT BUTTON */}
          <View style={styles.footer}>
             <Button3D 
               label={loadingHint ? "LOADING..." : "GET HINT"} 
               onPress={handleGetHint}
               variant="neutral"
               disabled={gameStatus !== 'playing' || loadingHint}
               style={{ width: '100%' }}
             />
          </View>

        </View>
      </ScrollView>

      {/* --- HINT MODAL --- */}
      <Modal visible={hintVisible} transparent={true} animationType="fade" onRequestClose={() => setHintVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={modalStyle}>
            <Text style={[styles.modalTitle, { color: themeColors.primary }]}>HINT</Text>
            <Text style={{ color: themeColors.text, fontSize: 18, textAlign: 'center', marginBottom: 20, fontStyle: 'italic' }}>
              "{definition}"
            </Text>
            <Button3D label="CLOSE" onPress={() => setHintVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* --- GAME OVER MODAL --- */}
      <Modal visible={gameStatus !== 'playing'} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={modalStyle}>
            <Text style={[
              styles.modalTitle, 
              { color: gameStatus === 'won' ? themeColors.success : themeColors.danger }
            ]}>
              {gameStatus === 'won' ? "YOU ESCAPED!" : "GAME OVER"}
            </Text>
            
            <View style={styles.modalContent}>
              <Text style={[styles.label, { color: themeColors.subText }]}>THE WORD WAS:</Text>
              <Text style={[styles.revealWord, { color: themeColors.text }]}>{word}</Text>
            </View>

            <Button3D label="PLAY AGAIN" onPress={startNewGame} variant="primary" style={{width: '100%'}} />
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  webContainer: { width: '100%', maxWidth: 500, alignSelf: 'center', alignItems: 'center' },

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

  wordRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  charSlot: { minWidth: 25, borderBottomWidth: 3, alignItems: 'center', paddingBottom: 2 },
  charText: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },

  status: { fontSize: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 20 },

  keyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  key: { width: 34, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderBottomWidth: 3 },
  keyText: { fontSize: 16, fontWeight: 'bold' },

  footer: { marginTop: 20, width: '100%' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 28, fontWeight: '900', marginBottom: 20, letterSpacing: 1, textAlign: 'center' },
  modalContent: { marginBottom: 30, alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  revealWord: { fontSize: 28, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
});