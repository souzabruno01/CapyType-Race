import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Player } from '../store/gameStore';
import ReactConfetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

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

/*
const CheckeredFlag = () => (
  <div className="w-8 h-8 flex">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="w-2 h-8 flex flex-col">
        {[...Array(4)].map((_, j) => (
          <div
            key={j}
            className={`w-2 h-2 ${(i + j) % 2 === 0 ? 'bg-black' : 'bg-white'}`}
          />
        ))}
      </div>
    ))}
  </div>
);
*/

const TimeUpOverlay = ({ onAnimationComplete, onReturnToLobby }: { 
  onAnimationComplete: () => void;
  onReturnToLobby: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.5 }}
    transition={{ duration: 0.5 }}
    onAnimationComplete={onAnimationComplete}
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="bg-white rounded-lg p-8 text-center"
    >
      <motion.h2
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="text-4xl font-bold text-red-600 mb-4"
      >
        Time's Up!
      </motion.h2>
      <p className="text-gray-600 mb-4">Calculating your results...</p>
      <button
        onClick={onReturnToLobby}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
      >
        Return to Lobby
      </button>
    </motion.div>
  </motion.div>
);

const ResultsModal = ({ players, onReturnToLobby, onBackToLogin }: { 
  players: Player[];
  onReturnToLobby: () => void;
  onBackToLogin: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30"
  >
    <motion.div
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border-2 border-[#b6a77a] flex flex-col items-center"
    >
      <h2 className="text-4xl font-bold text-indigo-700 mb-8 text-center">Race Results 🏁</h2>
      <div className="flex flex-wrap justify-center gap-6 mb-8 w-full">
        {Array.isArray(players) && players
          .sort((a, b) => b.progress - a.progress)
          .map((player, index) => {
            if (!player || typeof player !== 'object') return null;
            const avatar = player.avatar;
            const color = player.color;
            const isCurrentUser = player.id === useGameStore.getState().socket?.id;
            return (
              <div
                key={player.id || player.nickname}
                className={`flex flex-col items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${isCurrentUser ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-indigo-500 scale-105' : 'bg-white/70 border border-gray-200'}`}
                style={{ minWidth: '200px', flexGrow: 1, maxWidth: '280px' }}
              >
                <CapybaraIcon avatar={avatar} color={color} />
                <h3 className="font-semibold text-gray-800 mt-3 text-xl text-center">{typeof player.nickname === 'string' ? player.nickname : 'Player'}</h3>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  <span className="font-bold text-indigo-700 text-lg">{index + 1}º Place</span>
                </p>
                {player.wpm !== undefined && (
                  <p className="text-sm text-gray-600 text-center">
                    WPM: <span className="font-bold text-blue-600 text-lg">{Math.round(player.wpm)}</span>
                  </p>
                )}
                {player.errors !== undefined && (
                  <p className="text-sm text-gray-600 text-center">
                    Errors: <span className="font-bold text-red-600 text-lg">{player.errors}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 text-center">
                  Progress: <span className="font-bold text-green-600 text-lg">{typeof player.progress === 'number' ? Math.round(player.progress) : 0}%</span>
                </p>
              </div>
            );
          })}
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
        <button
          onClick={onReturnToLobby}
          className="px-8 py-4 text-xl font-medium text-indigo-600 bg-white rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transform hover:scale-105 transition-all shadow-lg"
        >
          ← Back to Lobby
        </button>
        <button
          onClick={onBackToLogin}
          className="px-8 py-4 text-xl font-medium text-indigo-600 bg-white rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transform hover:scale-105 transition-all shadow-lg"
        >
          ← Back to Login
        </button>
      </div>
    </motion.div>
  </motion.div>
);

interface PlayerStats {
  wpm: number;
  errors: number;
  position: number;
  correctedErrors: number;
}

// Component to display text with highlighting
const HighlightedText = ({ text, input, errorPositions, correctedPositions }: { 
  text: string; 
  input: string; 
  errorPositions: Set<number>;
  correctedPositions: Set<number>;
}) => {
  return (
    <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap relative">
      {text.split('').map((char, index) => {
        const isTyped = index < input.length;
        const isError = errorPositions.has(index);
        const isCorrected = correctedPositions.has(index);
        const currentChar = input[index];
        const isCurrent = index === input.length;

        let className = 'relative transition-all duration-150';
        
        if (isTyped) {
          if (isError) {
            className += ' text-red-600 bg-red-50 border-b-2 border-red-300';
          } else if (isCorrected) {
            className += ' text-yellow-600 bg-yellow-50 border-b-2 border-yellow-300';
          } else if (char === currentChar) {
            className += ' text-emerald-600 bg-emerald-50 border-b-2 border-emerald-300';
          }
        } else {
          className += ' text-gray-600';
        }

        if (isCurrent) {
          className += ' after:content-[""] after:absolute after:left-0 after:top-0 after:h-full after:w-0.5 after:bg-indigo-500 after:animate-pulse';
        }

        className += ' px-0.5';

        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      })}
    </div>
  );
};

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
  const { text, updateProgress, players, gameState } = useGameStore();
  const [input, setInput] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    wpm: 0,
    errors: 0,
    position: 1,
    correctedErrors: 0
  });
  const [progress, setProgress] = useState(0);
  const [errorPositions, setErrorPositions] = useState(new Set<number>());
  const [correctedPositions, setCorrectedPositions] = useState(new Set<number>());
  const [totalErrors, setTotalErrors] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timeUpTimer, setTimeUpTimer] = useState<number | null>(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Get the current player's nickname from the store
  const currentPlayer = players.find(player => player.id === useGameStore.getState().socket?.id);
  // const playerName = currentPlayer?.nickname || 'Player';
  // const playerAvatar = currentPlayer?.avatar;
  // const playerColor = currentPlayer?.color;

  // Calculate initial timer based on text length (2 seconds per word)
  useEffect(() => {
    if (text) {
      const wordCount = text.trim().split(/\s+/).length;
      const totalTime = wordCount * 2;
      setTimeLeft(totalTime);
    }
  }, [text]);

  // Timer countdown
  useEffect(() => {
    if (gameStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft]);

  // Handle time's up
  useEffect(() => {
    if (timeLeft === 0 && !gameFinished) {
      setShowTimeUp(true);
      setGameFinished(true);
      handleGameOver();
      
      // Set a timer to show results after animation
      const timer = setTimeout(() => {
        setShowTimeUp(false);
        setShowResults(true);
      }, 2000);
      
      setTimeUpTimer(timer);
    }
  }, [timeLeft]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timeUpTimer) {
        clearTimeout(timeUpTimer);
      }
    };
  }, [timeUpTimer]);

  // Handle game completion
  useEffect(() => {
    if (progress === 100 && !gameFinished) {
      setShowConfetti(true);
      setGameFinished(true);
      handleGameOver();
      
      // Stop confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [progress]);

  // Navigate to results when all players finish or time's up
  useEffect(() => {
    if (gameState === 'finished') {
      setTimeout(() => {
        navigate('/results');
      }, 3000);
    }
  }, [gameState, navigate]);

  const handleGameOver = () => {
    const finishTime = startTime ? (Date.now() - startTime) / 1000 : 0;
    // Emit game completion to server
    const socket = useGameStore.getState().socket;
    if (socket) {
      socket.emit('playerFinished', {
        time: finishTime,
        wpm: playerStats.wpm,
        errors: playerStats.errors
      });
    }
  };

  // Calculate WPM
  useEffect(() => {
    if (gameStarted && startTime && hasStartedTyping) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = input.trim().split(/\s+/).length;
      const wpm = Math.round(wordsTyped / timeElapsed);
      setPlayerStats(prev => ({ ...prev, wpm }));
    }
  }, [input, gameStarted, startTime, hasStartedTyping]);

  useEffect(() => {
    setInput('');
    setGameStarted(false);
    setCountdown(3);
    setErrorPositions(new Set());
    setCorrectedPositions(new Set());
    setTotalErrors(0);
    setProgress(0);
    setShowConfetti(false);
    setGameFinished(false);
  }, [text]);

  useEffect(() => {
    if (countdown === null && !startTime) {
      setStartTime(Date.now());
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setCountdown(null);
        setGameStarted(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!gameStarted || gameFinished || timeLeft === 0) return;
    
    const value = e.target.value;
    setInput(value);

    // Set hasStartedTyping to true when the player starts typing
    if (!hasStartedTyping && value.length > 0) {
      setHasStartedTyping(true);
    }

    // Check for errors and update progress
    const newErrorPositions = new Set<number>();
    const newCorrectedPositions = new Set<number>();
    
    // Check each character for errors
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) {
        newErrorPositions.add(i);
        // If this position was previously corrected, remove it from corrected positions
        if (correctedPositions.has(i)) {
          correctedPositions.delete(i);
        }
        // Count every error, regardless of position or history
        setTotalErrors(prev => prev + 1);
      } else if (errorPositions.has(i)) {
        // If this position was previously an error and is now correct, mark it as corrected
        newCorrectedPositions.add(i);
      }
    }

    // Update error and corrected positions
    setErrorPositions(newErrorPositions);
    setCorrectedPositions(newCorrectedPositions);
    
    // Update error stats with total errors (including corrected ones)
    setPlayerStats(prev => ({ 
      ...prev, 
      errors: totalErrors,
      correctedErrors: newCorrectedPositions.size
    }));

    // Calculate progress based on correct characters typed
    const correctChars = value.split('').filter((char, i) => char === text[i]).length;
    const newProgress = (correctChars / text.length) * 100;
    
    // Update progress state
    setProgress(newProgress);
    
    // Update global progress regardless of errors
    updateProgress(newProgress);
  };

  // Reset error tracking when game starts
  useEffect(() => {
    if (gameStarted) {
      setErrorPositions(new Set());
      setCorrectedPositions(new Set());
      setTotalErrors(0);
      setHasStartedTyping(false);
    }
  }, [gameStarted]);

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
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    useGameStore.getState().resetGame();
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
      <div
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
        <AnimatePresence>
          {showTimeUp && (
            <TimeUpOverlay 
              onAnimationComplete={() => setShowTimeUp(false)} 
              onReturnToLobby={handleReturnToLobby}
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
          <div style={{ width: '100%', maxWidth: 700, margin: '0 auto 18px auto', background: '#fff', borderRadius: 12, padding: '18px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1.5px solid #b6a77a' }}>
            {gameStarted && !gameFinished ? (
              <HighlightedText 
                text={text} 
                input={input} 
                errorPositions={errorPositions}
                correctedPositions={correctedPositions}
              />
            ) : (
              <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap text-gray-400 select-none" style={{ minHeight: 48 }}>
                {text || 'Waiting for text...'}
              </div>
            )}
          </div>
        )}
        {/* Player Lanes */}
        {gameStarted && !gameFinished && (
          <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {players.map((player) => {
              const isCurrent = player.id === currentPlayer?.id;
              const laneProgress = typeof player.progress === 'number' ? player.progress : 0;
              return (
                <div key={player.id || player.nickname} style={{ display: 'flex', alignItems: 'center', gap: 18, background: isCurrent ? 'rgba(99,102,241,0.10)' : 'rgba(0,0,0,0.03)', borderRadius: 10, padding: '8px 16px', border: isCurrent ? '2px solid #6366f1' : '1.5px solid #b6a77a', boxShadow: isCurrent ? '0 2px 8px #6366f122' : undefined }}>
                  <CapybaraIcon avatar={player.avatar} color={player.color} size={40} />
                  <span style={{ fontWeight: 600, color: isCurrent ? '#6366f1' : '#232323', fontSize: 17, minWidth: 90 }}>{player.nickname}</span>
                  <div style={{ flex: 1, height: 16, background: '#e5e7eb', borderRadius: 8, margin: '0 12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: `${laneProgress}%`, height: '100%', background: isCurrent ? 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)' : 'linear-gradient(90deg, #b6a77a 0%, #fde68a 100%)', borderRadius: 8, transition: 'width 0.2s' }} />
                    <span style={{ position: 'absolute', left: 8, top: 0, fontSize: 13, color: isCurrent ? '#fff' : '#232323', fontWeight: 500, lineHeight: '16px' }}>{Math.round(laneProgress)}%</span>
                  </div>
                  {isCurrent && (
                    <span style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginLeft: 8 }}>You</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* Typing Area (only for current player) */}
        {gameStarted && !gameFinished && (
          <div style={{ width: '100%', maxWidth: 700, margin: '18px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <textarea
              value={input}
              onChange={handleInputChange}
              className="w-full max-w-2xl h-32 p-4 border-2 border-indigo-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 font-mono text-lg shadow"
              placeholder={isPaused ? 'Game Paused' : 'Start typing...'}
              autoFocus
              disabled={gameFinished || timeLeft === 0 || isPaused}
              style={{ width: '100%', maxWidth: 700, minHeight: 80, borderRadius: 10, fontSize: 18, marginBottom: 0, background: '#fff' }}
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