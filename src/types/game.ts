export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface DifficultyConfig {
  label: DifficultyLevel;
  icon: string;
  minLen: number;
  maxLen: number;
  directions: number[][];
}

export interface GameState {
  status: 'idle' | 'playing' | 'won' | 'lost';
  fact: string;
  targetWord: string;
  hint: string;
  grid: string[];
  selectedLetters: { index: number; letter: string }[];
  hintLevel: number; // 0, 1, 2
  definition: string;
  loading: boolean;
}

export type GameAction = 
  | { type: 'START_GAME'; payload: { word: string; fact: string; grid: string[] } }
  | { type: 'SELECT_LETTER'; payload: { index: number; letter: string } }
  | { type: 'RESET_SELECTION' }
  | { type: 'USE_HINT'; payload: { level: number; definition?: string } }
  | { type: 'WIN_GAME' }
  | { type: 'SET_LOADING'; payload: boolean };