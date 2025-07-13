import { motion } from 'framer-motion';

const WaitingForOthersOverlay = ({ 
  position, 
  timeLeft, 
  finishedPlayers, 
  totalPlayers 
}: { 
  position: number | null; 
  timeLeft: number | null; 
  finishedPlayers: number; 
  totalPlayers: number; 
}) => (
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
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 45,
      backdropFilter: 'blur(8px)'
    }}
  >
    <motion.div
      initial={{ scale: 0.5, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
      style={{
        background: 'rgba(235, 228, 200, 0.98)',
        borderRadius: 24,
        padding: 40,
        textAlign: 'center',
        border: '3px solid #b6a77a',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '90vw',
        minWidth: 400
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        style={{
          fontSize: '4rem',
          marginBottom: 20
        }}
      >
        🎉
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#16a34a',
          marginBottom: 16,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Great Job!
      </motion.h2>
      
      {position && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            background: position <= 3 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 20,
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: 24,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'inline-block'
          }}
        >
          {position === 1 ? '🥇 1st Place!' : 
           position === 2 ? '🥈 2nd Place!' : 
           position === 3 ? '🥉 3rd Place!' : 
           `🏆 ${position}${position === 21 || position === 31 ? 'st' : 
                  position === 22 || position === 32 ? 'nd' : 
                  position === 23 || position === 33 ? 'rd' : 'th'} Place!`}
        </motion.div>
      )}
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{
          fontSize: '1.3rem',
          color: '#374151',
          fontWeight: 600,
          marginBottom: 20
        }}
      >
        {finishedPlayers >= totalPlayers ? 
          'All players finished! Showing results...' : 
          'Waiting for other players to finish...'
        }
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: '1.1rem',
          color: '#6b7280'
        }}>
          {finishedPlayers >= totalPlayers ? (
            <span>🎉 All players completed! Getting results ready...</span>
          ) : (
            <>
              <span>⏱️ Time left: <strong>{timeLeft}s</strong></span>
              <span>👥 {finishedPlayers}/{totalPlayers} finished</span>
            </>
          )}
        </div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: 32,
            height: 32,
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%'
          }}
        />
      </motion.div>
    </motion.div>
  </motion.div>
);

export default WaitingForOthersOverlay;
