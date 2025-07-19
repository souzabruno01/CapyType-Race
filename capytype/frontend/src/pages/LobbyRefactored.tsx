import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Store and utilities
import { useGameStore } from '../store/gameStore';
import { generateRoomName } from '../utils/roomUtils';
import { preloadGameAssets } from '../utils/assetPreloader';
import { capyTitleStyle } from '../utils/styles';

// Custom hooks
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useTextGeneration } from '../hooks/useTextGeneration';
import { useNotification } from '../hooks/useNotification';

// Components
import { RoomInfo } from '../components/lobby/RoomInfo';
import { PlayerGrid } from '../components/lobby/PlayerGrid';
import { LobbyActions } from '../components/lobby/LobbyActions';
import { TextGenerationModal } from '../components/lobby/TextGenerationModal';
import { ConfirmationModal } from '../components/lobby/ConfirmationModal';
import { Notification } from '../components/lobby/Notification';

import { CAPYBARA_AVATARS } from '../utils/avatars';

export default function Lobby() {
  const navigate = useNavigate();
  const { 
    roomId, 
    players, 
    isAdmin, 
    gameState, 
    startGame, 
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

  // Custom hooks
  useSessionPersistence();
  const { showNotification, notificationMessage, showNotificationWithMessage, setShowNotification, setNotificationMessage } = useNotification();
  useSocketEvents(setNotificationMessage, setShowNotification);
  
  const {
    customText,
    setCustomText,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedCategory,
    setSelectedCategory,
    generateRandomText
  } = useTextGeneration();

  // Effects for navigation and room management
  useEffect(() => {
    if (roomId) {
      setRoomName(generateRoomName(roomId));
      preloadGameAssets();
    }
  }, [roomId]);

  useEffect(() => {
    if (gameState === 'playing') {
      navigate('/game');
    }
  }, [gameState, navigate]);

  useEffect(() => {
    // Monitor for store errors and show them as notifications
    if (lastError) {
      showNotificationWithMessage(`❌ ${lastError}`, 5000);
      
      // Clear the error after showing notification
      setTimeout(() => {
        useGameStore.getState().setError(null);
      }, 5500);
    }
  }, [lastError, showNotificationWithMessage]);

  useEffect(() => {
    // Handle room closure notifications
    if (roomClosed) {
      console.log('[Lobby] Room was closed:', roomClosed);
      
      // Clear session data
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      // Show the room closure message
      alert(roomClosed.message);
      
      // Reset the game state and clear the room closed state
      useGameStore.getState().resetGame();
      clearRoomClosed();
      
      // Navigate back to login
      navigate('/');
    }
  }, [roomClosed, clearRoomClosed, navigate]);

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

  // Event handlers
  const handleColorChange = (newColor: string, playerId: string) => {
    if (socket) {
      // Find the matching avatar file for this color
      const matchingAvatar = CAPYBARA_AVATARS.find((avatar: any) => avatar.color === newColor);
      
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
      showNotificationWithMessage('Color updated!', 2000);
    }
  };

  const handleBackToLogin = () => {
    // If host and alone in room, close room directly without confirmation
    if (isAdmin && players.length <= 1) {
      if (socket) {
        socket.emit('leaveRoom');
        socket.disconnect();
      }
      
      // Clear session data when leaving
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      useGameStore.getState().resetGame();
      
      // Show notification briefly
      showNotificationWithMessage('Room closed', 2000);
      
      navigate('/login');
    } else {
      // Show confirmation modal for other cases
      setShowLeaveConfirmation(true);
    }
  };

  const confirmLeave = () => {
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    
    // Clear session data when leaving
    sessionStorage.removeItem('capy_room_id');
    sessionStorage.removeItem('capy_nickname');
    sessionStorage.removeItem('capy_is_admin');
    
    useGameStore.getState().resetGame();
    navigate('/login');
  };

  const handleGenerateRandom = async () => {
    const result = await generateRandomText();
    showNotificationWithMessage(result.message, result.success ? 3000 : 2000);
  };

  const handleStartWithCustomText = () => {
    if (customText.trim()) {
      startGame(customText.trim());
      setShowTextModal(false);
    }
  };

  const handleQuickStart = () => {
    // Start with a simple default text for quick games
    const quickTexts = [
      "The quick brown fox jumps over the lazy dog.",
      "Capybaras are known for their calm and friendly nature.",
      "Typing speed improves with practice and patience.",
      "Modern technology has revolutionized communication.",
      "The art of coding requires logic, creativity, and persistence."
    ];
    const randomText = quickTexts[Math.floor(Math.random() * quickTexts.length)];
    startGame(randomText, playAlone);
  };

  if (!roomId) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #f0f8ff 100%)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20
      }}>
        {/* Header */}
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
          
          {/* Connection Status Indicator - Only for admins */}
          {isAdmin && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              marginBottom: 12,
              padding: '4px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: connectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: connectionStatus === 'connected' ? '#059669' : '#dc2626',
              border: `1px solid ${connectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: connectionStatus === 'connected' ? '#10b981' : '#ef4444'
              }} />
              {connectionStatus === 'connected' ? 'Server Connected' : 'Connection Issues'}
            </div>
          )}
        </div>

        {/* Room Info */}
        <RoomInfo
          roomId={roomId}
          roomName={roomName}
          showFullId={showFullId}
          setShowFullId={setShowFullId}
          copied={copied}
          setCopied={setCopied}
        />

        {/* Player Grid */}
        <PlayerGrid
          players={players}
          currentPlayerId={socket?.id || ''}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          onColorChange={handleColorChange}
        />

        {/* Lobby Actions */}
        <LobbyActions
          isAdmin={isAdmin}
          players={players}
          playAlone={playAlone}
          setPlayAlone={setPlayAlone}
          onShowTextModal={() => setShowTextModal(true)}
          onStartGame={handleQuickStart}
          onBackToLogin={handleBackToLogin}
          connectionStatus={connectionStatus}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        <TextGenerationModal
          isOpen={showTextModal}
          onClose={() => setShowTextModal(false)}
          customText={customText}
          setCustomText={setCustomText}
          onGenerateRandom={handleGenerateRandom}
          onStartGame={handleStartWithCustomText}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <ConfirmationModal
          isOpen={showLeaveConfirmation}
          onClose={() => setShowLeaveConfirmation(false)}
          onConfirm={confirmLeave}
          title={isAdmin ? 'Close Room?' : 'Leave Room?'}
          message={isAdmin 
            ? 'If you leave, this room will be closed and all other players will be disconnected.'
            : 'You will be disconnected from the room and won\'t be able to rejoin with the same link.'
          }
          confirmText={isAdmin ? 'Close Room' : 'Leave Room'}
          isDestructive={true}
        />
      </AnimatePresence>

      {/* Notification */}
      <Notification show={showNotification} message={notificationMessage} />
    </div>
  );
}
