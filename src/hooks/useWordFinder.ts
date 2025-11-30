import { useReducer, useRef, useCallback } from 'react';
import axios from 'axios';
import { GameState, GameAction, DifficultyConfig } from '../types/game';

const INITIAL_STATE: GameState = {
  status: 'idle',
  fact: '',
  targetWord: '',
  hint: '',
  grid: [],
  selectedLetters: [],
  hintLevel: 0,
  definition: '',
  loading: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'START_GAME':
      return { 
        ...INITIAL_STATE, 
        status: 'playing', 
        targetWord: action.payload.word,
        fact: action.payload.fact,
        hint: action.payload.fact.replace(new RegExp(action.payload.word, 'gi'), "_______"),
        grid: action.payload.grid 
      };
    case 'SELECT_LETTER':
      return { ...state, selectedLetters: [...state.selectedLetters, action.payload] };
    case 'RESET_SELECTION':
      return { ...state, selectedLetters: [] };
    case 'WIN_GAME':
      return { ...state, status: 'won' };
    case 'USE_HINT':
      return { 
        ...state, 
        hintLevel: action.payload.level, 
        definition: action.payload.definition || state.definition 
      };
    default:
      return state;
  }
}

export function useWordFinder(gridSize: number) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  
  // We keep the API logic here
  const fetchGame = useCallback(async (difficulty: DifficultyConfig) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/facts', {
        headers: { 'X-Api-Key': process.env.EXPO_PUBLIC_API_NINJAS_KEY }
      });
      // ... (Insert your existing generatePuzzle logic here, adapted to return data instead of setting state)
      // For brevity, assuming generatePuzzle returns { word, grid }
      const { word, grid } = generatePuzzleLogic(response.data[0].fact, difficulty, gridSize);
      
      dispatch({ type: 'START_GAME', payload: { 
        word, 
        fact: response.data[0].fact, 
        grid 
      }});
    } catch (e) {
      console.error(e);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [gridSize]);

  return { state, dispatch, fetchGame };
}

// Helper logic extracted from component
function generatePuzzleLogic(factText: string, difficulty: DifficultyConfig, gridSize: number) {
    // ... Copy your generatePuzzle logic here, but return the values instead of setting state ...
    return { word: "MOCK", grid: [] }; // Placeholder
}