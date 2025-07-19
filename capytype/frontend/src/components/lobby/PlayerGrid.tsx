import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Player } from '../../store/gameStore';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
  players: Player[];
  currentPlayerId: string;
  showColorPicker: string | null;
  setShowColorPicker: (playerId: string | null) => void;
  onColorChange: (color: string, playerId: string) => void;
}

export const PlayerGrid = ({
  players,
  currentPlayerId,
  showColorPicker,
  setShowColorPicker,
  onColorChange
}: PlayerGridProps) => {
  // State to force re-renders on window resize
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive grid configuration based on screen size and player count
  const getResponsiveGridConfig = () => {
    const screenWidth = windowSize.width;
    const playerCount = players.length;
    
    // Base minimum card width with collision prevention
    let minCardWidth = 90; // Reduced significantly from 137px
    let gap = 10; // Increased gap for balanced spacing
    
    // Adjust based on screen size
    if (screenWidth < 640) { // Mobile
      minCardWidth = Math.max(85, Math.min(90, Math.floor((screenWidth * 0.65 - 64) / 3) - 20)); // Updated for 65vw modal size
      gap = 8; // Better mobile spacing
    } else if (screenWidth < 768) { // Small tablet
      minCardWidth = Math.max(85, Math.min(95, Math.floor((screenWidth * 0.65 - 64) / 4) - 20)); // Updated for 65vw modal size
      gap = 9; // Better spacing
    } else if (screenWidth < 1024) { // Tablet
      minCardWidth = Math.max(90, Math.min(100, Math.floor((screenWidth * 0.65 - 64) / 5) - 20)); // Updated for 65vw modal size
      gap = 10; // Good spacing
    } else { // Desktop
      minCardWidth = Math.max(90, Math.min(110, Math.floor((screenWidth * 0.65 - 64) / 6) - 20)); // Updated for 65vw modal size
      gap = 12; // Better desktop spacing
    }
    
    // Further adjust based on player count to prevent overlap
    if (playerCount > 20) {
      minCardWidth = Math.max(80, minCardWidth * 0.85);
      gap = Math.max(8, gap - 2); // Keep reasonable spacing
    } else if (playerCount > 12) {
      minCardWidth = Math.max(85, minCardWidth * 0.92);
      gap = Math.max(9, gap - 1); // Keep reasonable spacing
    }
    
    return {
      minCardWidth: Math.floor(minCardWidth),
      gap: Math.floor(gap)
    };
  };
  
  const { minCardWidth, gap } = getResponsiveGridConfig();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      minHeight: 0
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#232323',
        textAlign: 'center',
        margin: '0 0 8px 0',
        letterSpacing: '0.5px',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
        flexShrink: 0
      }}>
        🏁 Players ({players.length}{players.length >= 32 ? ' - Room Full!' : ''})
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`, // auto-fit prevents cutoff
        gap: `${gap}px`,
        width: '100%',
        justifyItems: 'stretch', // Changed from 'center' to 'stretch' for full width usage
        justifyContent: 'space-evenly', // Better distribution of remaining space
        padding: `${gap}px ${gap + 8}px ${gap}px ${gap}px`, // Extra 8px right padding to compensate for scrollbar space
        flex: 1,
        alignContent: 'start',
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0,
        // Custom scrollbar styling
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
      } as any}>
        <AnimatePresence>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              currentPlayerId={currentPlayerId}
              showColorPicker={showColorPicker}
              setShowColorPicker={setShowColorPicker}
              onColorChange={onColorChange}
              totalPlayers={players.length}
            />
          ))}
        </AnimatePresence>
      </div>

      {players.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic',
          fontSize: 14
        }}>
          No players in the room yet...
        </div>
      )}
    </div>
  );
};
