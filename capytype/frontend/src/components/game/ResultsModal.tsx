import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../store/gameStore';
import Podium from './Podium';
import PlayerResultCard from './PlayerResultCard';

const ResultsModal = ({ players, onReturnToLobby, onBackToLogin }: { 
  players: Player[];
  onReturnToLobby: () => void;
  onBackToLogin: () => void;
}) => {
  // Calculate points and sort
  const playersWithPoints = useMemo(() => players.map(player => ({
    ...player,
    points: Math.max(0, (player.wpm || 0) * 10 - (player.errors || 0) * 5 + Math.round((player.progress || 0) / 10))
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.progress !== a.progress) return (b.progress || 0) - (a.progress || 0);
    return (b.wpm || 0) - (a.wpm || 0);
  }), [players]);

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
          maxWidth: 900,
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
        <motion.h2 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            marginBottom: 40,
            textAlign: 'center',
            letterSpacing: '1.5px',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)',
            color: '#3a3a3a',
          }}
        >
          🏁 RACE RESULTS 🏁
        </motion.h2>
        {/* Podium for top 3 */}
        <Podium players={playersWithPoints.slice(0, 3)} />
        {/* Remaining players grid */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 16,
          margin: '32px 0',
          width: '100%'
        }}>
          {playersWithPoints.slice(3).map((player, idx) => (
            <PlayerResultCard key={player.id} player={player} index={idx} />
          ))}
        </div>
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 16,
          width: '100%',
          flexWrap: 'wrap',
          marginTop: 16
        }}>
          <button
            onClick={onReturnToLobby}
            style={{
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
              fontSize: 16,
              padding: '14px 28px'
            }}
          >
            ← Back to Login
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsModal;
