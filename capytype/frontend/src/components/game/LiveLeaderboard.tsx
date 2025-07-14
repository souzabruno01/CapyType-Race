import React, { useState, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { Player } from '../../store/gameStore';

interface LiveLeaderboardProps {
  players: Player[];
  currentUserId: string;
  isVisible: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'auto';
  compact?: boolean;
  hasActiveOverlay?: boolean;
  forcePosition?: boolean;
  gameAreaRef: React.RefObject<HTMLDivElement>; // NEW: Ref to the main game area
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
  position = 'auto',
  compact = false,
  hasActiveOverlay = false,
  forcePosition = false,
  gameAreaRef,
}) => {
  const [positionStyles, setPositionStyles] = useState<React.CSSProperties>({});
  const leaderboardRef = useRef<HTMLDivElement>(null);

  // NEW: Simplified sorting logic. The 'points' are now provided by the server.
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.progress !== a.progress) return b.progress - a.progress;
    return b.wpm - a.wpm;
  }).map((player, index) => ({
    ...player,
    position: index + 1,
  }));

  // The state for optimalPosition is now managed inside the layout effect
  const [optimalPosition, setOptimalPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('right');

  useLayoutEffect(() => {
    const calculatePosition = () => {
      if (!isVisible || !gameAreaRef.current || !leaderboardRef.current) {
        return;
      }

      const gameRect = gameAreaRef.current.getBoundingClientRect();
      const leaderboardNode = leaderboardRef.current;
      // Temporarily set opacity to 1 to measure dimensions correctly
      const originalOpacity = leaderboardNode.style.opacity;
      leaderboardNode.style.opacity = '1';
      const leaderboardRect = leaderboardNode.getBoundingClientRect();
      leaderboardNode.style.opacity = originalOpacity;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const margin = 16;

      const spaceRight = windowWidth - gameRect.right - margin;
      const spaceLeft = gameRect.left - margin;
      const spaceBottom = windowHeight - gameRect.bottom - margin;
      
      const leaderboardWidth = leaderboardRect.width > 0 ? leaderboardRect.width : (compact ? 220 : 280);
      const leaderboardHeight = leaderboardRect.height > 0 ? leaderboardRect.height : 300;

      let bestPosition: 'left' | 'right' | 'top' | 'bottom' = position === 'auto' ? 'right' : position;

      // Overriding logic for small screens or when overlays are active
      if (windowWidth <= 768 || hasActiveOverlay) {
        if (spaceBottom >= leaderboardHeight) {
          bestPosition = 'bottom';
        } else if (spaceRight >= leaderboardWidth) {
          bestPosition = 'right';
        } else {
          bestPosition = 'left';
        }
      } else {
        // Standard logic for larger screens
        if (position === 'auto') {
          if (spaceRight >= leaderboardWidth) {
            bestPosition = 'right';
          } else if (spaceLeft >= leaderboardWidth) {
            bestPosition = 'left';
          } else if (spaceBottom >= leaderboardHeight) {
            bestPosition = 'bottom';
          } else {
            bestPosition = 'right'; // Fallback
          }
        }
      }
      
      if (forcePosition && position !== 'auto') {
        bestPosition = position;
      }

      setOptimalPosition(bestPosition);

      let styles: React.CSSProperties = {};
      const verticalCenter = gameRect.top + (gameRect.height - leaderboardHeight) / 2;

      switch (bestPosition) {
        case 'right':
          styles = { left: gameRect.right + margin, top: verticalCenter };
          break;
        case 'left':
          styles = { left: gameRect.left - leaderboardWidth - margin, top: verticalCenter };
          break;
        case 'bottom':
          styles = { left: gameRect.left + (gameRect.width - leaderboardWidth) / 2, top: gameRect.bottom + margin };
          break;
        case 'top':
          styles = { left: gameRect.left + (gameRect.width - leaderboardWidth) / 2, top: gameRect.top - leaderboardHeight - margin };
          break;
      }
      
      setPositionStyles({
        position: 'fixed',
        ...styles,
        zIndex: bestPosition === 'bottom' ? 25 : 35,
        pointerEvents: 'auto',
      });
    };
    
    // A small delay to ensure the leaderboard has rendered to get its dimensions
    const timer = setTimeout(calculatePosition, 50);
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible, gameAreaRef, players, hasActiveOverlay, compact, forcePosition, position]);


  const containerWidth = compact ? 220 : 280;
  const maxVisiblePlayers = compact ? 5 : 8;
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isBottomPosition = optimalPosition === 'bottom';

  if (!isVisible || players.length === 0) return null;

  return (
    <motion.div
      ref={leaderboardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        ...positionStyles,
        width: isBottomPosition ? 'auto' : (isSmallScreen ? 'auto' : containerWidth),
        maxHeight: isBottomPosition ? '100px' : (optimalPosition === 'top' ? 120 : '70vh'),
        opacity: 0, // Start with opacity 0 to prevent flicker before positioning
      }}
    >
      <div style={{
        background: 'rgba(235, 228, 200, 0.95)',
        borderRadius: isBottomPosition ? '16px 16px 0 0' : 16,
        padding: compact || isBottomPosition ? 8 : 16,
        border: '2px solid #b6a77a',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        display: isBottomPosition || isSmallScreen ? 'flex' : 'block',
        alignItems: isBottomPosition || isSmallScreen ? 'center' : 'normal'
      }}>
        {/* Header */}
        {!isBottomPosition && !isSmallScreen && (
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
        )}

        {/* Inline header for bottom position */}
        {isBottomPosition && (
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#666',
            whiteSpace: 'nowrap',
            marginRight: 8
          }}>
            🏆 Live:
          </div>
        )}

        {/* Players List */}
        <div style={{
          display: 'flex',
          flexDirection: isBottomPosition || isSmallScreen || optimalPosition === 'top' ? 'row' : 'column',
          gap: compact || isBottomPosition || isSmallScreen ? 4 : 8,
          overflowY: optimalPosition === 'top' || isBottomPosition || isSmallScreen ? 'visible' : 'auto',
          overflowX: optimalPosition === 'top' || isBottomPosition || isSmallScreen ? 'auto' : 'visible',
          maxHeight: isBottomPosition || isSmallScreen ? 'none' : (optimalPosition === 'top' ? 'none' : '50vh'),
          alignItems: isBottomPosition || isSmallScreen ? 'center' : 'normal',
          flex: isBottomPosition ? '1' : 'initial'
        }}>
          <AnimatePresence>
            {sortedPlayers.slice(0, maxVisiblePlayers).map((player) => {
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
                    minWidth: isSmallScreen ? 60 : (position === 'top' ? 180 : 'auto'),
                    maxWidth: isSmallScreen ? 80 : 'none',
                    flexShrink: 0,
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    textAlign: isSmallScreen ? 'center' : 'left'
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
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(player.nickname) }} />
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
        {sortedPlayers.length > maxVisiblePlayers && (
          <div style={{
            textAlign: 'center',
            marginTop: 8,
            fontSize: compact ? 9 : 10,
            color: '#666',
            fontStyle: 'italic'
          }}>
            +{sortedPlayers.length - maxVisiblePlayers} more
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveLeaderboard;
