// src/games/TriviaGame.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Modal, 
  ImageBackground, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard, 
  TouchableWithoutFeedback 
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 

const FACTS_API_KEY = 'iz+uqX134B6KBrJ3v9uVyg==OrFntg2ErMgCBFpR'; 

export default function TriviaGame() {
  const { user, saveSolvedPuzzle } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); 

  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing'); 
  
  // NEW: State for the Incorrect Popup
  const [retryModalVisible, setRetryModalVisible] = useState(false);

  useEffect(() => {
    fetchTrivia();
  }, []);

  const fetchTrivia = async () => {
    setLoading(true);
    setGameStatus('playing');
    setUserAnswer('');
    setRetryModalVisible(false);
    
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/trivia', {
        headers: { 'X-Api-Key': FACTS_API_KEY }
      });
      
      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        setQuestion(data.question);
        setCorrectAnswer(data.answer);
        setCategory(data.category);
      } else {
        Alert.alert("Error", "No questions found.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch trivia.");
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const cleanUser = userAnswer.trim().toLowerCase();
    const cleanCorrect = correctAnswer.trim().toLowerCase();

    if (cleanUser === cleanCorrect) {
      setGameStatus('won');
      const factString = `Q: ${question}\nA: ${correctAnswer}`;
      saveSolvedPuzzle(factString, 'TRIVIA');
    } else {
      // UPDATED: Show Custom Modal instead of Alert
      setRetryModalVisible(true);
    }
  };

  const giveUp = () => {
    setGameStatus('lost');
  };

  // --- DYNAMIC STYLES ---
  const cardStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.border,
    borderBottomColor: theme.shadow 
  };
  
  const inputStyle = { 
    backgroundColor: theme.background === '#0F172A' ? '#334155' : '#F5F5F5', 
    color: theme.text, 
    borderColor: theme.border 
  };
  
  const btnStyle = { 
    backgroundColor: theme.primary, 
    borderBottomColor: theme.shadow 
  };
  
  const textStyle = { color: theme.text };

  // Modal Styles (3D Look)
  const modalStyle = { 
    backgroundColor: theme.card, 
    borderColor: theme.border, 
    borderBottomColor: theme.shadow 
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary}/></View>;

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={[styles.container, { backgroundColor: theme.background }]}
      imageStyle={{ opacity: theme.background === '#0F172A' ? 0.2 : 1 }}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* CATEGORY BADGE */}
            <View style={[styles.badge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
              <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
            </View>

            {/* QUESTION CARD */}
            <View style={[styles.card, cardStyle]}>
              <Text style={[styles.label, { color: theme.primary }]}>QUESTION:</Text>
              <Text style={[styles.questionText, textStyle]}>{question}</Text>
            </View>

            {/* INPUT AREA */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.subText, marginBottom: 5 }]}>YOUR ANSWER:</Text>
              <TextInput 
                style={[styles.input, inputStyle]}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Type here..."
                placeholderTextColor={theme.subText}
                onSubmitEditing={checkAnswer}
              />
            </View>

            {/* ACTIONS */}
            <View style={styles.btnRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.giveUpBtn, { borderBottomColor: theme.shadow }]} 
                onPress={giveUp}
              >
                <Text style={[styles.btnText, { color: '#555' }]}>GIVE UP</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, btnStyle]} 
                onPress={checkAnswer}
              >
                <Text style={[styles.btnText, { color: '#FFF' }]}>SUBMIT</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* --- INCORRECT / RETRY MODAL --- */}
      <Modal visible={retryModalVisible} transparent={true} animationType="fade" onRequestClose={() => setRetryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            
            {/* Header: Red/Pink for Danger */}
            <Text style={[styles.modalTitle, { color: theme.danger }]}>INCORRECT</Text>
            
            <View style={styles.modalContent}>
              <Text style={[styles.answerText, textStyle, { fontSize: 18, lineHeight: 26 }]}>
                That is not the right answer.
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.nextBtn, btnStyle]} 
              onPress={() => setRetryModalVisible(false)}
            >
              <Text style={[styles.btnText, { color: '#FFF' }]}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- RESULT MODAL (WIN / LOSS) --- */}
      <Modal visible={gameStatus !== 'playing'} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, modalStyle]}>
            
            <Text style={[
              styles.modalTitle, 
              { color: gameStatus === 'won' ? theme.success : theme.danger }
            ]}>
              {gameStatus === 'won' ? "CORRECT!" : "GAME OVER"}
            </Text>
            
            <View style={styles.modalContent}>
              <Text style={[styles.label, { color: theme.subText }]}>THE ANSWER WAS:</Text>
              <Text style={[styles.answerText, textStyle]}>{correctAnswer}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.nextBtn, btnStyle]} 
              onPress={fetchTrivia}
            >
              <Text style={[styles.btnText, { color: '#FFF' }]}>NEXT QUESTION</Text>
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
  scrollContent: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },

  badge: {
    paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, borderWidth: 2,
    marginBottom: 20
  },
  badgeText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  card: {
    width: '100%', padding: 25, borderRadius: 20, 
    borderWidth: 3, borderBottomWidth: 6, 
    marginBottom: 30, elevation: 5
  },
  label: { fontSize: 12, fontWeight: '900', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', lineHeight: 32 },

  inputContainer: { width: '100%', marginBottom: 30 },
  input: {
    width: '100%', padding: 15, borderRadius: 15, borderWidth: 2,
    fontSize: 18, fontWeight: '600', textAlign: 'center'
  },

  btnRow: { flexDirection: 'row', gap: 15, width: '100%' },
  actionBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 50, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent', borderBottomWidth: 5
  },
  giveUpBtn: { backgroundColor: '#E0E0E0', borderColor: '#CCC' }, 
  btnText: { fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { 
    width: '85%', borderRadius: 30, padding: 30, alignItems: 'center', 
    borderWidth: 4, borderBottomWidth: 8, elevation: 20 
  },
  modalTitle: { fontSize: 32, fontWeight: '900', marginBottom: 20, letterSpacing: 2 },
  modalContent: { marginBottom: 30, alignItems: 'center' },
  answerText: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 5, letterSpacing: 0.5 },
  
  nextBtn: { 
    paddingVertical: 15, paddingHorizontal: 40, borderRadius: 50, 
    borderBottomWidth: 6, width: '100%', alignItems: 'center',
    elevation: 5
  }
});