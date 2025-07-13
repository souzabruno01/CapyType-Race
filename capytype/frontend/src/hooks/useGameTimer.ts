import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { INITIAL_COUNTDOWN } from '../utils/constants';
import { TimeSync } from '../utils/timeSync';

export const useGameTimer = () => {
  const [countdown, setCountdown] = useState<number | null>(INITIAL_COUNTDOWN);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [serverSync, setServerSync] = useState<TimeSync | null>(null);

  // Initialize time synchronization
  useEffect(() => {
    const socket = useGameStore.getState().socket;
    if (socket && !serverSync) {
      const sync = new TimeSync(socket);
      sync.calibrate().then(() => {
        console.log('[Timer] Time synchronization calibrated');
      });
      setServerSync(sync);
    }
  }, [serverSync]);

  // Listen for server-controlled countdown
  useEffect(() => {
    const socket = useGameStore.getState().socket;
    if (!socket) return;

    const handleCountdown = (data: { count: number; serverTime: number }) => {
      setCountdown(data.count);
    };

    const handleGameStarted = (data: { startTime: number; duration: number; serverTime: number }) => {
      setCountdown(null);
      setTimeLeft(data.duration);
      useGameStore.setState({ gameState: 'playing' });
    };

    const handleRaceTimer = (data: { elapsed: number; remaining: number; serverTime: number }) => {
      // Apply lag compensation if available
      let adjustedRemaining = data.remaining;
      if (serverSync) {
        const lagCompensation = serverSync.getLagCompensation() / 1000; // Convert to seconds
        adjustedRemaining = Math.max(0, data.remaining - lagCompensation);
      }
      
      setTimeLeft(Math.ceil(adjustedRemaining));
    };

    const handleRaceFinished = () => {
      setTimeLeft(0);
    };

    socket.on('countdown', handleCountdown);
    socket.on('gameStarted', handleGameStarted);
    socket.on('raceTimer', handleRaceTimer);
    socket.on('raceFinished', handleRaceFinished);

    return () => {
      socket.off('countdown', handleCountdown);
      socket.off('gameStarted', handleGameStarted);
      socket.off('raceTimer', handleRaceTimer);
      socket.off('raceFinished', handleRaceFinished);
    };
  }, [serverSync]);

  // Recalibrate time sync periodically
  useEffect(() => {
    if (!serverSync) return;

    const interval = setInterval(() => {
      if (serverSync.shouldRecalibrate()) {
        serverSync.calibrate();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [serverSync]);

  return { countdown, setCountdown, timeLeft, setTimeLeft };
};
