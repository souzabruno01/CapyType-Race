import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { INITIAL_COUNTDOWN, WORDS_PER_MINUTE_MULTIPLIER, MINIMUM_RACE_TIME } from '../utils/constants';

export const useGameTimer = (gameStarted: boolean, text: string) => {
  const [countdown, setCountdown] = useState<number | null>(INITIAL_COUNTDOWN);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (text) {
      const wordCount = text.trim().split(/\s+/).length;
      const estimatedTime = wordCount * WORDS_PER_MINUTE_MULTIPLIER;
      const totalTime = Math.max(estimatedTime, MINIMUM_RACE_TIME);
      setTimeLeft(totalTime);
    }
  }, [text]);

  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setCountdown(null);
        useGameStore.setState({ gameState: 'playing' });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (gameStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft]);

  return { countdown, setCountdown, timeLeft, setTimeLeft };
};
