import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed unused Button import
import { useGameStore } from '../store/gameStore';
import { generateRoomName } from '../utils/roomUtils';
// Removed unused Player import
import { getAvatarByFile, CAPYBARA_AVATARS } from '../utils/avatars';

// Asset preloading for performance optimization (Step 1.2)
const preloadGameAssets = () => {
  // Preload background image for game page
  const gameBackground = new Image();
  gameBackground.src = '/images/capybara_background_multiple.png';
  
  // Preload all capybara avatars
  CAPYBARA_AVATARS.forEach(avatar => {
    const img = new Image();
    img.src = `/images/${avatar.file}`;
  });
  
  // Preload progress bar icon
  const progressIcon = new Image();
  progressIcon.src = '/images/Capy-progress-bar-icon.svg';
  
  // Preload any other game-specific assets
  const viteIcon = new Image();
  viteIcon.src = '/vite.svg';
};

// Style for modern, rounded, black buttons
const modernButtonStyle = {
  background: '#232323',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '12px 28px',
  fontWeight: 700,
  fontSize: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  cursor: 'pointer',
  transition: 'background 0.2s',
  margin: '8px 0',
  letterSpacing: '0.5px',
};

// Modern, rounded, light black checkbox style
const modernCheckboxStyle = {
  width: 20,
  height: 20,
  accentColor: '#232323', // light black
  borderRadius: 6,
  border: '2px solid #232323',
  background: '#fff',
  marginRight: 8,
  verticalAlign: 'middle',
};

// CapyType Race title style
const capyTitleStyle = {
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#232323', // light black
  marginBottom: 8,
  letterSpacing: '1.2px',
  textAlign: 'center' as const,
  fontFamily: 'inherit',
  textShadow: '0 1px 4px #fff8',
};

export default function Lobby() {
  const navigate = useNavigate();
  const { roomId, players, isAdmin, gameState, startGame } = useGameStore();
  const [playAlone, setPlayAlone] = useState(false);
  const [roomName, setRoomName] = useState({ readableId: '', fullId: '' });
  const [showFullId, setShowFullId] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Get actual capybara colors from avatars
  const capyColors = CAPYBARA_AVATARS.map(avatar => avatar.color);

  const handleColorChange = (newColor: string, playerId: string) => {
    const socket = useGameStore.getState().socket;
    if (socket) {
      // Find the matching avatar file for this color
      const matchingAvatar = CAPYBARA_AVATARS.find(avatar => avatar.color === newColor);
      
      // If this is the current player, update session storage
      if (socket.id === playerId) {
        sessionStorage.setItem('capy_avatar_color', newColor);
        if (matchingAvatar) {
          sessionStorage.setItem('capy_avatar_file', matchingAvatar.file);
        }
      }
      
      socket.emit('changePlayerColor', { 
        playerId, 
        color: newColor, 
        avatar: matchingAvatar ? matchingAvatar.file : undefined 
      });
      setShowColorPicker(null);
      setNotificationMessage('Color updated!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  useEffect(() => {
    if (!roomId) {
      navigate('/');
    } else {
      setRoomName(generateRoomName(roomId));
      // Preload game assets while in lobby for performance optimization
      preloadGameAssets();
    }
  }, [roomId, navigate]);

  useEffect(() => {
    if (gameState === 'playing') {
      navigate('/game');
    }
  }, [gameState, navigate]);

  useEffect(() => {
    // Warn before leaving if in a room
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomId) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? You will be disconnected from the room.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId]);

  useEffect(() => {
    // Check for room closure notification
    const closureReason = sessionStorage.getItem('roomClosureReason');
    if (closureReason) {
      sessionStorage.removeItem('roomClosureReason');
      // Show notification and redirect
      alert(closureReason);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Close color picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker && !(event.target as Element).closest('[data-color-picker]')) {
        setShowColorPicker(null);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);



  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackToLogin = () => {
    // If host and alone in room, close room directly without confirmation
    if (isAdmin && players.length <= 1) {
      const socket = useGameStore.getState().socket;
      if (socket) {
        socket.emit('leaveRoom');
        socket.disconnect();
      }
      useGameStore.getState().resetGame();
      
      // Show notification briefly
      setNotificationMessage('Room closed');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
      
      navigate('/login');
    } else {
      // Show confirmation modal for other cases
      setShowLeaveConfirmation(true);
    }
  };

  const confirmLeave = () => {
    const socket = useGameStore.getState().socket;
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    useGameStore.getState().resetGame();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url(/images/capybara_background_multiple.png) no-repeat center center fixed', backgroundSize: 'cover' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: 600, // Increased from 500 to 600
        padding: 32, 
        background: 'rgba(235, 228, 200, 0.64)', 
        borderRadius: 16, 
        boxShadow: '0 4px 32px rgba(0,0,0,0.15)', 
        backdropFilter: 'blur(4px)', 
        border: '1.5px solid #b6a77a', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 24,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>        <button onClick={handleBackToLogin} style={{ ...modernButtonStyle, alignSelf: 'flex-start', marginBottom: 8, padding: '6px 12px', fontSize: 13 }}>
          ← Back to Login
        </button>
        <div style={{ textAlign: 'center', width: '100%' }}>
          {isAdmin && (
            <div style={{
              background: 'rgba(79, 70, 229, 0.1)',
              color: '#4f46e5',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 8,
              border: '1px solid rgba(79, 70, 229, 0.2)',
              display: 'inline-block'
            }}>
              👑 Host
            </div>
          )}
          <h2 style={{ ...capyTitleStyle, marginBottom: 4 }}>{roomName.readableId}</h2>
          <p style={{ color: '#4b5563', marginBottom: 12 }}>Waiting for players to join...</p>
        </div>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', margin: '0 0 8px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb', borderRadius: 1 }} />
          <span style={{ 
            background: 'rgba(220, 210, 170, 0.98)', 
            color: '#374151', 
            padding: '0 12px', 
            borderRadius: 6, 
            display: 'inline-block', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', 
            border: '1px solid #b6a77a',
            fontWeight: 500,
            margin: '0 8px'
          }}>
            Room Info
          </span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb', borderRadius: 1 }} />
        </div>
        <div style={{ width: '100%', marginBottom: 8 }}>
          <button
            onClick={() => setShowFullId(!showFullId)}
            style={{ ...modernButtonStyle, fontSize: 13, background: '#fff', color: '#232323', border: '1.5px solid #b6a77a', borderRadius: 6, margin: 0, padding: '4px 12px', fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {showFullId ? 'Hide ID' : 'Show ID'} ▾
          </button>
          {showFullId && (
            <div style={{ position: 'relative', marginTop: 4 }}>
              <p style={{ fontSize: 13, color: '#6b7280', background: 'rgba(255,255,255,0.85)', padding: 8, borderRadius: 6, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 0, border: '1px solid #d1d5db' }}>{roomName.fullId}</p>
              <button
                onClick={handleCopyRoomId}
                style={{ ...modernButtonStyle, position: 'absolute', right: 8, top: 8, fontSize: 12, background: '#fff', color: '#232323', border: '1px solid #b6a77a', borderRadius: 4, margin: 0, padding: '2px 8px', fontWeight: 500 }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Players ({Array.isArray(players) ? players.length : 0}/32):
          </h2>
          
          {/* Warm brown board style player grid */}
          <div style={{
            background: 'rgba(139, 117, 96, 0.3)', // warm brown with 30% transparency
            borderRadius: 12,
            padding: 20, // Increased from 16 to 20
            border: '2px solid rgba(139, 117, 96, 0.4)',
            boxShadow: '0 2px 8px rgba(139, 117, 96, 0.15)',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 // Increased from 8 to 12
          }}>
            {Array.isArray(players) && players.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: (() => {
                  const playerCount = players.length;
                  // More conservative sizing to prevent overlap
                  if (playerCount <= 4) return 'repeat(auto-fit, minmax(130px, 1fr))';
                  if (playerCount <= 8) return 'repeat(auto-fit, minmax(110px, 1fr))';
                  if (playerCount <= 12) return 'repeat(auto-fit, minmax(95px, 1fr))';
                  if (playerCount <= 16) return 'repeat(auto-fit, minmax(80px, 1fr))';
                  if (playerCount <= 20) return 'repeat(auto-fit, minmax(75px, 1fr))';
                  if (playerCount <= 24) return 'repeat(auto-fit, minmax(70px, 1fr))';
                  return 'repeat(auto-fit, minmax(65px, 1fr))'; // For 25+ players
                })(),
                gap: (() => {
                  const playerCount = players.length;
                  // Increased gaps to prevent border overlap
                  if (playerCount <= 8) return 16;
                  if (playerCount <= 16) return 14;
                  if (playerCount <= 24) return 12;
                  return 10; // For 25+ players
                })(),
                justifyItems: 'center',
                maxWidth: '100%',
                alignItems: 'start' // Align items to start to prevent stretching
              }}>
                {players.map((player) => {
                  if (!player || typeof player !== 'object') return null;
                  const avatar = getAvatarByFile(player.avatar || '');
                  const playerColor = player.color || avatar.color || '#b6a77a';
                  const currentPlayer = useGameStore.getState().socket?.id === player.id;
                  const playerCount = players.length;
                  
                  // More conservative sizing to prevent overlap
                  const getAdaptiveSize = () => {
                    if (playerCount <= 4) return { minWidth: 125, maxWidth: 145, avatarSize: 50, fontSize: 13 };
                    if (playerCount <= 8) return { minWidth: 105, maxWidth: 125, avatarSize: 45, fontSize: 12 };
                    if (playerCount <= 12) return { minWidth: 90, maxWidth: 110, avatarSize: 40, fontSize: 11 };
                    if (playerCount <= 16) return { minWidth: 75, maxWidth: 90, avatarSize: 36, fontSize: 10 };
                    if (playerCount <= 20) return { minWidth: 70, maxWidth: 85, avatarSize: 32, fontSize: 9 };
                    if (playerCount <= 24) return { minWidth: 65, maxWidth: 80, avatarSize: 28, fontSize: 8 };
                    return { minWidth: 60, maxWidth: 75, avatarSize: 24, fontSize: 8 }; // For 25+ players
                  };
                  
                  const sizes = getAdaptiveSize();
                  
                  return (
                    <div key={player.id || player.nickname} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: playerCount > 16 ? 6 : 8,
                      borderRadius: 10,
                      background: player.progress > 0 
                        ? `linear-gradient(135deg, ${playerColor}60, rgba(79, 70, 229, 0.2))` 
                        : `${playerColor}50`,
                      border: `${playerCount > 16 ? '1px' : '2px'} solid ${playerColor}80`, // Thinner border for many players
                      minWidth: sizes.minWidth,
                      maxWidth: sizes.maxWidth,
                      width: '100%', // Ensure cards fill their grid space properly
                      transition: 'all 0.2s ease',
                      boxShadow: `0 2px 6px ${playerColor}30`,
                      position: 'relative',
                      boxSizing: 'border-box' // Include border in width calculation
                    }}>
                      {/* Edit Color Button - only for current player */}
                      {currentPlayer && (
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === player.id ? null : player.id)}
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 8,
                            padding: 0,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            zIndex: 10
                          }}
                          title="Edit Color"
                        >
                          ✏️
                        </button>
                      )}

                      {/* Color Picker Dropdown */}
                      {showColorPicker === player.id && (
                        <div 
                          data-color-picker
                          style={{
                            position: 'absolute',
                            top: 22,
                            right: 2,
                            background: '#fff',
                            borderRadius: 8,
                            padding: 10, // Increased padding
                            border: '2px solid #e5e7eb',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 20,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)', // Changed to 5 columns for 10 colors
                            gap: 6, // Increased gap
                            width: 140 // Increased width to accommodate 5 columns
                          }}
                        >
                          {capyColors.map((color, index) => {
                            const avatar = CAPYBARA_AVATARS[index];
                            return (
                              <button
                                key={index}
                                onClick={() => handleColorChange(color, player.id)}
                                style={{
                                  width: 22, // Increased from 20 to 22
                                  height: 22, // Increased from 20 to 22
                                  borderRadius: '50%',
                                  background: color,
                                  border: playerColor === color ? '3px solid #000' : '2px solid #d1d5db',
                                  cursor: 'pointer',
                                  padding: 0,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                  transition: 'all 0.2s ease'
                                }}
                                title={`Change to ${avatar?.name || color}`}
                              />
                            );
                          })}
                        </div>
                      )}
                      {/* Avatar */}
                      {player.avatar ? (
                        <div style={{ 
                          width: sizes.avatarSize, 
                          height: sizes.avatarSize, 
                          borderRadius: '50%', 
                          overflow: 'hidden', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: `${playerColor}50`, // Increased opacity from 30 to 50
                          border: `2px solid ${playerColor}90`, // Increased border opacity from 80 to 90
                          boxShadow: `0 2px 4px ${playerColor}40` // Increased shadow opacity from 30 to 40
                        }}>
                          <img 
                            src={`/images/${player.avatar}`} 
                            alt="avatar" 
                            style={{ 
                              width: sizes.avatarSize - 4, 
                              height: sizes.avatarSize - 4, 
                              objectFit: 'cover', 
                              borderRadius: '50%' 
                            }} 
                            onError={e => (e.currentTarget.style.opacity = '0.3')} 
                          />
                        </div>
                      ) : (
                        <div style={{ 
                          width: sizes.avatarSize, 
                          height: sizes.avatarSize, 
                          background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}80 100%)`, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff', 
                          fontWeight: 700, 
                          fontSize: Math.max(sizes.fontSize, 8), // Ensure minimum readable size
                          border: `2px solid ${playerColor}`,
                          boxShadow: `0 2px 4px ${playerColor}40`
                        }}>
                          {typeof player.nickname === "string" ? player.nickname.substring(0, 2).toUpperCase() : ""}
                        </div>
                      )}
                      
                      {/* Player name */}
                      <span style={{ 
                        fontWeight: 700, // Made bold
                        color: '#374151', 
                        fontSize: sizes.fontSize, 
                        textAlign: 'center',
                        lineHeight: '1.2',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textShadow: '0 1px 2px rgba(255,255,255,0.8)' // Added text shadow for readability
                      }}>
                        {typeof player.nickname === 'string' ? player.nickname : ''}
                      </span>
                      
                      {/* Progress indicator */}
                      {player.progress > 0 && (
                        <div style={{ 
                          fontSize: 9, 
                          color: '#fff', 
                          fontWeight: 700,
                          background: `${playerColor}90`, // Use player's color for progress
                          padding: '2px 6px',
                          borderRadius: 6,
                          textAlign: 'center',
                          boxShadow: `0 1px 3px ${playerColor}40`,
                          border: `1px solid ${playerColor}`
                        }}>
                          {Math.round(player.progress)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                color: '#9ca3af',
                fontSize: 14,
                fontStyle: 'italic'
              }}>
                Waiting for players to join...
              </div>
            )}
          </div>
        </div>
        {isAdmin && (
          <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="playAlone"
                checked={playAlone}
                onChange={(e) => setPlayAlone(e.target.checked)}
                style={modernCheckboxStyle}
              />
              <label htmlFor="playAlone" style={{ fontSize: 13, color: '#374151' }}>
                Practice mode (start without waiting)
              </label>
            </div>
            <button 
              disabled={!playAlone && players.length < 2} 
              style={{ ...modernButtonStyle, width: '100%', marginBottom: 0 }}
              onClick={() => {
                if (playAlone) {
                  // Practice mode: use a default text or prompt for one
                  startGame('Practice mode text', true);
                } else {
                  // Multiplayer: use a default or server-provided text
                  startGame('');
                }
              }}
            >
              Start Game
            </button>
            {!playAlone && players.length < 2 && (
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', margin: 0 }}>
                Waiting for more players to join...
              </p>
            )}
          </div>
        )}
        {!isAdmin && (
          <div style={{ width: '100%', textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 8 }}>
            Waiting for the host to start the game...
          </div>
        )}
      </div>
      
      {/* Leave Confirmation Dialog */}
      {showLeaveConfirmation && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ 
            background: 'rgba(235, 228, 200, 0.98)', 
            borderRadius: 16, 
            padding: 24, 
            maxWidth: 260, 
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', 
            border: '1.5px solid #b6a77a',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#232323', 
              marginBottom: 16, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8 
            }}>
              ⚠️ {isAdmin ? 'Close Room?' : 'Leave Room?'}
            </h3>
            <p style={{ 
              color: '#4b5563', 
              marginBottom: 20, 
              lineHeight: 1.5 
            }}>
              {isAdmin 
                ? 'If you leave, this room will be closed and all other players will be disconnected.'
                : 'You will be disconnected from the room and won\'t be able to rejoin with the same link.'
              }
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLeaveConfirmation(false)}
                style={{ 
                  ...modernButtonStyle, 
                  background: '#fff', 
                  color: '#232323', 
                  border: '1.5px solid #b6a77a',
                  margin: 0,
                  fontSize: 11,
                  padding: '10px 22px'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmLeave}
                style={{ 
                  ...modernButtonStyle, 
                  background: '#dc2626', 
                  margin: 0,
                  fontSize: 11,
                  padding: '10px 22px'
                }}
              >
                {isAdmin ? 'Close Room' : 'Leave Room'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Small notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: 'rgba(34, 197, 94, 0.9)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          zIndex: 1100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          ✓ {notificationMessage}
        </div>
      )}
    </div>
  );
}