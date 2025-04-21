import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Login() {
  const navigate = useNavigate();
  const { socket, roomId, connect, createRoom, joinRoom } = useGameStore();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Connect to socket when component mounts
    if (!socket) {
      connect();
    }
  }, [socket, connect]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    createRoom(nickname);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !roomCode.trim()) {
      setError('Please enter both nickname and room code');
      return;
    }
    joinRoom(roomCode, nickname);
  };

  useEffect(() => {
    if (roomId) {
      navigate('/lobby');
    }
  }, [roomId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">CapyType Race</h1>
          <p className="text-gray-600">Join the race and test your typing speed!</p>
        </div>

        <form className="space-y-6" onSubmit={handleCreateRoom}>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              Your Nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your nickname"
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or join an existing room</span>
              </div>
            </div>

            <div>
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700">
                Room Code
              </label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter room code"
              />
            </div>

            <button
              type="button"
              onClick={handleJoinRoom}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Join Room
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
} 