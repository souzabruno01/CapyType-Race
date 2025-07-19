import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface GameInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Expandable Score Example Section Component
const ScoreExampleSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ 
      background: 'rgba(34, 197, 94, 0.1)', 
      padding: '10px', 
      borderRadius: '6px', 
      marginBottom: '12px',
      border: '2px solid rgba(34, 197, 94, 0.3)',
      cursor: 'pointer'
    }}
    onClick={() => setIsExpanded(!isExpanded)}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <h4 style={{ margin: '0', fontSize: '13px', color: '#232323', fontWeight: 'bold' }}>
          💡 Example: How Your Score Works
        </h4>
        <span style={{ 
          fontSize: '16px', 
          color: '#059669', 
          fontWeight: 'bold',
          transition: 'transform 0.3s ease', 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          userSelect: 'none'
        }}>
          ▼
        </span>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', marginTop: '8px' }}
          >
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                If you finish typing at 65 WPM with 2 errors and 80% progress:
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px' }}>
                <li>Your base score: 65 WPM × 10 = <span style={{ color: '#059669', fontWeight: 'bold' }}>650 pts</span></li>
                <li>Error penalty: 2 errors × 3 = <span style={{ color: '#dc2626', fontWeight: 'bold' }}>-6 pts</span></li>
                <li>Progress bonus: 80% ÷ 5 = <span style={{ color: '#059669', fontWeight: 'bold' }}>+16 pts</span></li>
                <li>Speed bonus: <span style={{ color: '#059669', fontWeight: 'bold' }}>+50 pts</span> (because WPM &gt; 60)</li>
                <li>Perfect bonus: <span style={{ color: '#6b7280', fontWeight: 'bold' }}>0 pts</span> (because you had errors)</li>
              </ul>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
                <strong>Final Score: <span style={{ color: '#1f2937', fontSize: '12px' }}>710 points total!</span></strong>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                💡 The faster you type and fewer errors you make, the higher your score!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Show hint when collapsed */}
      {!isExpanded && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '11px', 
          color: '#666', 
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          Click to see detailed scoring example ↑
        </div>
      )}
    </div>
  );
};

export const GameInfoModal = ({ isOpen, onClose }: GameInfoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>
            {`
              .modern-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .modern-scrollbar::-webkit-scrollbar-track {
                background: rgba(235, 228, 200, 0.3);
                border-radius: 3px;
              }
              .modern-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #b6a77a, #a69574);
                border-radius: 3px;
              }
              .modern-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #a69574, #9a8866);
              }
            `}
          </style>
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
              zIndex: 9999,
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
              }}            style={{
              background: 'rgba(235, 228, 200, 0.98)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(182, 167, 122, 0.4)',
              border: '2px solid #b6a77a',
              width: '90%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              margin: '20px',
              // Modern scrollbar styling
              scrollbarWidth: 'thin',
              scrollbarColor: '#b6a77a #ebe4c8',
            }}
              className="modern-scrollbar"
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
                </div>              <div style={{ 
                background: 'rgba(99, 102, 241, 0.08)', 
                padding: '8px', 
                borderRadius: '6px', 
                marginBottom: '10px',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#232323', textAlign: 'center' }}>🏆 Points System</h4>
                <div style={{ fontSize: '10px', color: '#555', marginBottom: '6px', textAlign: 'center' }}>
                  <strong>Current: WPM-based scoring | Future: Word-accuracy based scoring</strong>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '4px', 
                  marginBottom: '6px' 
                }}>
                  <div style={{ 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    padding: '4px', 
                    borderRadius: '3px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', marginBottom: '1px' }}>⚡</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Base Score</div>
                    <div style={{ fontSize: '11px' }}>WPM × 10</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    padding: '4px', 
                    borderRadius: '3px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', marginBottom: '1px' }}>❌</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Penalties</div>
                    <div style={{ fontSize: '11px' }}>Errors × 3</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    padding: '4px', 
                    borderRadius: '3px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', marginBottom: '1px' }}>📈</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Progress</div>
                    <div style={{ fontSize: '11px' }}>% Complete ÷ 5</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    padding: '4px', 
                    borderRadius: '3px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', marginBottom: '1px' }}>🎯</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Bonuses</div>
                    <div style={{ fontSize: '11px' }}>+50 each</div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666', 
                  textAlign: 'center',
                  lineHeight: 1.2
                }}>
                  <div>🚀 Speed Bonus: +50 pts if WPM &gt; 60</div>
                  <div>🎯 Perfect Bonus: +50 pts if 0 errors</div>
                </div>
              </div>              <ScoreExampleSection />

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
        </>
      )}
    </AnimatePresence>
  );
};
