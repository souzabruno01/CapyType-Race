import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Removed unused Button import
import { useGameStore } from '../store/gameStore';
import { generateRoomName } from '../utils/roomUtils';
// Removed unused Player import
import { getAvatarByFile, CAPYBARA_AVATARS } from '../utils/avatars';
import { getTextByDifficulty, getRandomText } from '../utils/textGeneration';

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

// Modern, rounded checkbox style that matches the UI
const modernCheckboxStyle = {
  width: 18,
  height: 18,
  accentColor: '#b6a77a', // warm brown to match the UI theme
  borderRadius: 4,
  border: '1.5px solid #b6a77a',
  background: '#fff',
  marginRight: 8,
  verticalAlign: 'middle',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
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

// Text Generation Modal Component for Host
const TextGenerationModal = ({ 
  isOpen, 
  onClose, 
  customText, 
  setCustomText, 
  characterLimit, 
  setCharacterLimit, 
  onGenerateRandom,
  onGenerateWithChatGPT,
  generatingText, 
  onStartGame,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedCategory,
  setSelectedCategory
}: {
  isOpen: boolean;
  onClose: () => void;
  customText: string;
  setCustomText: (text: string) => void;
  characterLimit: number;
  setCharacterLimit: (limit: number) => void;
  onGenerateRandom: () => void;
  onGenerateWithChatGPT: () => void;
  generatingText: boolean;
  onStartGame: () => void;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  setSelectedDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  selectedCategory: 'general' | 'programming' | 'quotes';
  setSelectedCategory: (category: 'general' | 'programming' | 'quotes') => void;
}) => {
  if (!isOpen) return null;

  const characterLimits = [200, 300, 500, 750, 1000, 1250, 1500, 2000];

  return (
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
        backdropFilter: 'blur(4px)',
        padding: 16
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          maxWidth: 521, // Increased by 5% from 496
          padding: 33,
          background: 'rgba(235, 228, 200, 0.95)',
          borderRadius: 21,
          boxShadow: '0 14px 46px rgba(0,0,0,0.2)',
          border: '2px solid #b6a77a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 25,
          maxHeight: '85vh',
          overflow: 'hidden' // Prevent outer scroll
        }}
      >
        <div style={{ textAlign: 'center', width: '100%', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: -9,
              right: -9,
              width: 37,
              height: 37,
              borderRadius: '50%',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 9px rgba(0,0,0,0.15)',
              fontWeight: 700
            }}
          >
            ×
          </button>
          
          <h2 style={{
            fontSize: '1.84rem',
            fontWeight: 700,
            color: '#232323',
            marginBottom: 7,
            letterSpacing: '1.0px',
            textShadow: '0 1px 4px #fff8'
          }}>
            🏁 Generate Race Text
          </h2>
          <p style={{ color: '#4b5563', marginBottom: 15, fontSize: '16px' }}>
            Create custom text for your typing race
          </p>
        </div>

        {/* Difficulty and Category Selectors */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {/* Help Text */}
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid rgba(99, 102, 241, 0.2)', 
            borderRadius: 7, 
            padding: 12,
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: 13, 
              color: '#4f46e5', 
              margin: 0, 
              fontWeight: 500 
            }}>
              <strong>Easy:</strong> Simple words, minimal punctuation | <strong>Medium:</strong> Complex vocabulary, standard punctuation | <strong>Hard:</strong> Technical terms, special characters
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
            {/* Difficulty Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: 600, 
              color: '#374151',
              fontSize: 12,
              textAlign: 'center'
            }}>
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              style={{
                width: '100%',
                minWidth: '96px',
                maxWidth: '120px',
                padding: '9px 13px',
                border: '2px solid #b6a77a',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(182, 167, 122, 0.1)',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 11px center',
                backgroundSize: '14px',
                paddingRight: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8b7560';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(182, 167, 122, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#b6a77a';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(182, 167, 122, 0.1)';
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Category Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: 600, 
              color: '#374151',
              fontSize: 12,
              textAlign: 'center'
            }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'general' | 'programming' | 'quotes')}
              style={{
                width: '100%',
                minWidth: '96px',
                maxWidth: '120px',
                padding: '9px 13px',
                border: '2px solid #b6a77a',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(182, 167, 122, 0.1)',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 11px center',
                backgroundSize: '14px',
                paddingRight: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8b7560';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(182, 167, 122, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#b6a77a';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(182, 167, 122, 0.1)';
              }}
            >
              <option value="general">General</option>
              <option value="programming">Programming</option>
              <option value="quotes">Quotes</option>
            </select>
          </div>
        </div>
        </div>

        {/* Character Limit Selector */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 600, 
            color: '#374151',
            fontSize: 12,
            textAlign: 'center'
          }}>
            Character Limit
          </label>
          <select
            value={characterLimit}
            onChange={(e) => setCharacterLimit(Number(e.target.value))}
            style={{
              width: '50%',
              minWidth: '136px',
              maxWidth: '176px',
              padding: '9px 13px',
              border: '2px solid #b6a77a',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(182, 167, 122, 0.1)',
              transition: 'all 0.2s ease',
              marginBottom: 18,
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 11px center',
              backgroundSize: '14px',
              paddingRight: '32px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8b7560';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(182, 167, 122, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#b6a77a';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(182, 167, 122, 0.1)';
            }}
          >
            {characterLimits.map(limit => (
              <option key={limit} value={limit}>
                {limit} characters
              </option>
            ))}
          </select>
        </div>

        {/* Text Area */}
        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid rgba(99, 102, 241, 0.2)', 
            borderRadius: 8, 
            padding: 11, 
            marginBottom: 13,
            fontSize: 11,
            color: '#4f46e5',
            lineHeight: 1.4,
            flexShrink: 0
          }}>
            💡 <strong>Tip:</strong> Type a topic or keywords (like "technology", "space", "nature"), then click "AI Expand Text" to generate a complete typing text, or write your full custom text manually.
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value.substring(0, characterLimit))}
              placeholder="Enter a topic (e.g., 'artificial intelligence', 'ocean exploration', 'ancient history') or write your complete custom text here..."
              style={{
                width: '100%',
                flex: 1,
                minHeight: 112,
                maxHeight: 224,
                padding: 13,
                border: '2px solid #b6a77a',
                borderRadius: 10,
                fontSize: 12,
                fontFamily: 'inherit',
                resize: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 8px rgba(182, 167, 122, 0.1)',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                lineHeight: 1.5,
                boxSizing: 'border-box',
                wordWrap: 'break-word'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#b6a77a'}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: 8,
              fontSize: 12,
              color: '#6b7280',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>Characters: {customText.length}/{characterLimit}</span>
                {customText.length >= characterLimit && (
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>
                    Character limit reached
                  </span>
                )}
              </div>
              {customText.trim() && (
                <button
                  onClick={() => setCustomText('')}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(239, 68, 68, 0.3)';
                  }}
                  title="Clear text"
                >
                  🗑️ Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Generation Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          justifyContent: 'center',
          width: '100%',
          maxWidth: '280px',
          flexShrink: 0
        }}>
          <button
            onClick={onGenerateRandom}
            disabled={generatingText}
            style={{
              background: '#fff',
              color: '#232323',
              border: '2px solid #b6a77a',
              borderRadius: 8,
              padding: '7px 11px',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: generatingText ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: generatingText ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              minHeight: '32px'
            }}
          >
            🎲 Generate {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ({characterLimit} chars)
          </button>
          
          <button
            onClick={onGenerateWithChatGPT}
            disabled={generatingText}
            style={{
              background: generatingText ? '#9ca3af' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '7px 11px',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: generatingText ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              minHeight: '32px'
            }}
          >
            {generatingText ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.div>
                Generating...
              </>
            ) : (
              <>🤖 AI Expand Text</>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '280px',
          flexShrink: 0,
          paddingTop: 13
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#fff',
              color: '#232323',
              border: '2px solid #b6a77a',
              borderRadius: 8,
              padding: '10px 17px',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '1',
              minWidth: '112px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onStartGame}
            disabled={!customText.trim() || generatingText}
            style={{
              background: (!customText.trim() || generatingText) ? '#9ca3af' : '#232323',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 17px',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: (!customText.trim() || generatingText) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flex: '1',
              minWidth: '112px'
            }}
            onMouseEnter={(e) => {
              if (!(!customText.trim() || generatingText)) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.20)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
            }}
          >
            ✅ Start Race
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Lobby() {
  const navigate = useNavigate();
  const { roomId, players, isAdmin, gameState, startGame, connectionStatus, lastError, roomClosed, clearRoomClosed } = useGameStore();
  const [playAlone, setPlayAlone] = useState(false);
  const [roomName, setRoomName] = useState({ readableId: '', fullId: '' });
  const [showFullId, setShowFullId] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [customText, setCustomText] = useState('');
  const [generatingText, setGeneratingText] = useState(false);
  const [characterLimit, setCharacterLimit] = useState(200);
  
  // Difficulty selection states
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'programming' | 'quotes'>('general');

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
    // Try to restore session from sessionStorage on page refresh
    const storedRoomId = sessionStorage.getItem('capy_room_id');
    const storedNickname = sessionStorage.getItem('capy_nickname');
    const storedIsAdmin = sessionStorage.getItem('capy_is_admin');
    const storedAvatarColor = sessionStorage.getItem('capy_avatar_color');
    const storedAvatarFile = sessionStorage.getItem('capy_avatar_file');
    
    if (!roomId && storedRoomId && storedNickname) {
      console.log('[Lobby] Restoring session from storage:', { 
        roomId: storedRoomId, 
        nickname: storedNickname,
        isAdmin: storedIsAdmin === 'true'
      });
      
      // Restore admin status
      if (storedIsAdmin === 'true') {
        useGameStore.getState().setAdmin(true);
      }
      
      // Set the room ID immediately to prevent redirect
      useGameStore.getState().setRoomId(storedRoomId);
      
      // Rejoin the room with stored credentials
      useGameStore.getState().joinRoom(
        storedRoomId, 
        storedNickname, 
        storedAvatarFile || 'Capy-face-green.png',
        storedAvatarColor || '#6ee7b7'
      );
      return;
    }
    
    if (!roomId) {
      console.log('[Lobby] No roomId and no stored session, redirecting to login');
      navigate('/');
      return;
    }
    
    // Store session data for persistence
    sessionStorage.setItem('capy_room_id', roomId);
    if (isAdmin) {
      sessionStorage.setItem('capy_is_admin', 'true');
    }
    
    // Set room name and preload assets
    setRoomName(generateRoomName(roomId));
    
    // Preload game assets while in lobby for performance optimization
    preloadGameAssets();
    
    // Validate the room exists on the server
    const socket = useGameStore.getState().socket;
    if (!socket || !socket.connected) {
      console.log('[Lobby] Socket not connected, reconnecting...');
      useGameStore.getState().connect();
    }
  }, [roomId, navigate, isAdmin]);

  useEffect(() => {
    // Monitor for store errors and show them as notifications
    if (lastError) {
      setNotificationMessage(`❌ ${lastError}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      
      // Clear the error after showing notification
      setTimeout(() => {
        useGameStore.getState().setError(null);
      }, 5500);
    }
  }, [lastError]);

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

    // Handle browser back button and navigation
    const handlePopState = () => {
      if (roomId) {
        // Ask for confirmation before leaving
        const confirmLeave = window.confirm('Are you sure you want to leave the room? You will be disconnected.');
        if (!confirmLeave) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        } else {
          // Clear session and leave
          const socket = useGameStore.getState().socket;
          if (socket) {
            socket.emit('leaveRoom');
            socket.disconnect();
          }
          sessionStorage.removeItem('capy_room_id');
          sessionStorage.removeItem('capy_nickname');
          sessionStorage.removeItem('capy_is_admin');
          useGameStore.getState().resetGame();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
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

  useEffect(() => {
    // Handle socket events and session persistence
    const socket = useGameStore.getState().socket;
    
    const handlePlayerColorChanged = ({ playerId, color, avatar }: { playerId: string; color: string; avatar?: string }) => {
      // Find matching avatar for the color if not provided
      const matchingAvatar = avatar || CAPYBARA_AVATARS.find(av => av.color === color)?.file;
      
      // Update players in store
      useGameStore.setState((state) => ({
        players: state.players.map((player) =>
          player.id === playerId 
            ? { 
                ...player, 
                color, 
                avatar: matchingAvatar || player.avatar 
              } 
            : player
        ),
      }));
    };

    const handleRoomJoined = ({ roomId: joinedRoomId, isAdmin: joinedIsAdmin, nickname }: { roomId: string; isAdmin: boolean; nickname: string }) => {
      console.log('[Lobby] Room joined successfully:', { roomId: joinedRoomId, isAdmin: joinedIsAdmin, nickname });
      
      // Store session data for persistence
      sessionStorage.setItem('capy_room_id', joinedRoomId);
      sessionStorage.setItem('capy_nickname', nickname);
      if (joinedIsAdmin) {
        sessionStorage.setItem('capy_is_admin', 'true');
      } else {
        sessionStorage.removeItem('capy_is_admin');
      }
      
      useGameStore.setState({ roomId: joinedRoomId, isAdmin: joinedIsAdmin });
    };

    const handleRoomError = ({ message }: { message: string }) => {
      console.error('[Lobby] Room error:', message);
      // Clear invalid session data
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      // Show error and redirect
      alert(message);
      navigate('/');
    };

    if (socket) {
      socket.on('playerColorChanged', handlePlayerColorChanged);
      socket.on('roomJoined', handleRoomJoined);
      socket.on('roomError', handleRoomError);
      
      return () => {
        socket.off('playerColorChanged', handlePlayerColorChanged);
        socket.off('roomJoined', handleRoomJoined);
        socket.off('roomError', handleRoomError);
      };
    }
  }, [navigate]);



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
      
      // Clear session data when leaving
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
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
    
    // Clear session data when leaving
    sessionStorage.removeItem('capy_room_id');
    sessionStorage.removeItem('capy_nickname');
    sessionStorage.removeItem('capy_is_admin');
    
    useGameStore.getState().resetGame();
    navigate('/login');
  };

  // Smart truncation function to avoid cutting mid-word or mid-sentence
  const smartTruncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    
    // First, try to cut at sentence boundaries
    const sentences = text.split(/[.!?]+/);
    let result = '';
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;
      
      const potentialResult = result + (result ? '. ' : '') + sentence + '.';
      
      if (potentialResult.length <= maxLength) {
        result = potentialResult;
      } else {
        break;
      }
    }
    
    // If we have a good sentence-based result, use it
    if (result.length >= maxLength * 0.7) { // At least 70% of desired length
      return result;
    }
    
    // Otherwise, cut at word boundaries
    const words = text.split(' ');
    result = '';
    
    for (let i = 0; i < words.length; i++) {
      const potentialResult = result + (result ? ' ' : '') + words[i];
      
      if (potentialResult.length <= maxLength) {
        result = potentialResult;
      } else {
        break;
      }
    }
    
    // Add proper ending punctuation if missing
    if (result && !result.match(/[.!?]$/)) {
      if (result.length < maxLength - 1) {
        result += '.';
      }
    }
    
    return result || text.substring(0, maxLength); // Fallback to hard cut if all else fails
  };

  // Generate random text based on difficulty and category selection
  const generateRandomText = async () => {
    setGeneratingText(true);
    try {
      // Use our curated text generation with selected difficulty and category
      const generatedText = getTextByDifficulty({
        difficulty: selectedDifficulty,
        category: selectedCategory
      }, characterLimit);
      
      if (generatedText && generatedText.length > 20) {
        setCustomText(generatedText);
        setNotificationMessage(`✅ Generated ${selectedDifficulty.toUpperCase()} ${selectedCategory} text (${generatedText.length} chars)`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        throw new Error('Generated text is too short');
      }
    } catch (error) {
      console.error('Random text generation failed:', error);
      // Fallback to a simple random text
      const fallbackText = getRandomText();
      setCustomText(fallbackText);
      setNotificationMessage('⚠️ Using fallback text due to generation error');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } finally {
      setGeneratingText(false);
    }
  };

  // Dedicated AI text generation function that doesn't depend on component state
  const generateAIText = async (topic: string): Promise<string> => {
    if (!topic || topic.length < 2) {
      throw new Error('Please provide a topic for text generation');
    }

    let generatedText = '';
    let success = false;

    // Try multiple AI APIs for better results
    const aiProviders = [
      {
        name: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-8b-8192'
      },
      {
        name: 'Together',
        endpoint: 'https://api.together.xyz/v1/chat/completions', 
        model: 'meta-llama/Llama-2-7b-chat-hf'
      }
    ];

    // Create a proper prompt for the topic
    const prompt = `Write an informative and engaging paragraph about "${topic}". The text should be educational, factual, and interesting to read. Focus specifically on "${topic}" and provide relevant details, facts, or insights about this topic. Keep it concise and within ${characterLimit} characters. Do not include any introductory phrases like "Here's a paragraph about" or similar.`;

    // Try newer AI APIs first
    for (const provider of aiProviders) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_AI_API_KEY || 'demo-key'}`,
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert writer who creates informative, engaging paragraphs on any topic. Always focus specifically on the requested topic and provide relevant, accurate information.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: Math.min(Math.ceil(characterLimit / 3), 500),
            temperature: 0.7,
            top_p: 0.9
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            generatedText = data.choices[0].message.content.trim();
            
            if (generatedText && generatedText.length > 20) {
              success = true;
              break;
            }
          }
        }
      } catch (providerError) {
        console.log(`${provider.name} failed:`, providerError);
        continue;
      }
    }

    // Fallback to Hugging Face if modern APIs fail
    if (!success) {
      const models = ['microsoft/DialoGPT-medium', 'gpt2', 'distilgpt2'];
      
      for (const model of models) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const hfPrompt = `Write about ${topic}: `;
          
          const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: hfPrompt,
              parameters: {
                max_length: Math.min(Math.ceil(characterLimit / 2), 400),
                temperature: 0.8,
                do_sample: true,
                top_p: 0.9,
                repetition_penalty: 1.2,
                return_full_text: false
              }
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
              generatedText = data[0].generated_text;
            } else if (data.generated_text) {
              generatedText = data.generated_text;
            }

            if (generatedText && generatedText.length > 15) {
              success = true;
              break;
            }
          }
        } catch (modelError) {
          console.log(`Hugging Face model ${model} failed:`, modelError);
          continue;
        }
      }
    }

    if (!success) {
      throw new Error('All AI providers failed');
    }

    // Clean and process the generated text
    generatedText = generatedText
      .replace(/^Write about.*?:\s*/i, '')
      .replace(/^Here's.*?about.*?:\s*/i, '')
      .replace(/^.*?paragraph.*?:\s*/i, '')
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ');

    // Apply smart truncation
    generatedText = smartTruncate(generatedText, characterLimit);

    if (generatedText.length < 20) {
      throw new Error('Generated text too short after processing');
    }

    return generatedText;
  };

  // Enhanced AI text generation with better APIs and topic handling
  const generateWithChatGPT = async () => {
    setGeneratingText(true);
    
    try {
      const userTopic = customText.trim();
      const generatedText = await generateAIText(userTopic);
      setCustomText(generatedText);
      
    } catch (error) {
      console.error('Error generating text with AI:', error);
      
      // Enhanced topic-specific fallback
      const userTopic = customText.trim().toLowerCase();
      let fallbackText = generateTopicSpecificFallback(userTopic, characterLimit);
      
      setCustomText(fallbackText);
    }
    
    setGeneratingText(false);
  };

  // Generate topic-specific fallback text
  const generateTopicSpecificFallback = (topic: string, limit: number) => {
    const isShort = limit <= 150;
    const isMedium = limit > 150 && limit <= 500;
    const topicLower = topic.toLowerCase();

    // Expanded topic-specific responses that match our random topics
    if (topicLower.includes('ocean') || topicLower.includes('marine') || topicLower.includes('sea')) {
      if (isShort) {
        return smartTruncate("Ocean life encompasses a vast array of marine organisms from microscopic plankton to massive whales. The ocean supports diverse ecosystems including coral reefs, deep-sea trenches, and kelp forests, each hosting unique species adapted to their specific environments.", limit);
      } else if (isMedium) {
        return smartTruncate("Ocean life represents one of Earth's most diverse and complex ecosystems, spanning from the sunlit surface waters to the mysterious depths of oceanic trenches. Marine organisms have evolved remarkable adaptations to survive in saltwater environments, from the bioluminescent creatures of the deep sea to the colorful fish that inhabit coral reefs. The ocean food chain begins with microscopic phytoplankton and extends to apex predators like sharks and whales.", limit);
      } else {
        return smartTruncate("Ocean life encompasses an extraordinary diversity of marine organisms that have evolved over millions of years to thrive in aquatic environments covering more than 70% of Earth's surface. From the smallest single-celled phytoplankton that form the foundation of marine food webs to the largest animals on Earth like blue whales, ocean ecosystems support an incredible variety of life forms. Marine environments range from shallow coastal waters and vibrant coral reefs to the perpetually dark depths of abyssal plains where unique creatures have developed bioluminescence and other remarkable adaptations to survive extreme pressure and cold temperatures.", limit);
      }
    }

    if (topicLower.includes('space') || topicLower.includes('exploration') || topicLower.includes('astronomy')) {
      if (isShort) {
        return smartTruncate("Space exploration involves the investigation of outer space through robotic spacecraft and human missions. It has led to discoveries about planets, stars, and galaxies while advancing our understanding of the universe and developing technologies that benefit life on Earth.", limit);
      } else if (isMedium) {
        return smartTruncate("Space exploration represents humanity's quest to understand the cosmos beyond Earth's atmosphere. Through robotic missions to Mars, Jupiter, and other celestial bodies, along with telescopes that peer into distant galaxies, we have discovered exoplanets, black holes, and evidence of water on other worlds. International space agencies collaborate on missions that expand our knowledge of the universe while developing technologies for satellite communication, GPS navigation, and weather forecasting.", limit);
      } else {
        return smartTruncate("Space exploration encompasses humanity's ambitious endeavors to investigate and understand the vast cosmos beyond Earth's protective atmosphere. This scientific pursuit involves sophisticated robotic spacecraft that journey to distant planets, moons, and asteroids, as well as powerful telescopes that capture light from galaxies billions of years old. Major achievements include landing rovers on Mars to search for signs of ancient life, sending probes to study the outer planets and their moons, and discovering thousands of exoplanets orbiting distant stars. Space exploration has not only revolutionized our understanding of the universe but also led to numerous technological innovations that benefit society, including satellite communications, GPS navigation systems, weather forecasting, and medical imaging technologies.", limit);
      }
    }

    if (topicLower.includes('renewable') || topicLower.includes('energy') || topicLower.includes('solar') || topicLower.includes('wind')) {
      if (isShort) {
        return smartTruncate("Renewable energy sources like solar, wind, and hydroelectric power generate electricity without depleting natural resources or producing harmful emissions. These technologies are becoming increasingly efficient and cost-effective, helping combat climate change.", limit);
      } else if (isMedium) {
        return smartTruncate("Renewable energy encompasses sustainable power sources that naturally replenish themselves, including solar panels that convert sunlight into electricity, wind turbines that harness air currents, hydroelectric dams that utilize flowing water, and geothermal systems that tap Earth's internal heat. These technologies produce clean electricity without greenhouse gas emissions, making them essential for addressing climate change while providing energy security for growing global populations.", limit);
      } else {
        return smartTruncate("Renewable energy represents a revolutionary shift toward sustainable power generation using naturally replenishing resources that don't deplete over time. Solar photovoltaic panels convert sunlight directly into electricity through semiconductor materials, while wind turbines capture kinetic energy from air currents using aerodynamically designed blades. Hydroelectric facilities harness the gravitational force of flowing water, and geothermal systems extract heat from Earth's core. These technologies have experienced dramatic cost reductions and efficiency improvements, making renewable energy increasingly competitive with fossil fuels while offering the crucial advantage of producing electricity without greenhouse gas emissions, helping nations achieve carbon neutrality goals and combat climate change.", limit);
      }
    }

    if (topicLower.includes('ancient') || topicLower.includes('civilization') || topicLower.includes('history')) {
      if (isShort) {
        return smartTruncate("Ancient civilizations like Egypt, Mesopotamia, Greece, and Rome developed complex societies with advanced architecture, writing systems, and governance. Their innovations in agriculture, engineering, and culture laid foundations for modern civilization.", limit);
      } else if (isMedium) {
        return smartTruncate("Ancient civilizations emerged when human societies transitioned from nomadic hunter-gatherers to settled agricultural communities. Mesopotamian city-states developed cuneiform writing, Egyptian pharaohs built monumental pyramids, Greek philosophers established democratic principles, and Roman engineers constructed roads and aqueducts that spanned continents. These civilizations created legal systems, artistic traditions, and technological innovations that continue to influence modern society.", limit);
      } else {
        return smartTruncate("Ancient civilizations represent remarkable human achievements in developing complex societies that transformed from small agricultural settlements into vast empires spanning multiple continents. Mesopotamian civilizations invented writing systems, mathematical concepts, and urban planning principles, while ancient Egypt created monumental architecture like the pyramids and developed sophisticated mummification techniques. Greek city-states pioneered democratic governance, philosophical inquiry, and scientific methodology, and the Roman Empire established legal frameworks, engineering marvels like aqueducts and roads, and administrative systems that influenced governance for centuries. These civilizations developed agriculture, metallurgy, astronomy, medicine, and artistic traditions that laid the foundational knowledge for human progress and continue to shape modern culture, law, and technology.", limit);
      }
    }

    if (topicLower.includes('wildlife') || topicLower.includes('conservation') || topicLower.includes('biodiversity')) {
      if (isShort) {
        return smartTruncate("Wildlife conservation protects endangered species and their habitats from threats like deforestation, pollution, and climate change. Conservation efforts include establishing protected areas, breeding programs, and international treaties to preserve biodiversity.", limit);
      } else if (isMedium) {
        return smartTruncate("Wildlife conservation focuses on protecting animal species and their natural habitats from human-induced threats including habitat destruction, poaching, pollution, and climate change. Conservationists establish national parks and wildlife reserves, implement breeding programs for endangered species, and work with local communities to develop sustainable practices that balance human needs with environmental protection. International organizations coordinate global efforts to prevent extinctions and maintain biodiversity.", limit);
      } else {
        return smartTruncate("Wildlife conservation represents a critical global effort to protect animal species and their natural ecosystems from the mounting pressures of human activity, habitat destruction, climate change, and environmental degradation. Conservation biologists work to establish protected areas such as national parks and wildlife reserves, implement captive breeding programs for endangered species, and develop corridor systems that allow animals to migrate safely between habitats. These efforts involve collaboration between governments, international organizations, local communities, and indigenous peoples who possess traditional ecological knowledge. Modern conservation strategies integrate scientific research, habitat restoration, anti-poaching measures, and sustainable development practices that help human communities coexist with wildlife while preserving the biodiversity essential for healthy ecosystems.", limit);
      }
    }

    if (topicLower.includes('quantum') || topicLower.includes('physics') || topicLower.includes('science')) {
      if (isShort) {
        return smartTruncate("Quantum physics explores the behavior of matter and energy at the smallest scales, where particles exhibit strange properties like superposition and entanglement. These quantum phenomena enable technologies like computers and encryption.", limit);
      } else if (isMedium) {
        return smartTruncate("Quantum physics reveals the bizarre behavior of subatomic particles that can exist in multiple states simultaneously and become instantly connected across vast distances. This fundamental science explains how atoms and molecules interact, enabling developments in quantum computing, cryptography, and materials science. Quantum principles underlie technologies from lasers and MRI machines to the electronic devices that power modern society.", limit);
      } else {
        return smartTruncate("Quantum physics represents one of the most revolutionary and counterintuitive branches of science, describing the fundamental behavior of matter and energy at the atomic and subatomic scale where classical physics breaks down. Quantum mechanics reveals that particles can exist in superposition, occupying multiple states simultaneously until observed, and that particles can become entangled, sharing properties instantaneously regardless of the distance separating them. These quantum phenomena, while challenging our everyday understanding of reality, form the foundation for cutting-edge technologies including quantum computers that could solve complex problems exponentially faster than classical computers, quantum cryptography for unbreakable secure communications, and quantum sensors with unprecedented precision for medical imaging and scientific measurements.", limit);
      }
    }

    if (topicLower.includes('artificial') || topicLower.includes('intelligence') || topicLower.includes('ai') || topicLower.includes('machine learning')) {
      if (isShort) {
        return smartTruncate("Artificial intelligence enables machines to learn, reason, and make decisions like humans. AI systems power search engines, recommendation algorithms, autonomous vehicles, and medical diagnosis tools that transform how we work and live.", limit);
      } else if (isMedium) {
        return smartTruncate("Artificial intelligence encompasses computer systems that can perform tasks typically requiring human intelligence, including learning from data, recognizing patterns, understanding language, and making decisions. Machine learning algorithms analyze vast datasets to identify trends and make predictions, while neural networks mimic brain function to process complex information. AI applications range from virtual assistants and image recognition to autonomous vehicles and medical diagnosis systems.", limit);
      } else {
        return smartTruncate("Artificial intelligence represents a transformative field of computer science focused on creating systems that can perform cognitive tasks traditionally requiring human intelligence, such as learning, reasoning, problem-solving, perception, and language understanding. Modern AI relies heavily on machine learning techniques where algorithms automatically improve their performance by analyzing large datasets and identifying patterns. Deep learning neural networks, inspired by the human brain's structure, enable computers to process complex information like images, speech, and text with remarkable accuracy. AI applications have revolutionized numerous industries, from recommendation systems that personalize online experiences to autonomous vehicles that navigate complex traffic situations, medical diagnosis tools that detect diseases earlier than human doctors, and natural language processing systems that translate languages and generate human-like text.", limit);
      }
    }

    if (topicLower.includes('climate') || topicLower.includes('change') || topicLower.includes('environment')) {
      if (isShort) {
        return smartTruncate("Climate change refers to long-term shifts in global weather patterns caused primarily by human activities that increase greenhouse gas emissions. Rising temperatures affect ecosystems, weather patterns, and sea levels worldwide.", limit);
      } else if (isMedium) {
        return smartTruncate("Climate change describes the ongoing alteration of Earth's climate system due to increased greenhouse gas concentrations from human activities like burning fossil fuels and deforestation. Rising global temperatures cause melting ice caps, rising sea levels, more frequent extreme weather events, and shifts in precipitation patterns that affect agriculture, water resources, and ecosystems. Addressing climate change requires transitioning to renewable energy and implementing sustainable practices.", limit);
      } else {
        return smartTruncate("Climate change represents one of the most pressing challenges facing humanity, characterized by long-term alterations in Earth's climate system driven primarily by human activities that increase atmospheric concentrations of greenhouse gases like carbon dioxide, methane, and nitrous oxide. The burning of fossil fuels for energy, deforestation, industrial processes, and agriculture have elevated global average temperatures, triggering a cascade of environmental changes including melting polar ice caps and glaciers, rising sea levels, shifts in precipitation patterns, and more frequent extreme weather events such as hurricanes, droughts, and heatwaves. These changes profoundly impact ecosystems, agricultural productivity, water resources, human health, and economic stability, necessitating urgent global action to reduce emissions, transition to renewable energy sources, and implement adaptation strategies to protect vulnerable communities.", limit);
      }
    }

    // More comprehensive fallback that's not generic
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    // Try to create a more meaningful fallback based on common topic patterns
    if (topicLower.includes('technology') || topicLower.includes('tech') || topicLower.includes('computer')) {
      return smartTruncate("Technology encompasses the application of scientific knowledge to create tools, systems, and solutions that improve human life and solve complex problems efficiently.", limit);
    }
    
    if (topicLower.includes('nature') || topicLower.includes('natural')) {
      return smartTruncate("Nature encompasses the physical world and living organisms that exist without human intervention, including forests, oceans, wildlife, and natural processes that sustain life on Earth.", limit);
    }
    
    if (topicLower.includes('health') || topicLower.includes('medical') || topicLower.includes('medicine')) {
      return smartTruncate("Medical science focuses on understanding human health, diagnosing diseases, and developing treatments that improve quality of life and extend human lifespan through research and clinical practice.", limit);
    }

    // Last resort: create a more specific fallback based on the topic
    if (isShort) {
      return smartTruncate(`${capitalizedTopic} encompasses important concepts and developments that significantly impact our understanding of the world and influence various aspects of human society and scientific progress.`, limit);
    } else if (isMedium) {
      return smartTruncate(`${capitalizedTopic} represents a fascinating area of study that combines scientific research, practical applications, and theoretical understanding to advance our knowledge and develop solutions for complex challenges facing humanity today.`, limit);
    } else {
      return smartTruncate(`${capitalizedTopic} encompasses a comprehensive field of study that integrates scientific research, technological innovation, and practical applications to address complex challenges and advance our understanding of fundamental concepts. This area of knowledge involves interdisciplinary collaboration between researchers, practitioners, and experts who work together to develop new theories, methodologies, and solutions that benefit society and contribute to human progress.`, limit);
    }
  };

  // Handle starting game with custom text
  const handleStartWithCustomText = () => {
    console.log('[Lobby] Starting game with text:', customText.trim());
    console.log('[Lobby] playAlone:', playAlone);
    console.log('[Lobby] players.length:', players.length);
    console.log('[Lobby] roomId:', roomId);
    console.log('[Lobby] isAdmin:', isAdmin);
    console.log('[Lobby] connectionStatus:', connectionStatus);
    
    const socket = useGameStore.getState().socket;
    console.log('[Lobby] socket connected:', socket?.connected);
    
    if (!customText.trim()) {
      console.log('[Lobby] No text provided, not starting game');
      setNotificationMessage('❌ Please enter or generate text first');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    if (connectionStatus !== 'connected') {
      console.log('[Lobby] Not connected to server');
      setNotificationMessage('❌ Not connected to server. Please check your connection.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    if (!playAlone && players.length < 2) {
      console.log('[Lobby] Not enough players');
      setNotificationMessage('❌ Need at least 2 players to start multiplayer race');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
    
    if (playAlone) {
      console.log('[Lobby] Starting practice game');
      startGame(customText, true);
    } else {
      console.log('[Lobby] Starting multiplayer game');
      startGame(customText);
    }
    setShowTextModal(false);
    
    // Show success notification
    setNotificationMessage('🚀 Starting race...');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
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
        maxHeight: '90vh'
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
              background: connectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.1)' :
                         connectionStatus === 'connecting' ? 'rgba(245, 158, 11, 0.1)' :
                         connectionStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                         'rgba(156, 163, 175, 0.1)',
              color: connectionStatus === 'connected' ? '#047857' :
                     connectionStatus === 'connecting' ? '#d97706' :
                     connectionStatus === 'error' ? '#dc2626' :
                     '#6b7280',
              border: `1px solid ${connectionStatus === 'connected' ? '#10b981' :
                                  connectionStatus === 'connecting' ? '#f59e0b' :
                                  connectionStatus === 'error' ? '#ef4444' :
                                  '#9ca3af'}20`
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: connectionStatus === 'connected' ? '#10b981' :
                           connectionStatus === 'connecting' ? '#f59e0b' :
                           connectionStatus === 'error' ? '#ef4444' :
                           '#9ca3af'
              }} />
              {connectionStatus === 'connected' && '🟢 Connected to server'}
              {connectionStatus === 'connecting' && '🟡 Connecting...'}
              {connectionStatus === 'error' && '🔴 Connection failed'}
              {connectionStatus === 'disconnected' && '⚫ Disconnected'}
            </div>
          )}
          
          {isAdmin && lastError && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#dc2626', 
              padding: '8px 12px', 
              borderRadius: 8, 
              fontSize: 12,
              marginBottom: 12,
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}>
              <span>⚠️ {lastError}</span>
              {connectionStatus === 'error' && (
                <button
                  onClick={() => {
                    console.log('[Lobby] Retrying connection...');
                    useGameStore.getState().connect();
                  }}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}
          
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
            style={{ 
              background: 'linear-gradient(135deg, rgba(220, 210, 170, 0.9), rgba(182, 167, 122, 0.8))',
              color: '#374151', 
              border: '1.5px solid #b6a77a', 
              borderRadius: 8, 
              margin: 0, 
              padding: '8px 16px', 
              fontWeight: 600, 
              fontSize: 13,
              boxShadow: '0 2px 8px rgba(182, 167, 122, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minWidth: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(182, 167, 122, 0.9), rgba(139, 117, 96, 0.8))';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(182, 167, 122, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220, 210, 170, 0.9), rgba(182, 167, 122, 0.8))';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(182, 167, 122, 0.2)';
            }}
          >
            <span>{showFullId ? 'Hide ID' : 'Show ID'}</span>
            <span style={{ 
              fontSize: 11, 
              transform: showFullId ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>▾</span>
          </button>
          {showFullId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'relative', marginTop: 8, overflow: 'hidden' }}
            >
              <div style={{ 
                fontSize: 12, 
                color: '#374151', 
                background: 'rgba(235, 228, 200, 0.95)', 
                padding: '12px 16px', 
                borderRadius: 12, 
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', 
                wordBreak: 'break-all', 
                marginBottom: 0, 
                border: '2px solid #b6a77a',
                boxShadow: '0 4px 12px rgba(182, 167, 122, 0.2)',
                maxWidth: '280px',
                position: 'relative',
                backdropFilter: 'blur(2px)'
              }}>
                {roomName.fullId}
                <button
                  onClick={handleCopyRoomId}
                  style={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 11, 
                    background: copied ? '#10b981' : '#b6a77a', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 6, 
                    margin: 0, 
                    padding: '4px 8px', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (!copied) {
                      e.currentTarget.style.background = '#8b7560';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!copied) {
                      e.currentTarget.style.background = '#b6a77a';
                    }
                  }}
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
            </motion.div>
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
              <label 
                htmlFor="playAlone" 
                style={{ 
                  fontSize: 13, 
                  color: '#374151', 
                  cursor: 'pointer',
                  fontWeight: 500,
                  userSelect: 'none'
                }}
              >
                Practice mode (start without waiting)
              </label>
            </div>
            <button 
              disabled={!playAlone && players.length < 2} 
              style={{ 
                ...modernButtonStyle, 
                width: '100%', 
                marginBottom: 0,
                background: (!playAlone && players.length < 2) ? '#9ca3af' : modernButtonStyle.background,
                cursor: (!playAlone && players.length < 2) ? 'not-allowed' : 'pointer'
              }}
              onClick={() => {
                // Auto-generate some default text when modal opens if none exists
                if (!customText.trim()) {
                  const defaultText = getTextByDifficulty({
                    difficulty: selectedDifficulty,
                    category: selectedCategory
                  }, characterLimit);
                  setCustomText(defaultText);
                }
                setShowTextModal(true);
              }}
              title={
                !playAlone && players.length < 2 ? 'Need at least 2 players' :
                'Click to start the race'
              }
            >
              🎮 Generate & Start Race
            </button>
            {!playAlone && players.length < 2 && (
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', margin: '8px 0 0 0' }}>
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
      
      {/* Text Generation Modal */}
      <AnimatePresence>
        {showTextModal && (
          <TextGenerationModal
            isOpen={showTextModal}
            onClose={() => setShowTextModal(false)}
            customText={customText}
            setCustomText={setCustomText}
            characterLimit={characterLimit}
            setCharacterLimit={setCharacterLimit}
            onGenerateRandom={generateRandomText}
            onGenerateWithChatGPT={generateWithChatGPT}
            generatingText={generatingText}
            onStartGame={handleStartWithCustomText}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
      </AnimatePresence>
      
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