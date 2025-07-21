import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { generateRoomName } from '../utils/roomUtils';
import { CAPYBARA_AVATARS } from '../utils/avatars';
import { capyTitleStyle } from '../utils/styles';
import { preloadGameAssets } from '../utils/assetPreloader';

// Component imports
import { RoomInfo } from '../components/lobby/RoomInfo';
import { PlayerGrid } from '../components/lobby/PlayerGrid';
import { LobbyActions } from '../components/lobby/LobbyActions';
import { TextGenerationModal } from '../components/lobby/TextGenerationModal';
import { ConfirmationModal } from '../components/lobby/ConfirmationModal';
import { Notification } from '../components/lobby/Notification';
import { GameInfoModal } from '../components/lobby/GameInfoModal';

// Hooks
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useTextGeneration } from '../hooks/useTextGeneration';
import { useNotification } from '../hooks/useNotification';

export default function Lobby() {
  const navigate = useNavigate();
  const { 
    roomId, 
    players, 
    isAdmin, 
    gameState, 
    connectionStatus, 
    lastError, 
    roomClosed, 
    clearRoomClosed,
    socket 
  } = useGameStore();

  // Local state
  const [playAlone, setPlayAlone] = useState(false);
  const [roomName, setRoomName] = useState({ readableId: '', fullId: '' });
  const [showFullId, setShowFullId] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Custom hooks
  useSessionPersistence();
  const { showNotification, notificationMessage, setNotificationMessage, setShowNotification } = useNotification();
  useSocketEvents(setNotificationMessage, setShowNotification);
  const {
    customText,
    setCustomText,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedCategory,
    setSelectedCategory,
    generateRandomText,
    generateQuickStartText
  } = useTextGeneration();

  // Get current player ID from socket
  const currentPlayerId = socket?.id || '';

  // Effects
  useEffect(() => {
    if (roomId) {
      setRoomName(generateRoomName(roomId));
      preloadGameAssets();
    }
  }, [roomId]);

  useEffect(() => {
    if (lastError) {
      setNotificationMessage(`❌ ${lastError}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      
      setTimeout(() => {
        useGameStore.getState().setError(null);
      }, 5500);
    }
  }, [lastError, setNotificationMessage, setShowNotification]);

  useEffect(() => {
    if (roomClosed) {
      console.log('[Lobby] Room was closed:', roomClosed);
      
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      alert(roomClosed.message);
      
      useGameStore.getState().resetGame();
      clearRoomClosed();
      
      navigate('/');
    }
  }, [roomClosed, clearRoomClosed, navigate]);

  useEffect(() => {
    if (gameState === 'playing') {
      navigate('/game');
    }
  }, [gameState, navigate]);

  useEffect(() => {
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

  // Handlers
  const handleColorChange = (newColor: string, playerId: string) => {
    console.log('[Lobby] Color change requested:', { newColor, playerId, socketId: socket?.id, socketConnected: !!socket?.connected });
    
    if (socket && socket.connected) {
      const matchingAvatar = CAPYBARA_AVATARS.find(avatar => avatar.color === newColor);
      console.log('[Lobby] Found matching avatar:', matchingAvatar);
      
      if (socket.id === playerId) {
        sessionStorage.setItem('capy_avatar_color', newColor);
        if (matchingAvatar) {
          sessionStorage.setItem('capy_avatar_file', matchingAvatar.file);
        }
        console.log('[Lobby] Updated sessionStorage for current player');
      }
      
      console.log('[Lobby] Emitting changePlayerColor event with data:', { 
        playerId, 
        color: newColor, 
        avatar: matchingAvatar ? matchingAvatar.file : undefined 
      });
      
      socket.emit('changePlayerColor', { 
        playerId, 
        color: newColor, 
        avatar: matchingAvatar ? matchingAvatar.file : undefined 
      });
      
      // Add a timeout to check if we received the response
      setTimeout(() => {
        console.log('[Lobby] Checking if color change was applied after 2 seconds...');
        const currentPlayer = players.find(p => p.id === playerId);
        if (currentPlayer) {
          console.log('[Lobby] Current player color after change attempt:', currentPlayer.color, 'Expected:', newColor);
        }
      }, 2000);
      
      setShowColorPicker(null);
      setNotificationMessage('Color updated!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } else {
      console.error('[Lobby] Socket not connected! Cannot change color.', { socket: !!socket, connected: socket?.connected });
      setNotificationMessage('❌ Connection error - cannot change color');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleBackToLogin = () => {
    if (isAdmin && players.length <= 1) {
      if (socket) {
        socket.emit('leaveRoom');
        socket.disconnect();
      }
      
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      useGameStore.getState().resetGame();
      
      setNotificationMessage('Room closed');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
      
      navigate('/login');
    } else {
      setShowLeaveConfirmation(true);
    }
  };

  const confirmLeave = () => {
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    
    sessionStorage.removeItem('capy_room_id');
    sessionStorage.removeItem('capy_nickname');
    sessionStorage.removeItem('capy_is_admin');
    
    useGameStore.getState().resetGame();
    navigate('/login');
  };

  const handleStartWithCustomText = () => {
    console.log('[Lobby] handleStartWithCustomText called with text length:', customText.trim().length);
    
    if (!customText.trim()) {
      setNotificationMessage('❌ Please enter some text before starting the race');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
    
    const textLength = customText.trim().length;
    if (textLength < 10) {
      setNotificationMessage(`❌ Text too short (${textLength} chars). Minimum 10 characters required.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      return;
    }
    
    if (textLength > 2000) {
      setNotificationMessage(`❌ Text too long (${textLength} chars). Maximum 2000 characters allowed.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      return;
    }
    
    // Check if we have a valid roomId for multiplayer mode
    if (!playAlone && !roomId) {
      setNotificationMessage('❌ No room found. Please rejoin the room.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      return;
    }
    
    console.log('[Lobby] Starting game with custom text, practice mode:', playAlone, 'roomId:', roomId);
    // Pass the playAlone flag to determine if this is practice mode
    useGameStore.getState().startGame(customText.trim(), playAlone);
    setShowTextModal(false);
    setCustomText('');
  };

  const handleStartQuickRace = async () => {
    console.log('[Lobby] handleStartQuickRace called');
    try {
      // Generate diverse quick start text optimized for 30-60 second races
      const result = await generateQuickStartText();
      if (result.success && customText.trim()) {
        console.log('[Lobby] Using generated QuickStart text for race, length:', customText.trim().length);
        // Use the generated QuickStart text
        useGameStore.getState().startGame(customText.trim(), playAlone);
      } else {
        console.log('[Lobby] QuickStart generation failed, using fallback');
        // Fallback: Use a simple default text if generation fails
        const defaultText = "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once, making it perfect for typing practice and testing keyboard layouts.";
        useGameStore.getState().startGame(defaultText, playAlone);
      }
    } catch (error) {
      console.error('[Lobby] Quick start failed:', error);
      // Use fallback text in case of any error
      const defaultText = "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once, making it perfect for typing practice and testing keyboard layouts.";
      useGameStore.getState().startGame(defaultText, playAlone);
    }
  };

  if (!roomId) {
    return null; // Will redirect via useSessionPersistence
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'url(/images/capybara_background_multiple.png) no-repeat center center fixed',
      backgroundSize: 'cover',
      position: 'relative'
    }}>
      {/* Matte transparent overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        zIndex: 0
      }} />
      
      {/* Main content modal */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '65vw',  // Increased slightly for better spacing (59vw → 65vw)
        height: '62vh', // Increased slightly for better spacing (59vh → 62vh)
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden' // Prevent main modal scroll
      }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 12,
        width: '100%',
        flexShrink: 0
      }}>
        <h1 style={{...capyTitleStyle, fontSize: '1.8rem', marginBottom: 8}}>
          🏁 CapyType Race
        </h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 4
        }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: connectionStatus === 'connected' ? '#10b981' : 
                         connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444'
            }}
          />
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
      </div>

      {/* Room Info Section */}
      <div style={{ 
        marginBottom: 12,
        width: '100%',
        flexShrink: 0
      }}>
        <RoomInfo
          roomId={roomId}
          roomName={roomName}
          showFullId={showFullId}
          setShowFullId={setShowFullId}
          copied={copied}
          setCopied={setCopied}
        />
      </div>

      {/* Players Grid - Takes most of the space */}
      <div style={{ 
        flex: 1, 
        width: '100%', 
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '16px', // Increased padding for better containment
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden', // Prevent cutoff spillover
        marginBottom: 12
      }}>
        <PlayerGrid
          players={players}
          currentPlayerId={currentPlayerId}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          onColorChange={handleColorChange}
        />
      </div>

      {/* Lobby Actions - Compact bottom section */}
      <div style={{ 
        flexShrink: 0, 
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16
      }}>
        <LobbyActions
          isAdmin={isAdmin}
          players={players}
          playAlone={playAlone}
          setPlayAlone={setPlayAlone}
          onShowTextModal={() => setShowTextModal(true)}
          onStartGame={handleStartQuickRace}
          onBackToLogin={handleBackToLogin}
          connectionStatus={connectionStatus}
        />
      </div>

      {/* Info Button - Fixed positioning for better Windows compatibility */}
      <button
        onClick={() => setShowInfoModal(true)}
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#fff',
          zIndex: 10,
          transition: 'all 0.2s ease',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        }}
        title="Game Rules"
      >
        ℹ️
      </button>

      </div>

      {/* Modals - Moved outside main container to prevent clipping */}
      <AnimatePresence>
        {showInfoModal && (
          <GameInfoModal
            isOpen={showInfoModal}
            onClose={() => setShowInfoModal(false)}
          />
        )}

        {showTextModal && (
          <TextGenerationModal
            isOpen={showTextModal}
            onClose={() => setShowTextModal(false)}
            customText={customText}
            setCustomText={setCustomText}
            onGenerateRandom={generateRandomText}
            onStartGame={handleStartWithCustomText}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {showLeaveConfirmation && (
          <ConfirmationModal
            isOpen={showLeaveConfirmation}
            onClose={() => setShowLeaveConfirmation(false)}
            onConfirm={confirmLeave}
            title={isAdmin ? 'Close Room?' : 'Leave Room?'}
            message={
              isAdmin 
                ? 'If you leave, this room will be closed and all other players will be disconnected.'
                : 'You will be disconnected from the room and won\'t be able to rejoin with the same link.'
            }
            confirmText={isAdmin ? 'Close Room' : 'Leave Room'}
            isDestructive={true}
          />
        )}
      </AnimatePresence>

      {/* Notification */}
      <Notification
        show={showNotification}
        message={notificationMessage}
      />
    </div>
  );
}
