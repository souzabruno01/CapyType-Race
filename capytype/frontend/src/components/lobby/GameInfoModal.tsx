import { motion, AnimatePresence } from 'framer-motion';

interface GameInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameInfoModal = ({ isOpen, onClose }: GameInfoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ 
              scale: 0, 
              x: '25vw', 
              y: '25vh',
              originX: 1,
              originY: 1
            }}
            animate={{ 
              scale: 1, 
              x: 0, 
              y: 0 
            }}
            exit={{ 
              scale: 0, 
              x: '25vw', 
              y: '25vh',
              originX: 1,
              originY: 1
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            style={{
              background: 'rgba(235, 228, 200, 0.98)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(182, 167, 122, 0.4)',
              border: '2px solid #b6a77a',
              width: '90%',
              maxWidth: '420px',
              maxHeight: '85vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '16px',
              textAlign: 'center', 
              color: '#232323',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              🏁 Quick Guide 🐾
            </h2>
            <div style={{ color: '#444', lineHeight: 1.5, fontSize: '14px' }}>
              
              <div style={{ 
                background: 'rgba(182, 167, 122, 0.15)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '12px',
                border: '1px solid rgba(182, 167, 122, 0.3)'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#232323', fontSize: '15px' }}>
                  🎯 <strong>Goal:</strong> Type fast & accurately to win!
                </p>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Race your capybara by typing the text correctly before time runs out.
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                marginBottom: '12px' 
              }}>
                <div style={{ 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  padding: '8px', 
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>⚡</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Speed</div>
                  <div style={{ fontSize: '11px' }}>+10 pts/WPM</div>
                </div>
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  padding: '8px', 
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>🎯</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Accuracy</div>
                  <div style={{ fontSize: '11px' }}>-5 pts/error</div>
                </div>
              </div>

              <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                padding: '10px', 
                borderRadius: '6px', 
                marginBottom: '12px' 
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#232323' }}>🏃‍♂️ How to Play:</h4>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px' }}>
                  <li>Host clicks "Start Game" when ready</li>
                  <li>Type the text exactly as shown</li>
                  <li>Watch your capy advance in real-time</li>
                  <li>First to finish or highest score wins!</li>
                </ul>
              </div>

              <div style={{ 
                background: 'rgba(168, 85, 247, 0.1)', 
                padding: '10px', 
                borderRadius: '6px' 
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#232323' }}>🎉 Features:</h4>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px' }}>
                  <li>🥇 Live leaderboard & podium ceremony</li>
                  <li>🎨 Custom capybara avatars & colors</li>
                  <li>👥 Up to 32 players per race</li>
                </ul>
              </div>

            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #b6a77a, #a69574)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(182, 167, 122, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(182, 167, 122, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 3px 8px rgba(182, 167, 122, 0.3)';
              }}
            >
              🏁 Got it! Let's Race! 🐾
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
