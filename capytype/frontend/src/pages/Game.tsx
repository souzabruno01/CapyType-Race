import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Player } from '../store/gameStore';
import ReactConfetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

const CapybaraIcon = () => (
  <img
    src="/images/Capy-progress-bar-icon.svg"
    alt="Capybara"
    className="w-9 h-9 transform -translate-y-2"
    style={{ transform: 'scaleX(1)' }} // Face right by default
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
        {players
          .sort((a, b) => b.progress - a.progress)
          .map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                  {player.nickname.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">{player.nickname}</h3>
                  <p className="text-sm text-gray-500">
                    {index + 1}
                    {index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Place
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-indigo-600">{Math.round(player.progress)}%</p>
                <p className="text-sm text-gray-500">Progress</p>
              </div>
            </div>
          ))}
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
        />
      )}
      <div className="w-full max-w-4xl p-8 space-y-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => window.location.href = 'http://localhost:5173/'}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
          >
            ← Back to Login
          </button>
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">
              {countdown !== null ? 'Get Ready!' : gameStarted ? (gameFinished ? 'Finished! 🎉' : 'GO!') : 'Ready to Race?'}
            </h2>
            {gameStarted && !gameFinished && timeLeft !== null && (
              <p className="text-xl font-bold text-red-500">Time Left: {timeLeft}s</p>
            )}
            <p className="text-gray-600">Type as fast as you can to win the race!</p>
          </div>
          {gameStarted && !gameFinished && (
            <button
              onClick={handlePause}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {countdown !== null ? (
            <motion.div
              key={countdown}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-8xl font-bold text-indigo-600">{countdown}</h1>
            </motion.div>
          ) : gameStarted ? (
            <div className="space-y-6">
              {/* Player Stats Grid */}
              <div className="grid grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                    {playerName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700">{playerName}</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Position</span>
                  <p className="font-bold text-indigo-600">{playerStats.position}st</p>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Progress</span>
                  <p className="font-bold text-indigo-600">{Math.round(progress)}%</p>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Speed</span>
                  <p className="font-bold text-green-600">{playerStats.wpm} WPM</p>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Errors</span>
                  <p className="font-bold text-red-600">{playerStats.errors}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
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
                  className="w-full h-32 p-4 border-2 border-indigo-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 font-mono"
                  placeholder={isPaused ? "Game Paused" : "Start typing..."}
                  autoFocus
                  disabled={gameFinished || timeLeft === 0 || isPaused}
                />
              </div>

              <div className="relative w-full h-16">
                {/* Player name box - aligned with progress line */}
                <div className="flex items-center space-x-2 absolute top-0 left-0 mt-3">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg">
                    {playerName}
                  </div>
                </div>
                {/* Road */}
                <div className="absolute top-0 left-24 right-0 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-5" />
                {/* Center road markings */}
                <div className="absolute top-0 left-24 right-0 h-3 mt-5 flex justify-center">
                  <div className="w-full h-0.5 bg-white opacity-50" />
                </div>
                {/* Finish line */}
                <div className="absolute top-0 right-0">
                  <CheckeredFlag />
                </div>
                {/* Capybara */}
                <motion.div
                  className="absolute top-0"
                  style={{
                    left: `calc(96px + (100% - 96px - 32px) * ${progress / 100})`,
                    transform: 'translateY(-8px)',
                    transformOrigin: 'center',
                    transition: 'left 0.1s ease-out'
                  }}
                >
                  <CapybaraIcon />
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setCountdown(3)}
                className="px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg"
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