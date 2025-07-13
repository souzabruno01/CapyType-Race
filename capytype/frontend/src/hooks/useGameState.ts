import { useReducer, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface GameState {
  input: string;
  errorPositions: Set<number>;
  totalErrors: number;
  progress: number;
  wpm: number;
  startTime: number | null;
  hasStartedTyping: boolean;
}

type GameAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_ERRORS'; payload: { errors: Set<number>; total: number } }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_WPM'; payload: number }
  | { type: 'START_GAME' }
  | { type: 'RESET' };

const initialState: GameState = {
  input: '',
  errorPositions: new Set(),
  totalErrors: 0,
  progress: 0,
  wpm: 0,
  startTime: null,
  hasStartedTyping: false,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload, hasStartedTyping: true };
    case 'SET_ERRORS':
      return { ...state, errorPositions: action.payload.errors, totalErrors: action.payload.total };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_WPM':
      return { ...state, wpm: action.payload };
    case 'START_GAME':
      return { ...state, startTime: Date.now() };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const useGameState = (text: string, gameStarted: boolean, countdown: number | null) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { updateProgress } = useGameStore();

  useEffect(() => {
    dispatch({ type: 'RESET' });
  }, [text]);

  useEffect(() => {
    if (gameStarted && countdown === null && state.startTime && state.hasStartedTyping) {
      const timeElapsed = (Date.now() - state.startTime) / 1000 / 60; // in minutes
      if (timeElapsed > 0) {
        const wordsTyped = state.input.trim().split(/\s+/).length;
        const wpm = Math.round(wordsTyped / timeElapsed);
        dispatch({ type: 'SET_WPM', payload: wpm });
      }
    }
  }, [state.input, gameStarted, countdown, state.startTime, state.hasStartedTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Prevent typing if game hasn't started or countdown is still active
    if (!gameStarted || countdown !== null) {
      console.log('[Input] Blocked - Game not started or countdown active:', { gameStarted, countdown });
      return;
    }
    
    const value = e.target.value;
    if (value.length > text.length) return;

    // Start the timer on first keystroke
    if (!state.startTime) {
      dispatch({ type: 'START_GAME' });
    }

    dispatch({ type: 'SET_INPUT', payload: value });

    const newErrorPositions = new Set<number>();
    let currentTotalErrors = state.totalErrors;
    
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) {
        if (!state.errorPositions.has(i)) {
          currentTotalErrors++;
        }
        newErrorPositions.add(i);
      }
    }

    dispatch({ type: 'SET_ERRORS', payload: { errors: newErrorPositions, total: currentTotalErrors } });

    const correctChars = value.length - newErrorPositions.size;
    const newProgress = (correctChars / text.length) * 100;
    
    dispatch({ type: 'SET_PROGRESS', payload: newProgress });
    updateProgress(newProgress);
  };

  return { state, dispatch, handleInputChange };
};
