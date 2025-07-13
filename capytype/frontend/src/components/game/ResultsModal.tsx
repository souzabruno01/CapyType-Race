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
  // Calculate points and sort, then assign correct positions
  const playersWithPoints = useMemo(() => {
    const playersWithScores = players.map(player => ({
      ...player,
      points: Math.max(0, (player.wpm || 0) * 10 - (player.errors || 0) * 5 + Math.round((player.progress || 0) / 10))
    })).sort((a, b) => {
      // Sort by completion first (100% progress vs incomplete)
      if ((a.progress >= 100) !== (b.progress >= 100)) {
        return (b.progress >= 100 ? 1 : 0) - (a.progress >= 100 ? 1 : 0);
      }
      // Then by points
      if (b.points !== a.points) return b.points - a.points;
      // Then by progress
      if (b.progress !== a.progress) return (b.progress || 0) - (a.progress || 0);
      // Finally by WPM
      return (b.wpm || 0) - (a.wpm || 0);
    });

    // Assign correct positions (1st, 2nd, 3rd, etc.)
    return playersWithScores.map((player, index) => ({
      ...player,
      position: index + 1
    }));
  }, [players]);

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
          padding: window.innerWidth < 768 ? 16 : 24,
          maxWidth: window.innerWidth < 768 ? '100%' : 1200,
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
            fontSize: window.innerWidth < 768 ? '2rem' : '2.5rem',
            fontWeight: 800,
            marginBottom: 24,
            textAlign: 'center',
            letterSpacing: '1px',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)',
            color: '#3a3a3a',
            zIndex: 10,
            position: 'relative'
          }}
        >
          🏁 RACE RESULTS 🏁
        </motion.h2>
        
        {/* Podium for top 3 */}
        <Podium players={playersWithPoints.slice(0, 3)} />
        
        {/* Remaining players grid - responsive for up to 32 players */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 
            ? 'repeat(auto-fit, minmax(180px, 1fr))' 
            : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          margin: '20px 0',
          width: '100%',
          maxWidth: '100%',
          justifyItems: 'center'
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
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              padding: '14px 28px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              minWidth: 140
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            ← Back to Lobby
          </button>
          <button
            onClick={onBackToLogin}
            style={{
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              padding: '14px 28px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              minWidth: 140
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
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
