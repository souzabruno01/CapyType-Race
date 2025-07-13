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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>
              🏁 How to Play CapyType Race 🐾
            </h2>
            <div style={{ color: '#555', lineHeight: 1.6 }}>
              <p>
                <strong>🎯 Objective:</strong> Race your adorable capybara to the finish line by typing as fast and accurately as possible!
              </p>
              
              <h3 style={{ color: '#f59e0b', marginTop: '20px', marginBottom: '10px' }}>🚀 How to Race:</h3>
              <ul>
                <li>
                  <strong>🏁 Start the Race:</strong> The room host clicks "Start Game" when everyone is ready
                </li>
                <li>
                  <strong>⏱️ Get Ready:</strong> A 3-second countdown gives you time to prepare
                </li>
                <li>
                  <strong>💨 Type Fast:</strong> Type the displayed text exactly as shown - your capy advances with each correct word!
                </li>
                <li>
                  <strong>🎯 Stay Accurate:</strong> Mistakes slow you down! Fix errors by backspacing
                </li>
                <li>
                  <strong>⏰ Race Against Time:</strong> Complete the text before time runs out
                </li>
              </ul>

              <h3 style={{ color: '#f59e0b', marginTop: '20px', marginBottom: '10px' }}>🏆 Scoring System:</h3>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '2px solid #e9ecef' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#333' }}>Points = (WPM × 10) - (Errors × 5) + (Progress ÷ 10)</p>
                <ul style={{ margin: 0 }}>
                  <li><strong>+10 points</strong> per WPM (Words Per Minute)</li>
                  <li><strong>-5 points</strong> per typing error</li>
                  <li><strong>+1 point</strong> per 10% progress completed</li>
                </ul>
              </div>

              <h3 style={{ color: '#f59e0b', marginTop: '20px', marginBottom: '10px' }}>🎉 Fun Features:</h3>
              <ul>
                <li><strong>🥇 Live Leaderboard:</strong> Watch your capy race in real-time!</li>
                <li><strong>🎨 Custom Capybaras:</strong> Choose your favorite capy avatar and color</li>
                <li><strong>🏅 Podium Ceremony:</strong> Top 3 finishers get medals and glory</li>
                <li><strong>📊 Detailed Stats:</strong> See your WPM, accuracy, and ranking</li>
                <li><strong>👥 Multiplayer Fun:</strong> Race up to 32 players simultaneously</li>
              </ul>

              <p style={{ textAlign: 'center', marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
                🐾 Ready to become the ultimate CapyType champion? Let's race! 🏃‍♂️💨
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
            >
              🏁 Ready to Race! 🐾
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
