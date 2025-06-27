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

// Pick a random default avatar color on each page load (if not in localStorage)
function getRandomAvatarColor() {
  const idx = Math.floor(Math.random() * CAPYBARA_AVATARS.length);
  return CAPYBARA_AVATARS[idx].color;
}

export default function Login() {
  const navigate = useNavigate();
  const { roomId, createRoom, joinRoom } = useGameStore();
  // Use sessionStorage for nickname, but do NOT prefill input from sessionStorage
  const [nickname, setNickname] = useState('');
  // Room code state: always start empty on login page
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  // Use sessionStorage for avatar color
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(() => {
    const stored = sessionStorage.getItem('capy_avatar_color');
    if (stored && CAPYBARA_AVATARS.some(a => a.color === stored)) return stored;
    const random = getRandomAvatarColor();
    sessionStorage.setItem('capy_avatar_color', random);
    // Also set the avatar file for persistence
    const avatarFile = CAPYBARA_AVATARS.find(a => a.color === random)?.file || 'Capy-face-blue.png';
    sessionStorage.setItem('capy_avatar_file', avatarFile);
    return random;
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  // Always derive selectedAvatar from selectedAvatarColor
  const selectedAvatar = (() => {
    // Try to use the avatar file from sessionStorage if available
    const storedFile = sessionStorage.getItem('capy_avatar_file');
    if (storedFile) {
      const found = CAPYBARA_AVATARS.find(a => a.file === storedFile);
      if (found) return found;
    }
    // Fallback to color
    return CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor) || CAPYBARA_AVATARS[0];
  })();

  // On mount, ensure the color and avatar file in sessionStorage are valid and sync selectedAvatarColor if needed
  useEffect(() => {
    const stored = sessionStorage.getItem('capy_avatar_color');
    const storedFile = sessionStorage.getItem('capy_avatar_file');
    let fallbackColor = CAPYBARA_AVATARS[0].color;
    let fallbackFile = CAPYBARA_AVATARS[0].file;
    if (!stored || !CAPYBARA_AVATARS.some(a => a.color === stored)) {
      setSelectedAvatarColor(fallbackColor);
      sessionStorage.setItem('capy_avatar_color', fallbackColor);
      sessionStorage.setItem('capy_avatar_file', fallbackFile);
    } else if (!storedFile || !CAPYBARA_AVATARS.some(a => a.file === storedFile)) {
      // If file missing or invalid, restore it from color
      const avatarFile = CAPYBARA_AVATARS.find(a => a.color === stored)?.file || fallbackFile;
      sessionStorage.setItem('capy_avatar_file', avatarFile);
    } else {
      // If both are present, sync color to match file if needed
      const found = CAPYBARA_AVATARS.find(a => a.file === storedFile);
      if (found && found.color !== selectedAvatarColor) {
        setSelectedAvatarColor(found.color);
      }
    }
  }, []); // Only run on mount

  // When user selects a color, update state and sessionStorage
  const handleAvatarChange = (color: string) => {
    setSelectedAvatarColor(color);
    const avatarFile = CAPYBARA_AVATARS.find(a => a.color === color)?.file || 'Capy-face-blue.png';
    sessionStorage.setItem('capy_avatar_color', color);
    sessionStorage.setItem('capy_avatar_file', avatarFile);
    setShowAvatarModal(false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
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
      sessionStorage.removeItem('capy_nickname');
      setNickname('');
      return;
    }
    sessionStorage.setItem('capy_nickname', nickname);
    sessionStorage.setItem('capy_avatar_color', selectedAvatarColor);
    // Always get the avatar file from sessionStorage to ensure it's up to date
    const avatarFile = sessionStorage.getItem('capy_avatar_file') || (CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor)?.file || 'Capy-face-blue.png');
    sessionStorage.setItem('capy_avatar_file', avatarFile);
    // Clear room code on create
    sessionStorage.removeItem('capy_roomId');
    setRoomCode('');
    createRoom(nickname, avatarFile);
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
    sessionStorage.setItem('capy_nickname', nickname);
    sessionStorage.setItem('capy_roomId', roomCode.trim());
    sessionStorage.setItem('capy_avatar_color', selectedAvatarColor);
    // Always get the avatar file from sessionStorage to ensure it's up to date
    const avatarFile = sessionStorage.getItem('capy_avatar_file') || (CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor)?.file || 'Capy-face-blue.png');
    sessionStorage.setItem('capy_avatar_file', avatarFile);
    joinRoom(roomCode, nickname, avatarFile);
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
      if (avatarBtnRef.current && !avatarBtnRef.current.contains(e.target as Node)) {
        setShowAvatarModal(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAvatarModal]);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url(/images/capybara_background_multiple.png) no-repeat center center fixed', backgroundSize: 'cover' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(235, 228, 200, 0.92)', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)', border: '1.5px solid #b6a77a' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>CapyType Race</h1>
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
                  setError('');
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
                    onClick={() => handleAvatarChange(avatar.color)}
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
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
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
              maxLength={8}
            />
          </div>
          {error && <div style={{ color: '#e11d48', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="submit"
            >Create Room</button>
            <button  type="button" onClick={handleJoinRoom}>Join Room</button>
          </div>
        </form>
      </div>
    </div>
  );
}