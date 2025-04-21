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

  // Watch for game start
  useEffect(() => {
    if (gameState === 'playing') {
      navigate('/game');
    }
  }, [gameState, navigate]);

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
      // Emit leave room event
      socket.emit('leaveRoom');
      // Disconnect from the socket
      socket.disconnect();
    }
    // Reset game state
    useGameStore.getState().resetGame();
    // Navigate back to login
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackToLogin}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
          >
            ← Back to Login
          </button>
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">
              {roomName.readableId}
            </h2>
            <p className="text-gray-600">Waiting for players to join...</p>
          </div>
        </div>

        <div className="text-center">
          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <div className="mt-2 space-y-2">
              <button
                onClick={() => setShowFullId(!showFullId)}
                className="text-sm text-indigo-600 hover:text-indigo-700 focus:outline-none transition-colors duration-200"
              >
                {showFullId ? 'Hide ID' : 'Show ID'} ▾
              </button>
              {showFullId && (
                <div className="relative">
                  <p className="text-sm text-gray-500 break-all font-mono bg-gray-50 p-2 rounded">
                    {roomName.fullId}
                  </p>
                  <button
                    onClick={handleCopyRoomId}
                    className="absolute right-2 top-2 text-xs text-indigo-600 hover:text-indigo-700 focus:outline-none transition-colors duration-200"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Players:</h2>
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.id}
                className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                    {player.nickname.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700">{player.nickname}</span>
                </div>
                {player.progress > 0 && (
                  <div className="text-sm text-indigo-600 font-medium">
                    {Math.round(player.progress)}% complete
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="playAlone"
                checked={playAlone}
                onChange={(e) => setPlayAlone(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="playAlone" className="text-sm text-gray-700">
                Practice mode (start without waiting)
              </label>
            </div>
            <button
              onClick={handleStartGame}
              disabled={!playAlone && players.length < 2}
              className={`w-full px-4 py-2 text-white rounded-md transition-all duration-200 ${
                !playAlone && players.length < 2
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105'
              }`}
            >
              Start Game
            </button>
            {!playAlone && players.length < 2 && (
              <p className="text-sm text-center text-gray-500">
                Waiting for more players to join...
              </p>
            )}
          </div>
        )}

        {!isAdmin && (
          <div className="text-center text-gray-600">
            Waiting for the host to start the game...
          </div>
        )}
      </div>
    </div>
  );
} 