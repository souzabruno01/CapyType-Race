import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { generateRoomName } from '../utils/roomUtils';
import { CAPYBARA_AVATARS } from '../utils/avatars';
import { capyTitleStyle } from '../utils/styles';
import { preloadGameAssets } from '../utils/assetPreloader';

// Components
import { RoomInfo } from '../components/lobby/RoomInfo';
import { PlayerGrid } from '../components/lobby/PlayerGrid';
import { LobbyActions } from '../components/lobby/LobbyActions';
import { TextGenerationModal } from '../components/lobby/TextGenerationModal';
import { ConfirmationModal } from '../components/lobby/ConfirmationModal';
import { Notification } from '../components/lobby/Notification';

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
    generateRandomText
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
    if (socket) {
      const matchingAvatar = CAPYBARA_AVATARS.find(avatar => avatar.color === newColor);
      
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
    if (customText.trim()) {
      useGameStore.getState().startGame(customText.trim());
      setShowTextModal(false);
      setCustomText('');
    }
  };

  const handleStartQuickRace = () => {
    useGameStore.getState().startGame('');
  };

  if (!roomId) {
    return null; // Will redirect via useSessionPersistence
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ebe4c8 0%, #d4c8a8 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={capyTitleStyle}>
          🏁 CapyType Race
        </h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16
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
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
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

      {/* Players Grid */}
      <PlayerGrid
        players={players}
        currentPlayerId={currentPlayerId}
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
        onStartGame={handleStartQuickRace}
        onBackToLogin={handleBackToLogin}
        connectionStatus={connectionStatus}
      />

      {/* Modals */}
      <AnimatePresence>
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
