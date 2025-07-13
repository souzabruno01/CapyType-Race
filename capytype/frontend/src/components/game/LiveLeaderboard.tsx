import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../store/gameStore';

interface LiveLeaderboardProps {
  players: Player[];
  currentUserId: string;
  isVisible: boolean;
  position?: 'left' | 'right' | 'top';
  compact?: boolean;
}

interface PlayerWithPosition extends Player {
  position: number;
  points: number;
}

const CapybaraIcon = ({ avatar, color, size = 24 }: { avatar?: string; color?: string; size?: number }) => (
  <img
    src={avatar ? `/images/${avatar}` : "/images/Capy-progress-bar-icon.svg"}
    alt="Capybara"
    style={{
      width: size, 
      height: size, 
      borderRadius: '50%', 
      border: `1px solid ${color || '#b6a77a'}`,
      background: color || '#fff', 
      objectFit: 'cover'
    }}
  />
);

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  players,
  currentUserId,
  isVisible,
  position = 'right',
  compact = false
}) => {
  // Enhanced points calculation
  const calculatePoints = (player: Player): number => {
    const basePoints = (player.wpm || 0) * 10;
    const errorPenalty = (player.errors || 0) * 3; // Reduced penalty
    const progressBonus = Math.round((player.progress || 0) / 5); // Better progress bonus
    const speedBonus = (player.wpm || 0) > 60 ? ((player.wpm || 0) - 60) * 2 : 0; // Speed bonus
    const accuracyBonus = (player.errors || 0) === 0 && (player.progress || 0) > 10 ? 50 : 0; // Perfect accuracy bonus
    
    return Math.max(0, basePoints - errorPenalty + progressBonus + speedBonus + accuracyBonus);
  };

  // Calculate positions and sort players
  const playersWithPositions: PlayerWithPosition[] = players
    .map(player => ({
      ...player,
      points: calculatePoints(player)
    }))
    .sort((a, b) => {
      // Sort by points first, then by progress, then by WPM
      if (b.points !== a.points) return b.points - a.points;
      if ((b.progress || 0) !== (a.progress || 0)) return (b.progress || 0) - (a.progress || 0);
      return (b.wpm || 0) - (a.wpm || 0);
    })
    .map((player, index) => ({
      ...player,
      position: index + 1
    }));

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 30,
      pointerEvents: 'none' as const
    };

    switch (position) {
      case 'left':
        return {
          ...baseStyles,
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          ...baseStyles,
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'top':
        return {
          ...baseStyles,
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)'
        };
      default:
        return {
          ...baseStyles,
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)'
        };
    }
  };

  const containerWidth = compact ? 220 : 280;
  const maxVisiblePlayers = compact ? 5 : 8;

  if (!isVisible || players.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: position === 'left' ? -50 : position === 'right' ? 50 : 0, y: position === 'top' ? -50 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: position === 'left' ? -50 : position === 'right' ? 50 : 0, y: position === 'top' ? -50 : 0 }}
      style={{
        ...getPositionStyles(),
        width: containerWidth,
        maxHeight: position === 'top' ? 120 : '70vh'
      }}
    >
      <div style={{
        background: 'rgba(235, 228, 200, 0.95)',
        borderRadius: 16,
        padding: compact ? 12 : 16,
        border: '2px solid #b6a77a',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 12,
          borderBottom: '2px solid #b6a77a',
          paddingBottom: 8
        }}>
          <h4 style={{
            margin: 0,
            fontSize: compact ? 12 : 14,
            fontWeight: 700,
            color: '#232323',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🏆 LIVE RANKINGS
          </h4>
        </div>

        {/* Players List */}
        <div style={{
          display: 'flex',
          flexDirection: position === 'top' ? 'row' : 'column',
          gap: compact ? 6 : 8,
          overflowY: position === 'top' ? 'visible' : 'auto',
          overflowX: position === 'top' ? 'auto' : 'visible',
          maxHeight: position === 'top' ? 'none' : '50vh'
        }}>
          <AnimatePresence>
            {playersWithPositions.slice(0, maxVisiblePlayers).map((player) => {
              const isCurrentUser = player.id === currentUserId;
              
              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: compact ? 6 : 8,
                    padding: compact ? 6 : 8,
                    borderRadius: 12,
                    background: isCurrentUser 
                      ? `linear-gradient(135deg, ${player.color ? `${player.color}40` : 'rgba(99, 102, 241, 0.4)'} 0%, ${player.color ? `${player.color}20` : 'rgba(168, 85, 247, 0.2)'} 100%)`
                      : `linear-gradient(135deg, ${player.color ? `${player.color}15` : 'rgba(255, 255, 255, 0.8)'} 0%, rgba(255, 255, 255, 0.5) 100%)`,
                    border: isCurrentUser 
                      ? `2px solid ${player.color || '#6366f1'}` 
                      : `1px solid ${player.color ? `${player.color}30` : 'rgba(0,0,0,0.1)'}`,
                    minWidth: position === 'top' ? 180 : 'auto',
                    flexShrink: 0
                  }}
                >
                  {/* Position Badge */}
                  <div style={{
                    width: compact ? 20 : 24,
                    height: compact ? 20 : 24,
                    borderRadius: '50%',
                    background: player.position <= 3 
                      ? (player.position === 1 ? '#fbbf24' : player.position === 2 ? '#9ca3af' : '#f59e0b')
                      : `linear-gradient(135deg, ${player.color || '#6366f1'} 0%, ${player.color ? `${player.color}dd` : '#5856eb'} 100%)`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: compact ? 10 : 12,
                    flexShrink: 0
                  }}>
                    {player.position}
                  </div>

                  {/* Avatar */}
                  <CapybaraIcon 
                    avatar={player.avatar} 
                    color={player.color} 
                    size={compact ? 20 : 24} 
                  />

                  {/* Player Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: compact ? 10 : 11,
                      fontWeight: 700,
                      color: '#232323',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: compact ? 80 : 120
                    }}>
                      {player.nickname}
                      {isCurrentUser && ' 👑'}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: compact ? 9 : 10,
                      color: '#666',
                      marginTop: 2
                    }}>
                      <span>{player.points}pts</span>
                      <span>{Math.round(player.progress || 0)}%</span>
                    </div>
                  </div>

                  {/* Live Indicator */}
                  {player.progress > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#10b981',
                        flexShrink: 0
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Show more indicator */}
        {playersWithPositions.length > maxVisiblePlayers && (
          <div style={{
            textAlign: 'center',
            marginTop: 8,
            fontSize: compact ? 9 : 10,
            color: '#666',
            fontStyle: 'italic'
          }}>
            +{playersWithPositions.length - maxVisiblePlayers} more
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveLeaderboard;
