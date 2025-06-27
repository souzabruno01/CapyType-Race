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
  { file: 'capy-green.png', color: '#6ee7b7' },
  { file: 'capy-blue.png', color: '#60a5fa' },
  { file: 'capy-yellow.png', color: '#fde68a' },
  { file: 'capy-pink.png', color: '#f9a8d4' },
  { file: 'capy-brown.png', color: '#bfa181' },
  { file: 'capy-orange.png', color: '#fdba74' },
  { file: 'capy-gray.png', color: '#d1d5db' },
  { file: 'capy-red.png', color: '#f87171' },
  { file: 'capy-purple.png', color: '#a78bfa' },
  { file: 'capy-black.png', color: '#232323' },
];

function isValidNickname(nickname: string) {
  const trimmed = nickname.trim();
  if (trimmed.length < 3 || trimmed.length > 16) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (RESERVED_WORDS.includes(lower)) return false;
  if (filter.isProfane(trimmed)) return false;
  return true;
}

export default function Login() {
  const navigate = useNavigate();
  const { socket, roomId, connect, createRoom, joinRoom } = useGameStore();
  const [nickname, setNickname] = useState(() => localStorage.getItem('capy_nickname') || '');
  const [roomCode, setRoomCode] = useState(() => localStorage.getItem('capy_roomId') || '');
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('capy_avatar') || CAPYBARA_AVATARS[0].file);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Connect to socket when component mounts
    if (!socket) {
      connect();
    }
    // Autofill nickname and roomCode if present
    const savedNick = localStorage.getItem('capy_nickname');
    if (savedNick) setNickname(savedNick);
    const savedRoom = localStorage.getItem('capy_roomId');
    if (savedRoom) setRoomCode(savedRoom);
  }, [socket, connect]);

  const handleAvatarChange = (file: string) => {
    setSelectedAvatar(file);
    localStorage.setItem('capy_avatar', file);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNickname(nickname)) {
      setError('Capybarias say: this nickname is a no-go! Try something friendlier');
      return;
    }
    localStorage.setItem('capy_nickname', nickname);
    localStorage.setItem('capy_avatar', selectedAvatar);
    createRoom(nickname, selectedAvatar);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNickname(nickname) || !roomCode.trim()) {
      setError('Capybarias say: this nickname is a no-go! Try something friendlier');
      return;
    }
    localStorage.setItem('capy_nickname', nickname);
    localStorage.setItem('capy_roomId', roomCode.trim());
    localStorage.setItem('capy_avatar', selectedAvatar);
    joinRoom(roomCode, nickname, selectedAvatar);
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
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="nickname" style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Your Nickname</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16, outline: 'none', marginTop: 4, background: 'rgba(255,255,255,0.85)', color: '#232323' }}
              placeholder="Enter your nickname"
            />
          </div>
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Choose your Capybaria</label>
            <button
              type="button"
              ref={avatarBtnRef}
              onClick={() => setShowAvatarModal((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 8, border: '1.5px solid #b6a77a', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 15 }}
            >
              <span style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${CAPYBARA_AVATARS.find(a => a.file === selectedAvatar)?.color || '#eee'} 60%, #fff 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={`/images/${selectedAvatar}`} alt="capybara avatar" style={{ width: 22, height: 22 }} onError={e => (e.currentTarget.style.opacity = '0.2')} />
              </span>
            </button>
            {showAvatarModal && (
              <div style={{ position: 'absolute', top: 48, left: 0, zIndex: 10, background: 'rgba(255,255,255,0.98)', border: '1.5px solid #b6a77a', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, minWidth: 260 }}>
                {CAPYBARA_AVATARS.map((avatar) => (
                  <div
                    key={avatar.file}
                    onClick={() => { handleAvatarChange(avatar.file); setShowAvatarModal(false); }}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: selectedAvatar === avatar.file ? '2.5px solid #4f46e5' : '1.5px solid #b6a77a',
                      boxShadow: selectedAvatar === avatar.file ? '0 2px 8px rgba(79,70,229,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${avatar.color} 60%, #fff 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                    title={avatar.file.replace('capy-', '').replace('.png', '')}
                  >
                    <img src={`/images/${avatar.file}`} alt="capybara avatar" style={{ width: 28, height: 28, pointerEvents: 'none' }} onError={e => (e.currentTarget.style.opacity = '0.2')} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '10px 0', borderRadius: 6, background: '#fff', color: '#232323', fontWeight: 600, fontSize: 16, border: '1.5px solid #b6a77a', cursor: 'pointer', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
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