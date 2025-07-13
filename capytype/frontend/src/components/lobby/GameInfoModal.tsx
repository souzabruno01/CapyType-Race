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
              maxWidth: '500px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>
              How to Play CapyType Race
            </h2>
            <div style={{ color: '#555', lineHeight: 1.6 }}>
              <p>
                <strong>Objective:</strong> Type the given text as fast and accurately as you can to race your capybara to the finish line!
              </p>
              <ul>
                <li>
                  <strong>Start the Race:</strong> The host of the room will start the game when everyone is ready.
                </li>
                <li>
                  <strong>Typing:</strong> Once the countdown finishes, start typing the text shown on the screen. Your capybara avatar will advance as you type correctly.
                </li>
                <li>
                  <strong>Accuracy Matters:</strong> Making mistakes will slow you down. Try to be as accurate as possible. Your WPM (Words Per Minute) and error count are tracked.
                </li>
                <li>
                  <strong>Winning:</strong> The first player to accurately type the entire text wins the race! Results for all players will be shown at the end.
                </li>
              </ul>
              <p>
                Have fun and may the fastest capy win!
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#f59e0b',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
