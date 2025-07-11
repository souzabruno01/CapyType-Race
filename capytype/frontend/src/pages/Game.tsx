import { useEffect, useState, useCallback } from 'react';
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

const PodiumPlayer = ({ player, position, height }: { 
  player: any; 
  position: number; 
  height: number; 
}) => {
  const getMedalColor = (pos: number) => {
    switch(pos) {
      case 1: return '#fbbf24'; // Gold
      case 2: return '#9ca3af'; // Silver  
      case 3: return '#f59e0b'; // Bronze
      default: return '#6366f1';
    }
  };

  const getMedalEmoji = (pos: number) => {
    switch(pos) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * position, type: "spring", stiffness: 200 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Player Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: `3px solid ${getMedalColor(position)}`,
        borderRadius: 20,
        padding: 16,
        textAlign: 'center',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        marginBottom: 8,
        position: 'relative',
        minWidth: 140
      }}>
        {/* Medal */}
        <div style={{
          position: 'absolute',
          top: -15,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 30
        }}>
          {getMedalEmoji(position)}
        </div>
        
        <div style={{ marginTop: 20 }}>
          <CapybaraIcon avatar={player.avatar} color={player.color} size={48} />
          <h4 style={{
            fontWeight: 700,
            color: '#232323',
            fontSize: 14,
            margin: '8px 0 4px 0',
            wordBreak: 'break-word'
          }}>
            {player.nickname}
          </h4>
          <div style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 12
          }}>
            {player.points} pts
          </div>
        </div>
      </div>
      
      {/* Podium Base */}
      <div style={{
        width: 100,
        height: height,
        background: `linear-gradient(135deg, ${getMedalColor(position)}, ${getMedalColor(position)}dd)`,
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: 24,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        {position}
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(0,0,0,0.2)'
        }} />
      </div>
    </motion.div>
  );
};

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

const TimeUpOverlay = ({ onAnimationComplete }: { 
  onAnimationComplete: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.5 }}
    onAnimationComplete={onAnimationComplete}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backdropFilter: 'blur(12px)'
    }}
  >
    <motion.div
      initial={{ scale: 0.3, y: -100, rotateX: -90 }}
      animate={{ scale: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 2.0, type: "spring", stiffness: 60, damping: 15 }}
      style={{
        background: 'rgba(235, 228, 200, 0.98)',
        borderRadius: 24,
        padding: 48,
        textAlign: 'center',
        border: '3px solid #b6a77a',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        maxWidth: '90vw'
      }}
    >
      <motion.h2
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.1, 1], 
          opacity: 1,
          rotateZ: [0, -2, 2, 0] 
        }}
        transition={{ duration: 2.5, repeat: 1, ease: "easeInOut" }}
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          color: '#e11d48',
          marginBottom: 16,
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
      >
        ⏰ TIME'S UP! ⏰
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 1.2 }}
        style={{
          fontSize: '1.5rem',
          color: '#374151',
          fontWeight: 600,
          marginBottom: 24
        }}
      >
        🏁 Calculating final results...
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: 360 
        }}
        transition={{ 
          delay: 1.5,
          duration: 2.5, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        style={{
          width: 48,
          height: 48,
          border: '5px solid #e5e7eb',
          borderTop: '5px solid #6366f1',
          borderRadius: '50%',
          margin: '0 auto'
        }}
      />
    </motion.div>
  </motion.div>
);

const ResultsModal = ({ players, onReturnToLobby, onBackToLogin }: { 
  players: Player[];
  onReturnToLobby: () => void;
  onBackToLogin: () => void;
}) => {
  // Helper function for medal colors
  const getMedalColor = (position: number) => {
    switch(position) {
      case 1: return '#fbbf24'; // Gold (1st place)
      case 2: return '#9ca3af'; // Silver (2nd place)
      case 3: return '#f59e0b'; // Bronze (3rd place)
      default: return '#6366f1'; // Default blue
    }
  };

  // Calculate points for each player (WPM * 10 - errors * 5 + progress bonus)
  const playersWithPoints = players.map(player => ({
    ...player,
    points: Math.max(0, (player.wpm || 0) * 10 - (player.errors || 0) * 5 + Math.round((player.progress || 0) / 10))
  })).sort((a, b) => {
    // Sort by points first, then by progress, then by WPM
    if (b.points !== a.points) return b.points - a.points;
    if (b.progress !== a.progress) return (b.progress || 0) - (a.progress || 0);
    return (b.wpm || 0) - (a.wpm || 0);
  });

  const playerCount = playersWithPoints.length;
  
  // Calculate adaptive sizing
  const getPlayerCardSize = (index: number) => {
    if (index < 3) return { // Top 3 - reduced by 35%
      minWidth: 130,
      maxWidth: 155,
      avatarSize: 42,
      fontSize: 15,
      padding: 16
    };
    
    // Scale down for more players - reduced by 35%
    if (playerCount <= 6) return {
      minWidth: 110,
      maxWidth: 130,
      avatarSize: 32,
      fontSize: 14,
      padding: 14
    };
    
    if (playerCount <= 12) return {
      minWidth: 90,
      maxWidth: 110,
      avatarSize: 26,
      fontSize: 12,
      padding: 12
    };
    
    return { // Many players - smallest size - reduced by 35%
      minWidth: 80,
      maxWidth: 90,
      avatarSize: 22,
      fontSize: 10,
      padding: 8
    };
  };

  const getGridColumns = () => {
    if (playerCount <= 3) return 'repeat(3, 1fr)';
    if (playerCount <= 6) return 'repeat(3, 1fr)';
    if (playerCount <= 9) return 'repeat(3, 1fr)';
    if (playerCount <= 12) return 'repeat(4, 1fr)';
    return 'repeat(5, 1fr)';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        backdropFilter: 'blur(6px)',
        padding: 16
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'rgba(235, 228, 200, 0.98)',
          borderRadius: 24,
          padding: window.innerWidth < 768 ? 16 : 32,
          maxWidth: Math.min(900, playerCount > 6 ? 750 : 600),
          width: '95%',
          minWidth: 320,
          maxHeight: '95vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '3px solid #b6a77a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Title with animation */}
        <motion.h2 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#232323',
            marginBottom: 40,
            textAlign: 'center',
            letterSpacing: '1.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          🏁 RACE RESULTS 🏁
        </motion.h2>
        
        {/* Podium for top 3 - Special highlighting */}
        {playersWithPoints.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end',
              gap: 20,
              marginBottom: 40,
              flexWrap: 'wrap'
            }}
          >
            {/* 2nd Place */}
            {playersWithPoints[1] && (
              <PodiumPlayer player={playersWithPoints[1]} position={2} height={100} />
            )}
            {/* 1st Place */}
            {playersWithPoints[0] && (
              <PodiumPlayer player={playersWithPoints[0]} position={1} height={130} />
            )}
            {/* 3rd Place */}
            {playersWithPoints[2] && (
              <PodiumPlayer player={playersWithPoints[2]} position={3} height={80} />
            )}
          </motion.div>
        )}
        
        {/* All Players Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: getGridColumns(),
            gap: playerCount > 9 ? 18 : 24,
            marginBottom: 32,
            width: '100%',
            justifyItems: 'center'
          }}
        >
          {playersWithPoints.map((player, index) => {
            if (!player || typeof player !== 'object') return null;
            const isCurrentUser = player.id === useGameStore.getState().socket?.id;
            const size = getPlayerCardSize(index);
            
            return (
              <motion.div
                key={player.id || player.nickname}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1 * index, type: "spring", stiffness: 150 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: size.padding,
                  borderRadius: 16,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  minWidth: size.minWidth,
                  width: '100%',
                  maxWidth: size.maxWidth,
                  background: isCurrentUser 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                    : 'rgba(255, 255, 255, 0.95)',
                  border: isCurrentUser 
                    ? '3px solid #6366f1' 
                    : index < 3 ? `3px solid ${getMedalColor(index + 1)}` : '2px solid #e5e7eb',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Position Badge */}
                <div style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: getMedalColor(index + 1),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  border: '2px solid #fff',
                  zIndex: 2
                }}>
                  {index + 1}
                </div>
                
                {/* Medal Emoji for top 3 */}
                {index < 3 && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: -12,
                    fontSize: 24,
                    zIndex: 2
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                )}
                
                {/* Current User Crown */}
                {isCurrentUser && (
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 20,
                    zIndex: 2
                  }}>
                    👑
                  </div>
                )}
                
                <CapybaraIcon avatar={player.avatar} color={player.color} size={size.avatarSize} />
                
                <h3 style={{
                  fontWeight: 700,
                  color: '#232323',
                  marginTop: 8,
                  fontSize: size.fontSize,
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                  lineHeight: 1.2
                }}>
                  {typeof player.nickname === 'string' ? player.nickname : 'Player'}
                </h3>
                
                {/* Points - Prominently displayed */}
                <div style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: size.fontSize,
                  marginTop: 8,
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
                  textAlign: 'center',
                  minWidth: '60px'
                }}>
                  {player.points} pts
                </div>
                
                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 6,
                  marginTop: 8,
                  width: '100%'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '4px 8px',
                    borderRadius: 8,
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: Math.max(10, size.fontSize - 4), color: '#6b7280', fontWeight: 500 }}>WPM</div>
                    <div style={{ fontSize: Math.max(12, size.fontSize - 2), color: '#059669', fontWeight: 700 }}>
                      {Math.round(player.wpm || 0)}
                    </div>
                  </div>
                  
                  <div style={{
                    background: player.errors > 0 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    padding: '4px 8px',
                    borderRadius: 8,
                    border: `1px solid ${player.errors > 0 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: Math.max(10, size.fontSize - 4), color: '#6b7280', fontWeight: 500 }}>Errors</div>
                    <div style={{ 
                      fontSize: Math.max(12, size.fontSize - 2), 
                      color: player.errors > 0 ? '#dc2626' : '#059669', 
                      fontWeight: 700 
                    }}>
                      {player.errors || 0}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    padding: '4px 8px',
                    borderRadius: 8,
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: Math.max(10, size.fontSize - 4), color: '#6b7280', fontWeight: 500 }}>Progress</div>
                    <div style={{ fontSize: Math.max(12, size.fontSize - 2), color: '#6366f1', fontWeight: 700 }}>
                      {Math.round(player.progress || 0)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 16,
            width: '100%',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={onReturnToLobby}
            style={{
              ...modernButtonStyle,
              background: '#fff',
              color: '#232323',
              border: '2px solid #b6a77a',
              fontSize: 16,
              padding: '14px 28px'
            }}
          >
            ← Back to Lobby
          </button>
          <button
            onClick={onBackToLogin}
            style={{
              ...modernButtonStyle,
              fontSize: 16,
              padding: '14px 28px'
            }}
          >
            ← Back to Login
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

interface PlayerStats {
  wpm: number;
  errors: number;
  position: number;
  correctedErrors: number;
}

// Component to display text with highlighting
const HighlightedText = ({ text, input, errorPositions }: { 
  text: string; 
  input: string; 
  errorPositions: Set<number>;
}) => {
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '1.2rem',
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',
      position: 'relative',
      wordBreak: 'break-word'
    }}>
      {text.split('').map((char, index) => {
        const isTyped = index < input.length;
        const isError = errorPositions.has(index);
        const isCurrent = index === input.length;

        const style: React.CSSProperties = {
          transition: 'all 0.15s ease',
          padding: '2px 1px',
          borderRadius: 3,
          position: 'relative'
        };

        if (isTyped) {
          if (isError) {
            style.color = '#dc2626'; // Red for errors
            style.background = 'rgba(220, 38, 38, 0.15)';
            style.textDecoration = 'underline';
            style.textDecorationColor = '#ef4444';
          } else {
            style.color = '#10b981'; // Green for correct
            style.background = 'rgba(16, 185, 129, 0.1)';
          }
        } else {
          style.color = '#4b5563'; // Dark gray for untyped
        }

        if (isCurrent) {
          style.boxShadow = '0 0 0 2px #6366f1'; // Caret/cursor
          style.animation = 'pulse 1.2s infinite';
        }

        return (
          <span key={index} style={style}>
            {char === ' ' ? <span>&nbsp;</span> : char}
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
  const { text, updateProgress, players, gameState, roomClosed, clearRoomClosed } = useGameStore();
  const [input, setInput] = useState('');
  const [countdown, setCountdown] = useState<number | null>(3); // Start with countdown immediately
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
  const [totalErrors, setTotalErrors] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timeUpTimer, setTimeUpTimer] = useState<number | null>(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Get the current player's nickname from the store
  const currentPlayer = players.find(player => player.id === useGameStore.getState().socket?.id);

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

  // Handle game over logic
  const handleGameOver = useCallback(() => {
    const finishTime = startTime ? (Date.now() - startTime) / 1000 : 0;
    // Emit game completion to server with updated stats
    const socket = useGameStore.getState().socket;
    if (socket) {
      socket.emit('playerFinished', {
        time: finishTime,
        wpm: playerStats.wpm,
        errors: playerStats.errors,
        progress: progress
      });
      
      // Also update the player's stats in the store
      socket.emit('updatePlayerStats', {
        wpm: playerStats.wpm,
        errors: playerStats.errors,
        progress: progress
      });
    }
  }, [startTime, playerStats.wpm, playerStats.errors, progress]);

  // Handle time's up
  useEffect(() => {
    if (timeLeft === 0 && !gameFinished) {
      setGameFinished(true); // Freeze typing area immediately
      
      // Send final stats to server before showing overlay
      const socket = useGameStore.getState().socket;
      if (socket) {
        const finalStats = {
          wpm: playerStats.wpm,
          errors: playerStats.errors,
          progress: progress,
          time: startTime ? (Date.now() - startTime) / 1000 : 0
        };
        
        console.log('[Game] Sending final stats on time up:', finalStats);
        socket.emit('playerFinished', finalStats);
        socket.emit('updatePlayerStats', finalStats);
      }
      
      handleGameOver();
      
      // Show Time's Up overlay with slower animation timing
      setTimeout(() => {
        setShowTimeUp(true);
      }, 200); // Small delay to let page freeze first
      
      // Set a longer timer to show results after slower animation
      const timer = setTimeout(() => {
        setShowTimeUp(false);
        setShowResults(true);
      }, 5000); // Increased to 5 seconds for slower display
      
      setTimeUpTimer(timer);
    }
  }, [timeLeft, playerStats.wpm, playerStats.errors, progress, startTime]);

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
      
      // Send final stats to server before finishing
      const socket = useGameStore.getState().socket;
      if (socket) {
        const finalStats = {
          wpm: playerStats.wpm,
          errors: playerStats.errors,
          progress: 100,
          time: startTime ? (Date.now() - startTime) / 1000 : 0
        };
        
        console.log('[Game] Sending final stats on completion:', finalStats);
        socket.emit('playerFinished', finalStats);
        socket.emit('updatePlayerStats', finalStats);
      }
      
      handleGameOver();
      
      // Show results modal after confetti
      setTimeout(() => {
        setShowConfetti(false);
        setShowResults(true);
      }, 3000);
    }
  }, [progress, gameFinished, handleGameOver, playerStats.wpm, playerStats.errors, startTime]);

  // Show results modal when all players finish or time's up
  useEffect(() => {
    if (gameState === 'finished' && !showResults) {
      setTimeout(() => {
        setShowResults(true);
      }, 2000); // Show results after 2 seconds
    }
  }, [gameState, showResults]);

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
    
    // Do not allow input to exceed text length
    if (value.length > text.length) return;

    setInput(value);

    // Set hasStartedTyping to true when the player starts typing
    if (!hasStartedTyping && value.length > 0) {
      setHasStartedTyping(true);
    }

    // Check for errors and update progress
    const newErrorPositions = new Set<number>();
    let currentTotalErrors = totalErrors;
    
    // Check each character for errors
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) {
        if (!errorPositions.has(i)) {
          currentTotalErrors++;
        }
        newErrorPositions.add(i);
      }
    }

    // Update error and corrected positions
    setErrorPositions(newErrorPositions);
    setTotalErrors(currentTotalErrors);
    
    // Update error stats with total errors (including corrected ones)
    setPlayerStats(prev => ({ 
      ...prev, 
      errors: currentTotalErrors,
    }));

    // Calculate progress based on correct characters typed
    const correctChars = value.length - newErrorPositions.size;
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
      // Don't disconnect - just emit return to lobby event
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
                whiteSpace: 'pre-wrap',
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
                {currentPlayer.nickname}
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
                  WPM: {playerStats.wpm}
                </span>
                <span style={{ 
                  fontSize: 16, 
                  color: '#fff', 
                  fontWeight: 800,
                  background: playerStats.errors > 0 ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: `2px solid ${playerStats.errors > 0 ? 'rgba(220, 38, 38, 1)' : 'rgba(16, 185, 129, 1)'}`,
                  minWidth: '90px',
                  textAlign: 'center',
                  boxShadow: `0 2px 8px ${playerStats.errors > 0 ? 'rgba(220, 38, 38, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  Errors: {playerStats.errors}
                </span>
              </div>
            </div>
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
              style={{ 
                width: '100%', 
                maxWidth: 700, 
                minHeight: 80, 
                borderRadius: 10, 
                fontSize: 18, 
                marginBottom: 0, 
                background: 'rgba(235, 228, 200, 0.95)', // Brown background matching lobby
                border: '2px solid #b6a77a',
                color: '#374151'
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