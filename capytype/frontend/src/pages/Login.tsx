import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Filter } from 'bad-words';

const RESERVED_WORDS = [
  'admin', 'host', 'moderator', 'capybara', 'room', 'test', 'null', 'undefined', 'root', 'server'
];

const filter = new Filter();

// List of available capybara avatars and their colors
const CAPYBARA_AVATARS = [
  { file: 'Capy-face-green.png', color: '#6ee7b7', name: 'green' },
  { file: 'Capy-face-blue.png', color: '#60a5fa', name: 'blue' },
  { file: 'Capy-face-yellow.png', color: '#fde68a', name: 'yellow' },
  { file: 'Capy-face-pink.png', color: '#f9a8d4', name: 'pink' },
  { file: 'Capy-face-brown.png', color: '#bfa181', name: 'brown' },
  { file: 'Capy-face-orange.png', color: '#fdba74', name: 'orange' },
  { file: 'Capy-face-white.png', color: '#fff', name: 'white' },
  { file: 'Capy-face-red.png', color: '#f87171', name: 'red' },
  { file: 'Capy-face-purple.png', color: '#a78bfa', name: 'purple' },
  { file: 'Capy-face-black.png', color: '#232323', name: 'black' },
];

function isValidNickname(nickname: string) {
  const trimmed = nickname.trim();
  if (trimmed.length < 3 || trimmed.length > 13) return false; // cap at 13
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (RESERVED_WORDS.includes(lower)) return false;
  if (filter.isProfane(trimmed)) return false;
  return true;
}

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

export default function Login() {
  const navigate = useNavigate();
  const { roomId, createRoom, joinRoom } = useGameStore();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [roomClosureMessage, setRoomClosureMessage] = useState('');
  
  // Avatar color state
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(() => {
    const stored = sessionStorage.getItem('capy_avatar_color');
    if (stored && CAPYBARA_AVATARS.some(a => a.color === stored)) {
      console.log('[Avatar Persist] Loaded color from sessionStorage:', stored);
      return stored;
    }
    // Only use default if nothing is stored
    const fallback = CAPYBARA_AVATARS[0].color;
    sessionStorage.setItem('capy_avatar_color', fallback);
    sessionStorage.setItem('capy_avatar_file', CAPYBARA_AVATARS[0].file);
    console.log('[Avatar Persist] No valid color found, set to default:', fallback);
    return fallback;
  });
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  // Room code validation state
  const [roomName, setRoomName] = useState<string | null>(null);
  const [roomValid, setRoomValid] = useState<boolean | null>(null);
  const [roomCheckLoading, setRoomCheckLoading] = useState(false);
  const roomCodeCheckTimeout = useRef<number | null>(null);

  // Always derive selectedAvatar from selectedAvatarColor
  const selectedAvatar = (() => {
    // Always use the current selectedAvatarColor state as the source of truth
    const avatarByColor = CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor);
    console.log('[Avatar Debug] selectedAvatarColor:', selectedAvatarColor, 'found avatar:', avatarByColor);
    if (avatarByColor) return avatarByColor;
    
    // Fallback to stored file if color lookup fails
    const storedFile = sessionStorage.getItem('capy_avatar_file');
    if (storedFile) {
      const found = CAPYBARA_AVATARS.find(a => a.file === storedFile);
      if (found) return found;
    }
    
    // Final fallback
    return CAPYBARA_AVATARS[0];
  })();

  // On mount, ensure the color and avatar file in sessionStorage are valid and sync selectedAvatarColor if needed
  useEffect(() => {
    const stored = sessionStorage.getItem('capy_avatar_color');
    const storedFile = sessionStorage.getItem('capy_avatar_file');
    
    // Check if we have valid stored data
    const validStoredColor = stored && CAPYBARA_AVATARS.some(a => a.color === stored);
    const validStoredFile = storedFile && CAPYBARA_AVATARS.some(a => a.file === storedFile);
    
    if (!validStoredColor || !validStoredFile) {
      // Reset to default if any stored data is invalid
      const defaultAvatar = CAPYBARA_AVATARS[0];
      sessionStorage.setItem('capy_avatar_color', defaultAvatar.color);
      sessionStorage.setItem('capy_avatar_file', defaultAvatar.file);
      setSelectedAvatarColor(defaultAvatar.color);
      console.log('[Avatar Persist] Reset to default:', defaultAvatar.color, defaultAvatar.file);
    } else if (selectedAvatarColor !== stored) {
      // Sync state with storage if they differ
      setSelectedAvatarColor(stored);
      console.log('[Avatar Persist] Synced state with storage:', stored);
    }
  }, []); // Only run on mount

  // Room code validation effect - only validate if user is trying to join
  useEffect(() => {
    if (roomCode.length < 8) {
      setRoomName(null);
      setRoomValid(null);
      setRoomCheckLoading(false);
      return;
    }
    
    // Don't validate room codes when user is just typing - only when they're clearly trying to join
    setRoomCheckLoading(true);
    setRoomName(null);
    setRoomValid(null);
    
    // Debounce API call
    if (roomCodeCheckTimeout.current) clearTimeout(roomCodeCheckTimeout.current);
    roomCodeCheckTimeout.current = setTimeout(() => {
      // Use VITE_BACKEND_URL from env
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const normalizedCode = roomCode.trim().toLowerCase();
      
      console.log('[Room Validation] Checking room code:', normalizedCode);
      console.log('[Room Validation] Backend URL:', backendUrl);
      
      // Don't encrypt the room code - send it directly as the room ID
      fetch(`${backendUrl}/api/room-info?code=${encodeURIComponent(normalizedCode)}`)
        .then(async (res) => {
          console.log('[Room Validation] Response status:', res.status);
          if (!res.ok) {
            const errorText = await res.text();
            console.log('[Room Validation] Error response:', errorText);
            throw new Error('Invalid');
          }
          return res.json();
        })
        .then((data) => {
          console.log('[Room Validation] Response data:', data);
          if (data && data.name) {
            setRoomName(data.name);
            setRoomValid(true);
          } else {
            setRoomName(null);
            setRoomValid(false);
          }
        })
        .catch((error) => {
          console.log('[Room Validation] Error:', error);
          setRoomName(null);
          setRoomValid(false);
        })
        .finally(() => setRoomCheckLoading(false));
    }, 400);
    
    // Cleanup
    return () => {
      if (roomCodeCheckTimeout.current) clearTimeout(roomCodeCheckTimeout.current);
    };
  }, [roomCode]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Create Room] Starting room creation process');
    
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length === 0) {
      setError('Nickname cannot be empty!');
      return;
    } else if (trimmedNickname.length < 3) {
      setError('Nickname must be at least 3 characters long!');
      return;
    } else if (!isValidNickname(trimmedNickname)) {
      setError('Capybarias say: this nickname is a no-go! Try something friendlier.');
      sessionStorage.removeItem('capy_nickname');
      setNickname('');
      return;
    }
    
    console.log('[Create Room] Validation passed, creating room for:', trimmedNickname);
    
    sessionStorage.setItem('capy_nickname', nickname);
    sessionStorage.setItem('capy_avatar_color', selectedAvatarColor);
    // Always get the avatar file from sessionStorage to ensure it's up to date
    const avatarFile = sessionStorage.getItem('capy_avatar_file') || (CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor)?.file || 'Capy-face-blue.png');
    sessionStorage.setItem('capy_avatar_file', avatarFile);
    // Clear room code on create
    sessionStorage.removeItem('capy_roomId');
    setRoomCode('');
    
    console.log('[Create Room] Calling createRoom with:', { nickname, avatarFile, selectedAvatarColor });
    
    // Pass both avatarFile and selectedAvatarColor
    createRoom(nickname, avatarFile, selectedAvatarColor);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length === 0) {
      setError('Nickname cannot be empty!');
      return;
    } else if (trimmedNickname.length < 3) {
      setError('Nickname must be at least 3 characters long!');
      return;
    } else if (!isValidNickname(trimmedNickname)) {
      setError('Capybarias say: this nickname is a no-go! Try something friendlier.');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code to join!');
      return;
    }
    
    // Check if room is valid before proceeding
    if (roomValid !== true) {
      setError('Please enter a valid room code!');
      return;
    }
    
    const normalizedRoomCode = roomCode.trim().toLowerCase();
    sessionStorage.setItem('capy_nickname', nickname);
    sessionStorage.setItem('capy_roomId', normalizedRoomCode);
    sessionStorage.setItem('capy_avatar_color', selectedAvatarColor);
    // Always get the avatar file from sessionStorage to ensure it's up to date
    const avatarFile = sessionStorage.getItem('capy_avatar_file') || (CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor)?.file || 'Capy-face-blue.png');
    sessionStorage.setItem('capy_avatar_file', avatarFile);
    
    // Pass both avatarFile and selectedAvatarColor
    joinRoom(normalizedRoomCode, nickname, avatarFile, selectedAvatarColor);
  };

  // Capybara avatar/color selection handler (for modal)
  const handleAvatarSelect = (avatar: typeof CAPYBARA_AVATARS[0]) => {
    console.log('[Avatar Persist] User selecting:', avatar.color, avatar.file);
    
    // Update sessionStorage first
    sessionStorage.setItem('capy_avatar_color', avatar.color);
    sessionStorage.setItem('capy_avatar_file', avatar.file);
    
    // Optional localStorage sync
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('capy_avatar_color', avatar.color);
      localStorage.setItem('capy_avatar_file', avatar.file);
    }
    
    // Update the state after storage
    setSelectedAvatarColor(avatar.color);
    
    // Close modal after a small delay to ensure state update completes
    setTimeout(() => {
      setShowAvatarModal(false);
      console.log('[Avatar Persist] Selection complete:', avatar.color, avatar.file);
    }, 50);
  };

  useEffect(() => {
    // Track last page for smarter room code persistence
    sessionStorage.setItem('capy_last_page', 'login');
  }, []);

  useEffect(() => {
    if (roomId) {
      sessionStorage.setItem('capy_roomId', roomId);
      sessionStorage.setItem('capy_last_page', 'lobby');
      navigate('/lobby');
    }
  }, [roomId, navigate]);

  // Close modal on click outside
  useEffect(() => {
    if (!showAvatarModal) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (avatarBtnRef.current && !avatarBtnRef.current.contains(target)) {
        // Check if click is inside the modal
        const modal = document.querySelector('[data-avatar-modal]');
        if (modal && !modal.contains(target)) {
          setShowAvatarModal(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAvatarModal]);

  // Check for room closure message on component mount
  useEffect(() => {
    const closureReason = sessionStorage.getItem('roomClosureReason');
    if (closureReason) {
      sessionStorage.removeItem('roomClosureReason');
      setRoomClosureMessage(closureReason);
      // Clear the message after 5 seconds
      setTimeout(() => setRoomClosureMessage(''), 5000);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url(/images/capybara_background_multiple.png) no-repeat center center fixed', backgroundSize: 'cover' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(235, 228, 200, 0.95)', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)', border: '1.5px solid #b6a77a' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={capyTitleStyle}>CapyType Race</h1>
          <p style={{ color: '#4b5563', marginBottom: 24 }}>Join the race and test your typing speed!</p>
        </div>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleCreateRoom}>
          <div style={{ marginBottom: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <label htmlFor="nickname" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 3, textAlign: 'center' }}>Your Nickname</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              maxLength={13}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 13 && /^[a-zA-Z0-9_]*$/.test(value)) {
                  setNickname(value);
                  if (error) setError(""); // Clear error on valid input
                } else if (!/^[a-zA-Z0-9_]*$/.test(value)) {
                  setError('Only letters, numbers, and underscores allowed!');
                }
              }}
              placeholder="Capybara123"
              style={{
                width: 160,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid #b6a77a',
                fontSize: 16,
                background: '#f8fafc', // subtle off-white
                marginBottom: 4,
                color: '#232323', // dark text
                textAlign: 'center',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}
              autoFocus
            />
            <button
              type="button"
              ref={avatarBtnRef}
              style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center' }}
              onClick={() => setShowAvatarModal(true)}
              aria-label="Choose your capybara avatar"
            >
              <img
                src={`/images/${selectedAvatar.file}`}
                alt="Your capybara avatar"
                style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid ${selectedAvatar.color}`, background: selectedAvatar.color, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              />
            </button>
            {showAvatarModal && (
              <div
                data-avatar-modal="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '100%',
                  marginTop: 8,
                  zIndex: 1000,
                  background: '#fff',
                  border: '1.5px solid #b6a77a',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  width: 320
                }}
              >
                {CAPYBARA_AVATARS.map((avatar) => (
                  <button
                    key={avatar.color}
                    type="button"
                    style={{
                      border: selectedAvatarColor === avatar.color ? '3px solid #4f46e5' : '2px solid #b6a77a',
                      borderRadius: 10,
                      padding: 0,
                      background: avatar.color,
                      width: 56,
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: selectedAvatarColor === avatar.color ? '0 0 0 2px #a5b4fc' : undefined
                    }}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <img
                      src={`/images/${avatar.file}`}
                      alt={avatar.name}
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label htmlFor="roomCode" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000', marginBottom: 3, textAlign: 'center', width: '100%' }}>Room Info</label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value);
                setError('');
              }}
              placeholder="Room code (if joining)"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid #b6a77a',
                fontSize: 16,
                background: '#fff',
                marginBottom: 4,
                textAlign: 'center',
                color: '#232323'
              }}
              maxLength={36}
            />
            {/* Room code validation feedback */}
            {roomCode.length >= 8 && (
              <div style={{ fontSize: 13, marginTop: 2, textAlign: 'center', minHeight: 18 }}>
                {roomCheckLoading ? (
                  <span style={{ color: '#a78bfa' }}>Checking room...</span>
                ) : roomValid === true && roomName ? (
                  <span style={{ color: '#059669' }}>Room: {roomName}</span>
                ) : roomValid === false ? (
                  <span style={{ color: '#e11d48' }}>Invalid room code</span>
                ) : null}
              </div>
            )}
          </div>
          {error && <div style={{ color: '#e11d48', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>{error}</div>}
          {roomClosureMessage && (
            <div style={{ 
              color: '#d97706', 
              fontSize: 14, 
              marginBottom: 12, 
              textAlign: 'center', 
              background: 'rgba(251, 191, 36, 0.1)', 
              padding: 8, 
              borderRadius: 6, 
              border: '1px solid rgba(251, 191, 36, 0.3)' 
            }}>
              ⚠️ {roomClosureMessage}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="submit"
              style={modernButtonStyle}
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={handleJoinRoom}
              style={modernButtonStyle}
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}