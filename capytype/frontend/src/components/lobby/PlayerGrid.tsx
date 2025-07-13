import { motion, AnimatePresence } from 'framer-motion';
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
  // Calculate dynamic sizing based on number of players
  const getGridConfig = (playerCount: number) => {
    if (playerCount <= 4) {
      return {
        minCardWidth: 160,
        maxWidth: '100%',
        gap: 16,
        columns: 'repeat(auto-fit, minmax(160px, 1fr))'
      };
    } else if (playerCount <= 8) {
      return {
        minCardWidth: 140,
        maxWidth: '100%',
        gap: 14,
        columns: 'repeat(auto-fit, minmax(140px, 1fr))'
      };
    } else if (playerCount <= 16) {
      return {
        minCardWidth: 120,
        maxWidth: '100%',
        gap: 12,
        columns: 'repeat(auto-fit, minmax(120px, 1fr))'
      };
    } else if (playerCount <= 24) {
      return {
        minCardWidth: 100,
        maxWidth: '100%',
        gap: 10,
        columns: 'repeat(auto-fit, minmax(100px, 1fr))'
      };
    } else {
      // 25-32 players
      return {
        minCardWidth: 80,
        maxWidth: '100%',
        gap: 8,
        columns: 'repeat(auto-fit, minmax(80px, 1fr))'
      };
    }
  };

  const gridConfig = getGridConfig(players.length);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      marginBottom: 20,
      width: '100%',
      flex: 1,
      minHeight: 0
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#232323',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: '0.5px',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
      }}>
        🏁 Players ({players.length}{players.length >= 32 ? ' - Room Full!' : ''})
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: gridConfig.columns,
        gap: gridConfig.gap,
        width: '100%',
        justifyItems: 'center',
        padding: '0 8px',
        flex: 1,
        alignContent: 'start'
      }}>
        <AnimatePresence>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              currentPlayerId={currentPlayerId}
              showColorPicker={showColorPicker}
              setShowColorPicker={setShowColorPicker}
              onColorChange={onColorChange}
            />
          ))}
        </AnimatePresence>
      </div>

      {players.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            color: '#6b7280',
            fontStyle: 'italic',
            padding: 40
          }}
        >
          No players in the room yet...
        </motion.div>
      )}
    </div>
  );
};
