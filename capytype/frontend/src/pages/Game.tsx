import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Player } from '../store/gameStore';
import ReactConfetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

const CapybaraIcon = ({ avatar, color }: { avatar?: string; color?: string }) => (
  <img
    src={avatar ? `/images/${avatar}` : "/images/Capy-progress-bar-icon.svg"}
    alt="Capybara"
    className="w-9 h-9 rounded-full border-2"
    style={{ background: color || '#fff', borderColor: color || '#b6a77a', objectFit: 'cover' }}
  />
);

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

const ResultsModal = ({ players, onReturnToLobby }: { 
  players: Player[];
  onReturnToLobby: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4"
    >
      <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Race Results 🏁</h2>
      <div className="space-y-4">
        {Array.isArray(players) && players
          .sort((a, b) => b.progress - a.progress)
          .map((player, index) => {
            if (!player || typeof player !== 'object') return null;
            const avatar = player.avatar;
            const color = player.color;
            return (
              <div
                key={player.id || player.nickname}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <span style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color || '#fff', border: `2px solid ${color || '#b6a77a'}` }}>
                    <img src={avatar ? `/images/${avatar}` : "/images/Capy-progress-bar-icon.svg"} alt="avatar" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%' }} />
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-700">{typeof player.nickname === 'string' ? player.nickname : ''}</h3>
                    <p className="text-sm text-gray-500">
                      {index + 1}
                      {index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Place
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-600">{typeof player.progress === 'number' ? Math.round(player.progress) : 0}%</p>
                  <p className="text-sm text-gray-500">Progress</p>
                </div>
              </div>
            );
          })}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={onReturnToLobby}
          className="px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg"
        >
          Return to Lobby
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
  const playerName = currentPlayer?.nickname || 'Player';
  const playerAvatar = currentPlayer?.avatar;
  const playerColor = currentPlayer?.color;

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
      // Emit leave room event
      socket.emit('leaveRoom');
      // Disconnect from the socket
      socket.disconnect();
    }
    // Reset game state
    useGameStore.getState().resetGame();
    // Navigate back to lobby
    navigate('/lobby');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url(/images/capybara_background_multiple.png) no-repeat center center fixed', backgroundSize: 'cover' }}>
      <div
        className="w-full max-w-4xl p-0 flex items-center justify-center"
        style={{ minHeight: '100vh' }}
      >
        <div
          className="w-full max-w-3xl bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl border-2 border-[#b6a77a] flex flex-col items-center justify-center relative"
          style={{ padding: '48px 40px', minHeight: 600, boxShadow: '0 8px 48px rgba(0,0,0,0.18)', backdropFilter: 'blur(6px)' }}
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

          {/* Header Row: Player, Title, Pause */}
          <div className="w-full flex items-center justify-between mb-8">
            <button
              onClick={() => window.location.href = 'http://localhost:5173/' }
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors shadow-sm border border-indigo-100"
            >
              ← Back to Login
            </button>
            <div className="flex flex-col items-center flex-1">
              <h2 className="text-3xl font-bold text-indigo-600 mb-1 tracking-tight">
                {countdown !== null ? 'Get Ready!' : gameStarted ? (gameFinished ? 'Finished! 🎉' : 'GO!') : 'Ready to Race?'}
              </h2>
              {gameStarted && !gameFinished && timeLeft !== null && (
                <p className="text-lg font-semibold text-red-500">Time Left: {timeLeft}s</p>
              )}
              <p className="text-base text-gray-600 mt-1">Type as fast as you can to win the race!</p>
            </div>
            {gameStarted && !gameFinished && (
              <button
                onClick={handlePause}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm border border-indigo-700"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {countdown !== null ? (
              <motion.div
                key={countdown}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center w-full py-16"
              >
                <h1 className="text-8xl font-bold text-indigo-600 drop-shadow-lg">{countdown}</h1>
              </motion.div>
            ) : gameStarted ? (
              <div className="flex flex-col items-center w-full gap-8">
                {/* Player Stats Row */}
                <div className="grid grid-cols-5 gap-6 w-full bg-white/80 p-5 rounded-xl shadow border border-indigo-100 mb-2">
                  <div className="flex flex-col items-center">
                    <CapybaraIcon avatar={playerAvatar} color={playerColor} />
                    <span className="font-semibold text-gray-700 mt-1 text-base">{playerName}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">Position</span>
                    <span className="font-bold text-indigo-600 text-lg">{playerStats.position}st</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="font-bold text-indigo-600 text-lg">{Math.round(progress)}%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">Speed</span>
                    <span className="font-bold text-green-600 text-lg">{playerStats.wpm} WPM</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">Errors</span>
                    <span className="font-bold text-red-600 text-lg">{playerStats.errors}</span>
                  </div>
                </div>

                {/* Typing Area */}
                <div className="w-full flex flex-col items-center bg-white/90 p-8 rounded-xl shadow border border-indigo-100">
                  <div className="mb-6 w-full max-w-2xl mx-auto">
                    <HighlightedText 
                      text={text} 
                      input={input} 
                      errorPositions={errorPositions}
                      correctedPositions={correctedPositions}
                    />
                  </div>
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    className="w-full max-w-2xl h-32 p-4 border-2 border-indigo-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 font-mono text-lg shadow"
                    placeholder={isPaused ? "Game Paused" : "Start typing..."}
                    autoFocus
                    disabled={gameFinished || timeLeft === 0 || isPaused}
                  />
                </div>

                {/* Race Track */}
                <div className="relative w-full h-20 mt-2 flex items-center">
                  {/* Player name box - aligned with progress line */}
                  <div className="flex items-center space-x-2 absolute top-0 left-0 mt-5 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-md text-base font-semibold shadow-lg">
                      {playerName}
                    </div>
                  </div>
                  {/* Road */}
                  <div className="absolute top-0 left-36 right-0 h-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-7" />
                  {/* Center road markings */}
                  <div className="absolute top-0 left-36 right-0 h-4 mt-7 flex justify-center">
                    <div className="w-full h-1 bg-white opacity-50 rounded-full" />
                  </div>
                  {/* Finish line */}
                  <div className="absolute top-0 right-0 mt-3 z-10">
                    <CheckeredFlag />
                  </div>
                  {/* Capybara with progress label */}
                  <motion.div
                    className="absolute top-0 flex flex-col items-center"
                    style={{
                      left: `calc(144px + (100% - 144px - 32px) * ${progress / 100})`,
                      transition: 'left 0.1s ease-out',
                      width: '40px',
                      zIndex: 20
                    }}
                  >
                    <span className="text-xs font-bold text-indigo-700 mb-1 bg-white/80 px-2 py-0.5 rounded shadow border border-indigo-100">
                      {Math.round(progress)}%
                    </span>
                    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CapybaraIcon avatar={playerAvatar} color={playerColor} />
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full py-16">
                <button
                  onClick={() => setCountdown(3)}
                  className="px-10 py-5 text-2xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Start Racing
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}