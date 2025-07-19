import { motion } from 'framer-motion';
import { modernButtonStyle, modernCheckboxStyle } from '../../utils/styles';

interface LobbyActionsProps {
  isAdmin: boolean;
  players: any[];
  playAlone: boolean;
  setPlayAlone: (playAlone: boolean) => void;
  onShowTextModal: () => void;
  onStartGame: () => void;
  onBackToLogin: () => void;
  connectionStatus: string;
}

export const LobbyActions = ({
  isAdmin,
  players,
  playAlone,
  setPlayAlone,
  onShowTextModal,
  onStartGame,
  onBackToLogin,
  connectionStatus
}: LobbyActionsProps) => {
  const canStartGame = isAdmin && (players.length >= 2 || playAlone) && connectionStatus === 'connected';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      gap: 16
    }}>
      {/* Back Button - Left side */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBackToLogin}
        style={{
          ...modernButtonStyle,
          background: '#fff',
          color: '#232323',
          border: '1.5px solid #b6a77a',
          fontSize: 12,
          padding: '8px 16px',
          minWidth: 'auto'
        }}
      >
        ← Back
      </motion.button>

      {/* Admin Controls - Center */}
      {isAdmin ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flex: 1,
          justifyContent: 'center'
        }}>
          {/* Practice Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <input
              type="checkbox"
              id="practice-mode"
              checked={playAlone}
              onChange={(e) => setPlayAlone(e.target.checked)}
              style={modernCheckboxStyle}
            />
            <label
              htmlFor="practice-mode"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#2d3748',
                cursor: 'pointer',
                userSelect: 'none',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              Practice Mode
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: 8
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShowTextModal}
              style={{
                ...modernButtonStyle,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontSize: 11,
                padding: '8px 16px',
                minWidth: 'auto'
              }}
              title="Customize your typing text"
            >
              📝 Custom Text
            </motion.button>

            <motion.button
              whileHover={{ scale: canStartGame ? 1.02 : 1 }}
              whileTap={{ scale: canStartGame ? 0.98 : 1 }}
              onClick={onStartGame}
              disabled={!canStartGame}
              style={{
                ...modernButtonStyle,
                background: canStartGame 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#9ca3af',
                cursor: canStartGame ? 'pointer' : 'not-allowed',
                opacity: canStartGame ? 1 : 0.6,
                fontSize: 11,
                padding: '8px 16px',
                minWidth: 'auto'
              }}
              title="Start with auto-generated text"
            >
              🚀 Quick Start
            </motion.button>
          </div>

          {!canStartGame && (
            <div style={{
              position: 'absolute',
              bottom: '-24px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: '#ef4444',
              whiteSpace: 'nowrap',
              fontWeight: 500
            }}>
              {connectionStatus !== 'connected' 
                ? 'Connecting...'
                : players.length < 2 && !playAlone 
                  ? 'Need 2+ players or Practice Mode'
                  : 'Cannot start'
              }
            </div>
          )}
        </div>
      ) : (
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '12px 20px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 12,
          color: '#4f46e5'
        }}>
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            margin: 0
          }}>
            ⏳ Waiting for host to start the game...
          </p>
        </div>
      )}

      {/* Spacer for balance */}
      <div style={{ minWidth: 80 }} />
    </div>
  );
};
