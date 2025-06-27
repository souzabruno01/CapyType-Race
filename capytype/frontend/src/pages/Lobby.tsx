import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { generateRoomName } from '../utils/roomUtils';

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once. Pangrams are a great way to practice typing and test keyboards.",
  "In the heart of the Amazon rainforest, capybaras gather by the riverbank. These gentle giants are the world's largest rodents, known for their social nature and swimming abilities.",
  "Programming is the art of telling a computer what to do. It requires logical thinking, problem-solving skills, and attention to detail. The best code is both efficient and readable."
];

export default function Lobby() {
  const navigate = useNavigate();
  const { roomId, players, isAdmin, gameState } = useGameStore();
  const [playAlone, setPlayAlone] = useState(false);
  const [roomName, setRoomName] = useState({ readableId: '', fullId: '' });
  const [showFullId, setShowFullId] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
    } else {
      setRoomName(generateRoomName(roomId));
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

  const handleStartGame = () => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    const { socket, roomId } = useGameStore.getState();
    if (socket && roomId) {
      socket.emit('startGame', { roomId, text: randomText });
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackToLogin = () => {
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
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(235, 228, 200, 0.92)', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)', border: '1.5px solid #b6a77a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <button
          onClick={handleBackToLogin}
          style={{ alignSelf: 'flex-start', padding: '6px 16px', fontSize: 14, fontWeight: 500, color: '#4f46e5', background: '#fff', borderRadius: 8, border: '1.5px solid #b6a77a', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer', marginBottom: 8 }}
        >
          ← Back to Login
        </button>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>{roomName.readableId}</h2>
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
            style={{ fontSize: 13, color: '#4f46e5', background: '#fff', border: '1.5px solid #b6a77a', borderRadius: 6, cursor: 'pointer', marginBottom: 4, padding: '4px 12px', fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {showFullId ? 'Hide ID' : 'Show ID'} ▾
          </button>
          {showFullId && (
            <div style={{ position: 'relative', marginTop: 4 }}>
              <p style={{ fontSize: 13, color: '#6b7280', background: 'rgba(255,255,255,0.85)', padding: 8, borderRadius: 6, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 0, border: '1px solid #d1d5db' }}>{roomName.fullId}</p>
              <button
                onClick={handleCopyRoomId}
                style={{ position: 'absolute', right: 8, top: 8, fontSize: 12, color: '#4f46e5', background: '#fff', border: '1px solid #b6a77a', borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontWeight: 500 }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Players:</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((player) => (
              <li key={player.id} style={{ padding: 12, background: 'linear-gradient(90deg, #eef2ff 0%, #f3e8ff 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {player.avatar ? (
                    <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px solid #b6a77a' }}>
                      <img src={`/images/${player.avatar}`} alt="avatar" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%' }} onError={e => (e.currentTarget.style.opacity = '0.2')} />
                    </span>
                  ) : (
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                      {player.nickname.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontWeight: 500, color: '#374151', fontSize: 15 }}>{player.nickname}</span>
                </div>
                {player.progress > 0 && (
                  <div style={{ fontSize: 13, color: '#4f46e5', fontWeight: 500 }}>
                    {Math.round(player.progress)}% complete
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {isAdmin && (
          <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="playAlone"
                checked={playAlone}
                onChange={(e) => setPlayAlone(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#6366f1', borderRadius: 4 }}
              />
              <label htmlFor="playAlone" style={{ fontSize: 13, color: '#374151' }}>
                Practice mode (start without waiting)
              </label>
            </div>
            <button
              onClick={handleStartGame}
              disabled={!playAlone && players.length < 2}
              style={{ width: '100%', padding: '10px 0', borderRadius: 6, background: '#fff', color: '#232323', fontWeight: 600, fontSize: 16, border: '1.5px solid #b6a77a', cursor: (!playAlone && players.length < 2) ? 'not-allowed' : 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'background 0.2s, transform 0.2s', marginBottom: 0 }}
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
    </div>
  );
}