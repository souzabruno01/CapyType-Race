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
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      width: '100%',
      maxWidth: 400,
      margin: '0 auto',
      textAlign: 'center'
    }}>
      {isAdmin ? (
        <>
          {/* Practice Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 12px',
            width: '100%'
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
                fontSize: 13,
                fontWeight: 500,
                color: '#2d3748',
                cursor: 'pointer',
                userSelect: 'none',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              Practice Mode (Play Alone)
            </label>
          </div>

          {/* Admin Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            alignItems: 'center'
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShowTextModal}
              style={{
                ...modernButtonStyle,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 20px'
              }}
              title="Customize your typing text with category selection and difficulty options"
            >
              📝 Custom Text & Start Race
            </motion.button>
            <p style={{
              fontSize: 11,
              color: '#2d3748',
              margin: '-8px 0 4px 0',
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}>
              Create or generate your own typing text
            </p>

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
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 20px'
              }}
              title="Start instantly with randomly generated typing text"
            >
              🚀 Quick Start Race
            </motion.button>
            <p style={{
              fontSize: 11,
              color: '#2d3748',
              margin: '-8px 0 8px 0',
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}>
              Start immediately with auto-generated text
            </p>
          </div>

          {!canStartGame && (
            <div style={{
              textAlign: 'center',
              width: '100%'
            }}>
              <p style={{
                fontSize: 12,
                color: '#ef4444',
                textAlign: 'center',
                margin: 0,
                fontWeight: 500
              }}>
                {connectionStatus !== 'connected' 
                  ? 'Waiting for connection...'
                  : players.length < 2 && !playAlone 
                    ? 'Need at least 2 players or enable Practice Mode'
                    : 'Cannot start game'
                }
              </p>
            </div>
          )}
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 16,
          color: '#4f46e5',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 8,
            textAlign: 'center'
          }}>
            ⏳ Waiting for the host to start the game...
          </p>
          <p style={{
            fontSize: 12,
            margin: 0,
            opacity: 0.8,
            textAlign: 'center'
          }}>
            The host will set up the race text and start the game
          </p>
        </div>
      )}

      {/* Back to Login Button */}
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
          marginTop: 8,
          alignSelf: 'center'
        }}
      >
        ← Back to Login
      </motion.button>
    </div>
  );
};
