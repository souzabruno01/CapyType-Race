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
  const [nickname, setNickname] = useState(() => localStorage.getItem('capy_nickname') || '');
  const [roomCode, setRoomCode] = useState(() => localStorage.getItem('capy_roomId') || '');
  const [error, setError] = useState('');
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(() => {
    const stored = localStorage.getItem('capy_avatar_color');
    if (stored && CAPYBARA_AVATARS.some(a => a.color === stored)) return stored;
    const random = getRandomAvatarColor();
    localStorage.setItem('capy_avatar_color', random);
    // Also set the avatar file for persistence
    const avatarFile = CAPYBARA_AVATARS.find(a => a.color === random)?.file || 'Capy-face-blue.png';
    localStorage.setItem('capy_avatar_file', avatarFile);
    return random;
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  // Always derive selectedAvatar from selectedAvatarColor
  const selectedAvatar = (() => {
    // Try to use the avatar file from localStorage if available
    const storedFile = localStorage.getItem('capy_avatar_file');
    if (storedFile) {
      const found = CAPYBARA_AVATARS.find(a => a.file === storedFile);
      if (found) return found;
    }
    // Fallback to color
    return CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor) || CAPYBARA_AVATARS[0];
  })();

  // On mount, ensure the color and avatar file in localStorage are valid and sync selectedAvatarColor if needed
  useEffect(() => {
    const stored = localStorage.getItem('capy_avatar_color');
    const storedFile = localStorage.getItem('capy_avatar_file');
    let fallbackColor = CAPYBARA_AVATARS[0].color;
    let fallbackFile = CAPYBARA_AVATARS[0].file;
    if (!stored || !CAPYBARA_AVATARS.some(a => a.color === stored)) {
      setSelectedAvatarColor(fallbackColor);
      localStorage.setItem('capy_avatar_color', fallbackColor);
      localStorage.setItem('capy_avatar_file', fallbackFile);
    } else if (!storedFile || !CAPYBARA_AVATARS.some(a => a.file === storedFile)) {
      // If file missing or invalid, restore it from color
      const avatarFile = CAPYBARA_AVATARS.find(a => a.color === stored)?.file || fallbackFile;
      localStorage.setItem('capy_avatar_file', avatarFile);
    } else {
      // If both are present, sync color to match file if needed
      const found = CAPYBARA_AVATARS.find(a => a.file === storedFile);
      if (found && found.color !== selectedAvatarColor) {
        setSelectedAvatarColor(found.color);
      }
    }
  }, []); // Only run on mount

  // When user selects a color, update state and localStorage
  const handleAvatarChange = (color: string) => {
    setSelectedAvatarColor(color);
    const avatarFile = CAPYBARA_AVATARS.find(a => a.color === color)?.file || 'Capy-face-blue.png';
    localStorage.setItem('capy_avatar_color', color);
    localStorage.setItem('capy_avatar_file', avatarFile);
    setShowAvatarModal(false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNickname(nickname)) {
      setError('Capybarias say: this nickname is a no-go! Try something friendlier');
      return;
    }
    localStorage.setItem('capy_nickname', nickname);
    localStorage.setItem('capy_avatar_color', selectedAvatarColor);
    const avatarFile = CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor)?.file || 'Capy-face-blue.png';
    localStorage.setItem('capy_avatar_file', avatarFile);
    createRoom(nickname, avatarFile);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNickname(nickname) || !roomCode.trim()) {
      setError('Capybarias say: this nickname is a no-go! Try something friendlier');
      return;
    }
    localStorage.setItem('capy_nickname', nickname);
    localStorage.setItem('capy_roomId', roomCode.trim());
    localStorage.setItem('capy_avatar_color', selectedAvatarColor);
    const avatarFile = CAPYBARA_AVATARS.find(a => a.color === selectedAvatarColor)?.file || 'Capy-face-blue.png';
    localStorage.setItem('capy_avatar_file', avatarFile);
    joinRoom(roomCode, nickname, avatarFile);
  };

  useEffect(() => {
    if (roomId) {
      localStorage.setItem('capy_roomId', roomId);
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
          <div style={{ marginBottom: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                } else if (value.length > 13) {
                  setError('Nickname must be 13 characters or less');
                } else if (!/^[a-zA-Z0-9_]*$/.test(value)) {
                  setError('Only letters, numbers, and underscores allowed');
                }
              }}
              style={{ width: 160, padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15, outline: 'none', marginTop: 2, background: 'rgba(255,255,255,0.85)', color: '#232323', textAlign: 'center', transition: 'border 0.2s' }}
              placeholder="Enter your nickname"
              autoComplete="off"
            />
          </div>
          <div style={{ marginBottom: 12, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 3, textAlign: 'center' }}>Choose your Capybaria</label>
            <button
              type="button"
              ref={avatarBtnRef}
              onClick={() => setShowAvatarModal((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 8, border: '1.5px solid #b6a77a', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, margin: '0 auto', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              aria-label={`Selected capybara: ${selectedAvatar.name}`}
            >
              {/* This span always reflects the selected capybara color and avatar */}
              <span style={{ width: 40, height: 40, borderRadius: 7, background: `linear-gradient(135deg, ${selectedAvatar.color} 60%, #fff 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #b6a77a', transition: 'background 0.2s' }}>
                <img src={`/images/${selectedAvatar.file}`} alt="capybara avatar" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={e => (e.currentTarget.style.opacity = '0.2')} />
              </span>
              <span style={{ color: '#374151', fontWeight: 500, fontSize: 13, marginLeft: 6 }}>{selectedAvatar.name.charAt(0).toUpperCase() + selectedAvatar.name.slice(1)}</span>
            </button>
            {showAvatarModal && (
              <div style={{ position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.98)', border: '2px solid #b6a77a', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 14, minWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#4f46e5', marginBottom: 8, fontSize: 15 }}>Pick your Capybaria color</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7, marginBottom: 7 }}>
                  {CAPYBARA_AVATARS.map((avatar) => (
                    <div
                      key={avatar.color}
                      onClick={() => handleAvatarChange(avatar.color)}
                      style={{
                        width: 40, // increased from 32
                        height: 40, // increased from 32
                        borderRadius: 7,
                        border: selectedAvatarColor === avatar.color ? '2px solid #4f46e5' : '1.5px solid #b6a77a',
                        boxShadow: selectedAvatarColor === avatar.color ? '0 2px 8px rgba(79,70,229,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
                        cursor: 'pointer',
                        background: `linear-gradient(135deg, ${avatar.color} 60%, #fff 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border 0.2s, box-shadow 0.2s',
                        position: 'relative',
                      }}
                      title={avatar.name}
                    >
                      <img src={`/images/${avatar.file}`} alt="capybara avatar" style={{ width: 32, height: 32, pointerEvents: 'none', objectFit: 'contain' }} onError={e => (e.currentTarget.style.opacity = '0.2')} />
                      <span style={{ position: 'absolute', bottom: 1, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#374151', fontWeight: 500, background: 'rgba(255,255,255,0.7)', borderRadius: 3, margin: '0 2px', padding: '0 1px' }}>{avatar.name}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAvatarModal(false)} style={{ marginTop: 4, padding: '2px 10px', borderRadius: 5, border: '1.5px solid #b6a77a', background: '#f3f4f6', color: '#374151', fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>Close</button>
              </div>
            )}
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '10px 0', borderRadius: 6, background: '#d1fae5', color: '#065f46', fontWeight: 600, fontSize: 16, border: '1.5px solid #6ee7b7', cursor: 'pointer', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'background 0.2s, color 0.2s' }}
          >
            Create New Room
          </button>
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
              Or join an existing room
            </span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb', borderRadius: 1 }} />
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb', borderRadius: 1 }} />
            <span style={{ fontSize: 13, color: '#b6a77a', margin: '0 8px' }}>Room Info</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb', borderRadius: 1 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="roomCode" style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Room Code</label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16, outline: 'none', marginTop: 4, background: 'rgba(255,255,255,0.85)', color: '#232323' }}
              placeholder="Enter room code"
            />
          </div>
          <button
            type="button"
            onClick={handleJoinRoom}
            style={{ width: '100%', padding: '10px 0', borderRadius: 6, background: '#fff', color: '#232323', fontWeight: 600, fontSize: 16, border: '1.5px solid #b6a77a', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            Join Room
          </button>
          {error && (
            <div style={{ color: '#dc2626', fontSize: 14, textAlign: 'center', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {error}
              <img src="/images/capy-face.png" alt="capybara face" style={{ width: 22, height: 22, verticalAlign: 'middle' }} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}