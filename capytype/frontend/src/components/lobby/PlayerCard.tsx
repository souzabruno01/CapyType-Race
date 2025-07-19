import { motion } from 'framer-motion';
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
  
  const isPlayerHost = player.isHost;

  // Calculate responsive sizing based on total players
  const getCardConfig = (playerCount: number) => {
    if (playerCount <= 4) {
      return {
        padding: 12,
        avatarSize: 50,
        fontSize: 14,
        minWidth: 85,  // Reduced significantly
        maxWidth: 100  // Reduced significantly
      };
    } else if (playerCount <= 8) {
      return {
        padding: 10,
        avatarSize: 42,
        fontSize: 13,
        minWidth: 80,  // Reduced significantly
        maxWidth: 95   // Reduced significantly
      };
    } else if (playerCount <= 16) {
      return {
        padding: 8,
        avatarSize: 36,
        fontSize: 12,
        minWidth: 75,  // Reduced significantly
        maxWidth: 90   // Reduced significantly
      };
    } else if (playerCount <= 24) {
      return {
        padding: 7,
        avatarSize: 32,
        fontSize: 11,
        minWidth: 70,  // Reduced significantly
        maxWidth: 85   // Reduced significantly
      };
    } else {
      // 25-32 players
      return {
        padding: 6,
        avatarSize: 28,
        fontSize: 10,
        minWidth: 65,  // Reduced significantly
        maxWidth: 80   // Reduced significantly
      };
    }
  };

  const cardConfig = getCardConfig(totalPlayers);

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
        background: `linear-gradient(135deg, ${getLightColorBackground(player.color)}, rgba(255, 255, 255, 0.8))`,
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: `2px solid ${player.color}`,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        width: '100%', // Take full width of grid cell
        minWidth: cardConfig.minWidth, // Maintain minimum width
        maxWidth: cardConfig.maxWidth, // Maintain maximum width
        margin: '0 auto', // Center the card within the grid cell when it's smaller than cell
        transition: 'all 0.3s ease'
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
            border: `3px solid ${player.color}`,
            boxShadow: `0 0 0 2px rgba(255,255,255,0.8), 0 0 16px ${player.color}40`,
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
              background: player.color,
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
            onClick={() => setShowColorPicker(showColorPicker === player.id ? null : player.id)}
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

      {/* Color Picker */}
      {showColorPicker === player.id && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            background: '#fff',
            border: '2px solid #b6a77a',
            borderRadius: 12,
            padding: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            width: 'fit-content',
            zIndex: 1000 // Increased z-index to ensure it appears above all elements
          }}
          data-color-picker
        >
          {capyColors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color, player.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: color,
                border: player.color === color ? '3px solid #232323' : '2px solid #fff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
              }}
              title={`Change to ${color}`}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
