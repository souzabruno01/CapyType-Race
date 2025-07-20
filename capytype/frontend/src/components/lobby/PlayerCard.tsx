import { motion } from 'framer-motion';
import { useState } from 'react';
import DOMPurify from 'dompurify';
import { Player } from '../../store/gameStore';
import { CAPYBARA_AVATARS } from '../../utils/avatars';
import { PlayerName } from '../shared';

interface PlayerCardProps {
  player: Player;
  currentPlayerId: string;
  showColorPicker: string | null;
  setShowColorPicker: (playerId: string | null) => void;
  onColorChange: (color: string, playerId: string) => void;
  totalPlayers?: number; // Add total players count for responsive sizing
}

export const PlayerCard = ({
  player,
  currentPlayerId,
  showColorPicker,
  setShowColorPicker,
  onColorChange,
  totalPlayers = 1
}: PlayerCardProps) => {
  const capyColors = CAPYBARA_AVATARS.map(avatar => avatar.color);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  
  const isPlayerHost = player.isHost;

  // Calculate responsive sizing based on total players
  const getCardConfig = (playerCount: number) => {
    if (playerCount <= 4) {
      return {
        padding: 12,
        avatarSize: 50,
        fontSize: 12,  // Reduced by 2 points (was 14)
        minWidth: 85,  // Reduced significantly
        maxWidth: 100  // Reduced significantly
      };
    } else if (playerCount <= 8) {
      return {
        padding: 10,
        avatarSize: 42,
        fontSize: 11,  // Reduced by 2 points (was 13)
        minWidth: 80,  // Reduced significantly
        maxWidth: 95   // Reduced significantly
      };
    } else if (playerCount <= 16) {
      return {
        padding: 8,
        avatarSize: 36,
        fontSize: 10,  // Reduced by 2 points (was 12)
        minWidth: 75,  // Reduced significantly
        maxWidth: 90   // Reduced significantly
      };
    } else if (playerCount <= 24) {
      return {
        padding: 7,
        avatarSize: 32,
        fontSize: 9,   // Reduced by 2 points (was 11)
        minWidth: 70,  // Reduced significantly
        maxWidth: 85   // Reduced significantly
      };
    } else {
      // 25-32 players
      return {
        padding: 6,
        avatarSize: 28,
        fontSize: 8,   // Reduced by 2 points (was 10)
        minWidth: 65,  // Reduced significantly
        maxWidth: 80   // Reduced significantly
      };
    }
  };

  const cardConfig = getCardConfig(totalPlayers);

  // Determine the current color to display (hover preview or actual player color)
  const displayColor = showColorPicker === player.id && hoveredColor ? hoveredColor : player.color;

  // Convert player color to light version for card background
  const getLightColorBackground = (color: string) => {
    // Convert hex to RGB and create a slightly darker alpha version
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.25)`;
  };

  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
        padding: cardConfig.padding,
        background: `linear-gradient(135deg, ${getLightColorBackground(displayColor)}, rgba(255, 255, 255, 0.8))`,
        borderRadius: 16,
        border: `2px solid ${displayColor}`,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        width: '100%', // Take full width of grid cell
        minWidth: cardConfig.minWidth, // Maintain minimum width
        maxWidth: cardConfig.maxWidth, // Maintain maximum width
        margin: '0 auto', // Center the card within the grid cell when it's smaller than cell
        transition: 'all 0.3s ease',
        boxShadow: showColorPicker === player.id 
          ? '0 6px 20px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0,0,0,0.15)' // Enhanced blue shadow when modal open
          : '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <div style={{
        position: 'relative',
        marginBottom: 12
      }}>
        <img
          src={`/images/${player.avatar}`}
          alt={`${DOMPurify.sanitize(player.nickname)}'s avatar`}
          style={{
            width: cardConfig.avatarSize,
            height: cardConfig.avatarSize,
            borderRadius: '50%',
            border: `3px solid ${displayColor}`,
            boxShadow: `0 0 0 2px rgba(255,255,255,0.8), 0 0 16px ${displayColor}40`,
            transition: 'all 0.3s ease'
          }}
        />
        
        {player.id === currentPlayerId && (
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 24,
              height: 24,
              background: displayColor,
              borderRadius: '50%',
              border: '2px solid #fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease'
            }}
            onClick={() => {
              const newPickerState = showColorPicker === player.id ? null : player.id;
              setShowColorPicker(newPickerState);
              if (newPickerState === null) {
                setHoveredColor(null); // Clear hover preview when closing
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Change your color"
            data-color-picker
          >
            🎨
          </div>
        )}
      </div>

      <div style={{
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4,
          minHeight: 38 /* Allocate space to prevent layout shifts */
        }}>
          <PlayerName
            nickname={player.nickname}
            fontSize={cardConfig.fontSize}
            variant="lobby"
          />
          {player.id === currentPlayerId && !isPlayerHost && (
            <div style={{
              marginTop: 4,
              fontSize: 10,
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 6,
              fontWeight: 700,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              boxShadow: '0 1px 3px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              YOU
            </div>
          )}
          {isPlayerHost && (
            <div style={{
              marginTop: 4,
              fontSize: 12,
              background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
              color: '#fff',
              padding: '1px 6px',
              borderRadius: 8,
              fontWeight: 600,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              boxShadow: '0 1px 3px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>👑</span>
              <span>HOST</span>
            </div>
          )}
        </div>
        
        <div style={{
          fontSize: 11,
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4
        }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981' // Always show as ready for now
            }}
          />
          Ready
        </div>
      </div>

      {/* Smart Positioning Color Picker Modal */}
      {showColorPicker === player.id && (
        <>
          {/* Backdrop overlay */}
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
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 9998,
              backdropFilter: 'blur(2px)',
              borderRadius: 16 // Add rounded corners to match card design
            }}
            onClick={() => {
              setShowColorPicker(null);
              setHoveredColor(null); // Clear hover preview when closing
            }} // Close modal when clicking backdrop
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed', // Fixed positioning to overlay entire screen
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(135deg, rgba(235, 228, 200, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)', // Project styling
              border: `2px solid ${player.color}`,
              borderRadius: 12,
              padding: 8,
              boxShadow: `0 8px 24px ${player.color}40, 0 4px 12px rgba(0,0,0,0.15)`,
              zIndex: 9999, // Ensure it overlays everything
              backdropFilter: 'blur(12px)',
              maxWidth: 140, // Compact size
              width: 'max-content'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#232323',
              textAlign: 'center',
              marginBottom: 6,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}>
              🎨 Pick Your Color
            </div>
            
            {/* 2x3 grid for compact layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              justifyItems: 'center',
              marginBottom: 6
            }}>
              {capyColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(color, player.id);
                    setShowColorPicker(null); // Auto-close after selection
                    setHoveredColor(null); // Clear hover preview after selection
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: color,
                    border: player.color === color ? '3px solid #232323' : '2px solid rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    boxShadow: `0 3px 8px ${color}50`,
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    setHoveredColor(color); // Set hover preview
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${color}60`;
                  }}
                  onMouseLeave={(e) => {
                    setHoveredColor(null); // Clear hover preview
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 3px 8px ${color}50`;
                  }}
                  title={`Change to ${color}`}
                >
                  {player.color === color && (
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 10,
                      color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>✓</span>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowColorPicker(null);
                setHoveredColor(null); // Clear hover preview when closing
              }}
              style={{
                width: '100%',
                padding: '4px 8px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                border: 'none',
                borderRadius: 6,
                fontSize: 9,
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(107, 114, 128, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(107, 114, 128, 0.3)';
              }}
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
