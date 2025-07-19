import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { useGameStore } from '../store/gameStore';
import ReactConfetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import LiveLeaderboard from '../components/game/LiveLeaderboard';
import WaitingForOthersOverlay from '../components/game/WaitingForOthersOverlay';
import TimeUpOverlay from '../components/game/TimeUpOverlay';
import ResultsModal from '../components/game/ResultsModal';
import HighlightedText from '../components/game/HighlightedText';
import { useGameTimer } from '../hooks/useGameTimer';
import { useGameState } from '../hooks/useGameState';
import { TIME_UP_RESULTS_DELAY, CONFETTI_DURATION, STATS_SYNC_THROTTLE, GAME_STATE_SYNC_DELAY } from '../utils/constants';


const CapybaraIcon = ({ avatar, color, size = 32 }: { avatar?: string; color?: string; size?: number }) => (
  <img
    src={avatar ? `/images/${avatar}` : "/images/Capy-progress-bar-icon.svg"}
    alt="Capybara"
    style={{
      width: size, height: size, borderRadius: '50%', border: `2px solid ${color || '#b6a77a'}`,
      background: color || '#fff', objectFit: 'cover', display: 'block', margin: '0 auto'
    }}
  />
);

// Modern, rounded, black button style
const modernButtonStyle = {
  background: '#232323',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '12px 28px',
  fontWeight: 700,
  fontSize: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  cursor: 'pointer',
  transition: 'background 0.2s',
  margin: '8px 0',
  letterSpacing: '0.5px',
};

export default function Game() {
  const navigate = useNavigate();
  const { text, players, gameState, roomId, roomClosed, clearRoomClosed } = useGameStore();
  
  const gameStarted = gameState === 'playing';
  const { countdown, setCountdown, timeLeft, setTimeLeft } = useGameTimer();
  const { state, dispatch, handleInputChange } = useGameState(text, gameStarted, countdown);
  const { input, errorPositions, totalErrors, progress, wpm, startTime } = state;
  const gameAreaRef = useRef<HTMLDivElement>(null); // NEW: Ref for the game area
  const textareaRef = useRef<HTMLTextAreaElement>(null); // NEW: Ref for the textarea

  const [showConfetti, setShowConfetti] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [timeUpTimer, setTimeUpTimer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const resultsShownRef = useRef(false);
  const [playerFinishedEarly, setPlayerFinishedEarly] = useState(false);
  const [currentPlayerPosition, setCurrentPlayerPosition] = useState<number | null>(null);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [waitingTimeLeft, setWaitingTimeLeft] = useState<number | null>(null);
  
  // NEW: Separate race completion state from individual player completion
  const [raceCompleted, setRaceCompleted] = useState(false);
  
  // Get the current player's nickname from the store
  const currentPlayer = players.find(player => player.id === useGameStore.getState().socket?.id);

  // Listen for player position updates and disconnections
  useEffect(() => {
    const socket = useGameStore.getState().socket;
    if (socket) {
      const handlePlayerFinished = (data: any) => {
        console.log('[Game] Player finished:', data);
        if (playerFinishedEarly && !gameFinished) {
          // Recalculate current player's position
          const finishedCount = players.filter(p => p.progress >= 100 || p.id === data.playerId).length;
          setCurrentPlayerPosition(finishedCount);
        }
      };

      const handleRaceFinished = (data: any) => {
        console.log('[Game] Race finished:', data);
        // Race is officially completed - hide leaderboard now
        setRaceCompleted(true);
        setGameFinished(true);
        setWaitingForOthers(false);
        
        setTimeout(() => {
          if (!resultsShownRef.current) {
            resultsShownRef.current = true;
            setShowResults(true);
          }
        }, 1000);
      };

      const handlePlayerDisconnected = (data: { playerId: string; playerName: string }) => {
        console.log('[Game] Player disconnected:', data);
        
        // Show notification about player leaving
        if (gameStarted && !gameFinished) {
          // You can add a toast notification here if you have a toast system
          console.log(`${data.playerName} left the game`);
          
          // Update positions for remaining players
          const remainingPlayers = players.filter(p => p.id !== data.playerId);
          if (remainingPlayers.length > 0) {
            // Recalculate positions based on remaining active players
            const currentUserId = useGameStore.getState().socket?.id;
            if (currentUserId) {
              const currentUserProgress = players.find(p => p.id === currentUserId)?.progress || 0;
              const betterPlayers = remainingPlayers.filter(p => (p.progress || 0) > currentUserProgress);
              setCurrentPlayerPosition(betterPlayers.length + 1);
            }
          }
        }
      };

      socket.on('playerFinished', handlePlayerFinished);
      socket.on('raceFinished', handleRaceFinished);
      socket.on('playerDisconnected', handlePlayerDisconnected);
      
      return () => {
        socket.off('playerFinished', handlePlayerFinished);
        socket.off('raceFinished', handleRaceFinished);
        socket.off('playerDisconnected', handlePlayerDisconnected);
      };
    }
  }, [players, playerFinishedEarly, gameFinished, gameStarted, setRaceCompleted]);

  // Auto-focus textarea when countdown ends and game is ready
  useEffect(() => {
    if (countdown === null && gameStarted && !gameFinished && textareaRef.current) {
      // Small delay to ensure the textarea is fully rendered and enabled
      const focusTimeout = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(focusTimeout);
    }
  }, [countdown, gameStarted, gameFinished]);

  // Handle room closure notifications
  useEffect(() => {
    if (roomClosed) {
      console.log('[Game] Room was closed:', roomClosed);
      
      // Clear session data
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      // Show the room closure message
      alert(roomClosed.message);
      
      // Reset the game state and clear the room closed state
      useGameStore.getState().resetGame();
      clearRoomClosed();
      
      // Navigate back to login
      navigate('/');
    }
  }, [roomClosed, clearRoomClosed, navigate]);

  // Handle game over logic
  const handleGameOver = useCallback(() => {
    const finishTime = startTime ? (Date.now() - startTime) / 1000 : 0;
    // Emit game completion to server with updated stats
    const socket = useGameStore.getState().socket;
    if (socket) {
      socket.emit('playerFinished', {
        time: finishTime,
        wpm: wpm,
        errors: totalErrors,
        progress: progress
      });
      
      // Also update the player's stats in the store
      // Only emit playerFinished - this will handle both completion and stats update
      socket.emit('playerFinished', {
        time: finishTime,
        wpm: wpm,
        errors: totalErrors,
        progress: progress
      });
    }
  }, [startTime, wpm, totalErrors, progress]);

  // Handle time's up - ensure all final stats are synced but DON'T immediately hide leaderboard
  useEffect(() => {
    if (timeLeft === 0 && !gameFinished) {
      setGameFinished(true); // Freeze typing area immediately
      setWaitingForOthers(false); // Hide waiting overlay
      
      // Send final stats to server before showing overlay
      const socket = useGameStore.getState().socket;
      if (socket) {
        const finalStats = {
          wpm: wpm,
          errors: totalErrors,
          progress: progress,
          time: startTime ? (Date.now() - startTime) / 1000 : 0
        };
        
        console.log('[Game] Sending final stats on time up:', finalStats);
        // Only emit playerFinished - this will handle both completion and stats update
        socket.emit('playerFinished', finalStats);
      }
      
      handleGameOver();
      
      // Show Time's Up overlay with slower animation timing
      setTimeout(() => {
        setShowTimeUp(true);
      }, 200); // Small delay to let page freeze first
      
      // Wait for backend to send raceFinished event instead of auto-hiding
      // The raceFinished handler will manage hiding leaderboard and showing results
      const timer = setTimeout(() => {
        setShowTimeUp(false);
        // Only auto-show results if backend hasn't sent raceFinished yet
        if (!raceCompleted) {
          setRaceCompleted(true);
          if (!resultsShownRef.current) {
            resultsShownRef.current = true;
            setShowResults(true);
          }
        }
      }, TIME_UP_RESULTS_DELAY);
      
      setTimeUpTimer(timer);
    }
  }, [timeLeft, wpm, totalErrors, progress, startTime, gameFinished, handleGameOver, raceCompleted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timeUpTimer) {
        clearTimeout(timeUpTimer);
      }
    };
  }, [timeUpTimer]);

  // Handle game completion - but DON'T end the race until time is up
  useEffect(() => {
    if (progress === 100 && !gameFinished && timeLeft !== null && timeLeft > 0) {
      setShowConfetti(true);
      setPlayerFinishedEarly(true);
      setWaitingForOthers(true);
      setWaitingTimeLeft(timeLeft); // Set the waiting timer to match current timeLeft
      
      // Send completion stats to server but don't end the game yet
      const socket = useGameStore.getState().socket;
      if (socket) {
        const completionStats = {
          wpm: wpm,
          errors: totalErrors,
          progress: 100,
          time: startTime ? (Date.now() - startTime) / 1000 : 0
        };
        
        console.log('[Game] Player finished early, sending completion stats:', completionStats);
        // Only emit playerFinished - this will handle both completion and stats update
        socket.emit('playerFinished', completionStats);
        
        // Calculate current position based on how many players finished before you
        const playersFinishedBefore = players.filter(p => p.progress >= 100 && p.id !== useGameStore.getState().socket?.id).length;
        setCurrentPlayerPosition(playersFinishedBefore + 1);
      }
      
      // Individual player completed - keep leaderboard visible for multiplayer races
      if (players.length === 1 || players.every(p => p.progress >= 100)) {
        // Only if ALL players finished or single player - end race immediately
        setTimeout(() => {
          setWaitingForOthers(false);
          setRaceCompleted(true);
          useGameStore.setState({ gameState: 'finished' });
          if (!resultsShownRef.current) {
            resultsShownRef.current = true;
            setShowResults(true);
          }
        }, 2000); // Brief delay to show the congratulations
      }
      
      // Hide confetti after 3 seconds but don't show results yet
      setTimeout(() => {
        setShowConfetti(false);
      }, CONFETTI_DURATION);
    }
  }, [progress, gameFinished, wpm, totalErrors, startTime, timeLeft, players]);

  // Separate timer for waiting overlay
  useEffect(() => {
    if (waitingForOthers && waitingTimeLeft !== null && waitingTimeLeft > 0) {
      const timer = setInterval(() => {
        setWaitingTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            // Time's up while waiting - end the game
            setWaitingForOthers(false);
            useGameStore.setState({ gameState: 'finished' });
            if (!resultsShownRef.current) {
              resultsShownRef.current = true;
              setShowResults(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [waitingForOthers, waitingTimeLeft]);

  // Check if all players finished while waiting
  useEffect(() => {
    if (waitingForOthers && players.every(p => p.progress >= 100)) {
      setTimeout(() => {
        setWaitingForOthers(false);
        useGameStore.setState({ gameState: 'finished' });
        if (!resultsShownRef.current) {
          resultsShownRef.current = true;
          setShowResults(true);
        }
      }, 1500); // Short delay to show "all players finished" message
    }
  }, [waitingForOthers, players]);

  // Show results modal when all players finish or time's up
  useEffect(() => {
    if (gameState === 'finished' && !showResults) {
      // Add extra delay to ensure all stats are properly synced
      setTimeout(() => {
        // Force one final stats sync before showing results
        const socket = useGameStore.getState().socket;
        if (socket) {
          const finalStats = {
            wpm: wpm,
            errors: totalErrors,
            progress: progress,
            time: startTime ? (Date.now() - startTime) / 1000 : 0
          };
          socket.emit('updatePlayerStats', finalStats);
        }
        
        // Show results after a brief delay for final sync
        setTimeout(() => {
          if (!resultsShownRef.current) {
            resultsShownRef.current = true;
            setShowResults(true);
          }
        }, 500);
      }, GAME_STATE_SYNC_DELAY);
    }
  }, [gameState, showResults, wpm, totalErrors, progress, startTime]);

  // Calculate WPM and continuously update stats
  useEffect(() => {
    if (gameStarted && startTime && state.hasStartedTyping && !gameFinished && !raceCompleted) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      // Continuously update server with latest stats while game is active
      if (timeLeft !== null && timeLeft > 0) {
        const socket = useGameStore.getState().socket;
        if (socket) {
          const currentStats = {
            wpm: wpm,
            errors: totalErrors,
            progress: progress,
            time: timeElapsed * 60 // convert back to seconds
          };
          
          // Throttle updates to every 1 second for better sync
          const lastUpdate = (window as any).lastStatsUpdate || 0;
          const now = Date.now();
          if (now - lastUpdate > STATS_SYNC_THROTTLE) {
            socket.emit('updatePlayerStats', currentStats);
            (window as any).lastStatsUpdate = now;
          }
        }
      }
    }
  }, [input, gameStarted, startTime, state.hasStartedTyping, totalErrors, progress, timeLeft, wpm, gameFinished, raceCompleted]);

  useEffect(() => {
    dispatch({ type: 'RESET' });
    setGameFinished(false);
    setRaceCompleted(false); // Reset race completion state
    setPlayerFinishedEarly(false);
    setCurrentPlayerPosition(null);
    setWaitingForOthers(false);
    setShowResults(false);
    resultsShownRef.current = false;
  }, [text, dispatch]);

  useEffect(() => {
    if (countdown === null && !startTime) {
      dispatch({ type: 'START_GAME' });
    }
  }, [countdown, startTime, dispatch]);

  // Reset error tracking when game starts
  useEffect(() => {
    if (gameStarted) {
      dispatch({ type: 'RESET' });
    }
  }, [gameStarted, dispatch]);

  // Handle automatic navigation when game state changes to waiting (backend-initiated)
  useEffect(() => {
    const currentPath = window.location.pathname;
    // Only navigate if we're currently on the game page and state changes to waiting
    // This handles cases where backend resets room state (e.g., all players returned to lobby)
    if (gameState === 'waiting' && currentPath === '/game' && roomId) {
      // Small delay to ensure state is properly updated
      setTimeout(() => {
        navigate('/lobby');
      }, 100);
    }
  }, [gameState, roomId, navigate]);

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      // Store the remaining time when pausing
      setTimeLeft(prev => {
        if (prev === null) return null;
        return prev;
      });
    }
  };

  const handleReturnToLobby = () => {
    const socket = useGameStore.getState().socket;
    if (socket) {
      // Emit return to lobby event to reset room state on server
      socket.emit('returnToLobby');
    }
    
    // Reset game state but keep room connection
    useGameStore.setState({
      gameState: 'waiting',
      text: '',
      progress: 0
    });
    
    navigate('/lobby');
  };
  const handleBackToLogin = () => {
    const socket = useGameStore.getState().socket;
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    useGameStore.getState().resetGame();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url(/images/capybara_background_multiple.png) no-repeat center center fixed', backgroundSize: 'cover' }}>
      
      {/* Live Leaderboard - Fixed visibility logic for 4-player races */}
      <LiveLeaderboard
        players={players}
        currentUserId={useGameStore.getState().socket?.id || ''}
        isVisible={gameStarted && !raceCompleted && !showResults && players.length > 1}
        position="auto"
        compact={true}
        hasActiveOverlay={showTimeUp || (waitingForOthers && showConfetti)}
        gameAreaRef={gameAreaRef}
        forcePosition={false}
      />
      
      <div
        ref={gameAreaRef} // NEW: Attach the ref
        style={{
          width: '100%',
          maxWidth: 900,
          minWidth: 700,
          minHeight: 400,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 32,
          boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(10px)',
          border: '2px solid #b6a77a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 40px',
          position: 'relative',
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .live-leaderboard {
              top: auto !important;
              bottom: 10px !important;
              right: 10px !important;
              left: 10px !important;
              width: auto !important;
              max-width: 100%;
              transform: none !important;
            }
          }
        `}</style>
        <AnimatePresence>
          {showTimeUp && (
            <TimeUpOverlay 
              onAnimationComplete={() => setShowTimeUp(false)} 
            />
          )}
          {waitingForOthers && !showTimeUp && (
            <WaitingForOthersOverlay 
              position={currentPlayerPosition}
              timeLeft={waitingTimeLeft}
              finishedPlayers={players.filter(p => p.progress >= 100).length}
              totalPlayers={players.length}
            />
          )}
          {showResults && (
            <ResultsModal 
              players={players}
              onReturnToLobby={handleReturnToLobby}
              onBackToLogin={handleBackToLogin}
            />
          )}
        </AnimatePresence>
        {showConfetti && (
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
            recycle={false}
            colors={['#818CF8', '#6366F1', '#4F46E5', '#4338CA', '#3730A3']}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
          />
        )}
        {/* Header Row: Title, Timer, Pause */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={handleBackToLogin}
            style={modernButtonStyle}
          >
            ← Back to Login
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#6366f1', margin: 0, letterSpacing: 1 }}>{countdown !== null ? 'Get Ready!' : gameStarted ? (gameFinished ? 'Finished! 🎉' : 'GO!') : 'Ready to Race?'}</h2>
            {gameStarted && !gameFinished && timeLeft !== null && (
              <p style={{ fontSize: 18, fontWeight: 600, color: '#e11d48', margin: 0 }}>Time Left: {timeLeft}s</p>
            )}
            <p style={{ fontSize: 15, color: '#4b5563', margin: 0 }}>Type as fast as you can to win the race!</p>
          </div>
          {gameStarted && !gameFinished && (
            <button
              onClick={handlePause}
              style={modernButtonStyle}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
        {/* Typing Text */}
        {((!gameStarted && countdown === null && !gameFinished) || (gameStarted && !gameFinished)) && (
          <div style={{ 
            width: '100%', 
            maxWidth: 700, 
            margin: '0 auto 18px auto', 
            background: 'rgba(235, 228, 200, 0.95)', // Enhanced brown background matching lobby
            borderRadius: 12, 
            padding: '20px 28px', 
            boxShadow: '0 4px 12px rgba(182, 167, 122, 0.2)', 
            border: '2px solid #b6a77a',
            minHeight: 120,
            display: 'flex',
            alignItems: 'center'
          }}>
            {gameStarted && !gameFinished ? (
              <HighlightedText 
                text={text} 
                input={input} 
                errorPositions={errorPositions}
              />
            ) : (
              <div style={{ 
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                lineHeight: 1.7,
                whiteSpace: 'normal', // Allow text to wrap naturally
                wordWrap: 'break-word', // Break words when necessary
                overflowWrap: 'break-word', // Break long words to prevent overflow
                color: '#6b7280',
                userSelect: 'none'
              }}>
                {text || 'Waiting for text...'}
              </div>
            )}
          </div>
        )}
        
        {/* Individual Player Lane - Only Show Current Player */}
        {gameStarted && !gameFinished && currentPlayer && (
          <div style={{ width: '100%', maxWidth: 700, margin: '0 auto 24px auto' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 20, 
              background: 'rgba(99,102,241,0.15)', 
              borderRadius: 16, 
              padding: '16px 24px', 
              border: '2px solid #6366f1', 
              boxShadow: '0 6px 16px #6366f130',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Player Avatar */}
              <CapybaraIcon avatar={currentPlayer.avatar} color={currentPlayer.color} size={52} />
              
              {/* Player Name */}
              <span style={{ 
                fontWeight: 700, 
                color: '#6366f1', 
                fontSize: 20, 
                minWidth: 100,
                textShadow: '0 1px 2px #6366f140'
              }}>
                <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentPlayer.nickname) }} />
              </span>
              
              {/* Enhanced Progress Bar with Avatar Integration */}
              <div style={{ 
                flex: 1, 
                height: 32, 
                background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)', 
                borderRadius: 16, 
                margin: '0 16px', 
                position: 'relative', 
                overflow: 'hidden',
                border: '2px solid #cbd5e1',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08)'
              }}>
                {/* Progress Fill */}
                <div style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #a855f7 100%)', 
                  borderRadius: 16, 
                  transition: 'width 0.4s ease-out',
                  position: 'relative',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4)'
                }}>
                  {/* Moving Avatar on Progress Bar */}
                  {progress > 0 && (
                    <div style={{
                      position: 'absolute',
                      right: -16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#fff',
                      border: `3px solid ${currentPlayer.color || '#6366f1'}`,
                      boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
                      transition: 'all 0.4s ease-out',
                      zIndex: 10
                    }}>
                      <img 
                        src={currentPlayer.avatar ? `/images/${currentPlayer.avatar}` : "/images/Capy-progress-bar-icon.svg"}
                        alt="avatar" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                {/* Progress Percentage */}
                <span style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 14, 
                  color: progress > 20 ? '#fff' : '#374151', 
                  fontWeight: 700, 
                  textShadow: progress > 20 ? '0 1px 3px rgba(0,0,0,0.6)' : 'none'
                }}>
                  {Math.round(progress)}%
                </span>
                
                {/* Finish Line */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  background: 'repeating-linear-gradient(45deg, #000 0px, #000 4px, #fff 4px, #fff 8px)',
                  borderRadius: '0 16px 16px 0',
                  boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)'
                }} />
              </div>
              
              {/* Live Stats */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 6,
                minWidth: 100
              }}>
                <span style={{ 
                  fontSize: 16, 
                  color: '#fff', 
                  fontWeight: 800,
                  background: 'rgba(16, 185, 129, 0.9)',
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: '2px solid rgba(16, 185, 129, 1)',
                  minWidth: '90px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  WPM: {wpm}
                </span>
                <span style={{ 
                  fontSize: 16, 
                  color: '#fff', 
                  fontWeight: 800,
                  background: totalErrors > 0 ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: `2px solid ${totalErrors > 0 ? 'rgba(220, 38, 38, 1)' : 'rgba(16, 185, 129, 1)'}`,
                  minWidth: '90px',
                  textAlign: 'center',
                  boxShadow: `0 2px 8px ${totalErrors > 0 ? 'rgba(220, 38, 38, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  Errors: {totalErrors}
                </span>
              </div>
            </div>
          </div>
        )}
        {/* Typing Area (only for current player) */}
        {gameStarted && !gameFinished && (
          <div style={{ width: '100%', maxWidth: 700, margin: '18px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <textarea
              ref={textareaRef} // Attach ref to textarea
              value={input}
              onChange={handleInputChange}
              className="w-full max-w-2xl h-32 p-4 border-2 border-indigo-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 font-mono text-lg shadow"
              placeholder={
                countdown !== null ? `Wait for countdown: ${countdown}...` :
                isPaused ? 'Game Paused' : 
                'Start typing...'
              }
              autoFocus
              disabled={gameFinished || timeLeft === 0 || isPaused || countdown !== null}
              style={{ 
                width: '100%', 
                maxWidth: 700, 
                minHeight: 80, 
                borderRadius: 10, 
                fontSize: 18, 
                marginBottom: 0, 
                background: countdown !== null ? 'rgba(220, 210, 180, 0.8)' : 'rgba(235, 228, 200, 0.95)', // Slightly darker when disabled
                border: countdown !== null ? '2px solid #a69574' : '2px solid #b6a77a',
                color: countdown !== null ? '#6b7280' : '#374151',
                cursor: countdown !== null ? 'not-allowed' : 'text',
                opacity: countdown !== null ? 0.7 : 1
              }}
            />
          </div>
        )}
        {/* Countdown and Start Button */}
        <AnimatePresence mode="wait">
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: 200 }}
            >
              <h1 style={{ fontSize: 96, fontWeight: 800, color: '#6366f1', textShadow: '0 2px 12px #818cf8aa' }}>{countdown}</h1>
            </motion.div>
          )}
          {!gameStarted && countdown === null && !gameFinished && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: 200, justifyContent: 'center' }}>
              <button
                onClick={() => setCountdown(3)}
                style={modernButtonStyle}
              >
                Start Racing
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}