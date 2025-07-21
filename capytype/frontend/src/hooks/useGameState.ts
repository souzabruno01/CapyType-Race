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
  lastKeystroke: number | null; // Track last keystroke time for anti-cheat
}

type GameAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_ERRORS'; payload: { errors: Set<number>; total: number } }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_WPM'; payload: number }
  | { type: 'START_GAME' }
  | { type: 'SET_LAST_KEYSTROKE'; payload: number } // Anti-cheat keystroke timing
  | { type: 'RESET' };

const initialState: GameState = {
  input: '',
  errorPositions: new Set(),
  totalErrors: 0,
  progress: 0,
  wpm: 0,
  startTime: null,
  hasStartedTyping: false,
  lastKeystroke: null, // Initialize anti-cheat timestamp
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
    case 'SET_LAST_KEYSTROKE':
      return { ...state, lastKeystroke: action.payload };
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
    const previousValue = state.input;
    const now = Date.now();
    
    // ANTI-CHEAT MEASURES
    // 1. Check for paste-like behavior (large input jumps)
    const inputDiff = value.length - previousValue.length;
    if (inputDiff > 3) {
      console.log('[Anti-Cheat] Suspicious input jump detected:', { inputDiff, previous: previousValue.length, current: value.length });
      e.target.value = previousValue; // Reset to previous value
      return;
    }
    
    // 2. Check for impossible typing speed (>300 characters per minute instantaneous)
    if (state.lastKeystroke) {
      const timeDiff = now - state.lastKeystroke;
      if (timeDiff < 50 && Math.abs(inputDiff) > 1) { // Less than 50ms between multi-character changes
        console.log('[Anti-Cheat] Impossible typing speed detected:', { timeDiff, inputDiff });
        e.target.value = previousValue;
        return;
      }
    }
    
    // 3. Only allow single character additions/deletions (no multi-character inserts)
    if (Math.abs(inputDiff) > 1) {
      console.log('[Anti-Cheat] Multi-character input detected:', { inputDiff });
      e.target.value = previousValue;
      return;
    }
    
    // 4. Prevent input longer than the text
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
    
    // Update last keystroke time for anti-cheat
    dispatch({ type: 'SET_LAST_KEYSTROKE', payload: now });
  };

  return { state, dispatch, handleInputChange };
};
