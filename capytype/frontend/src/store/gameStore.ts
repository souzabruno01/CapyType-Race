import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  nickname: string;
  progress: number;
  wpm: number;
  errors: number;
  position: number;
  avatar: string; // Required field
  color: string; // Required field
}

interface PlayerResult {
  id: string;
  nickname: string;
  wpm: number;
  errors: number;
  time: number;
  position: number;
  avatar: string; // Add avatar
  color: string; // Add color
}

interface GameState {
  socket: Socket | null;
  roomId: string | null;
  players: Player[];
  text: string;
  progress: number;
  gameState: 'waiting' | 'playing' | 'finished';
  gameResults: PlayerResult[];
  isAdmin: boolean;
  isPractice: boolean;
  gameStarted: boolean;
}

interface GameStore extends GameState {
  setSocket: (socket: Socket) => void;
  setRoomId: (roomId: string) => void;
  setPlayers: (players: Player[]) => void;
  setText: (text: string) => void;
  updateProgress: (progress: number) => void;
  startGame: (text: string, isPractice?: boolean) => void;
  setGameResults: (results: PlayerResult[]) => void;
  resetGame: () => void;
  connect: () => void;
  createRoom: (nickname: string, avatar: string, color: string) => void;
  joinRoom: (roomId: string, nickname: string, avatar: string, color: string) => void;
  setAdmin: (isAdmin: boolean) => void;
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  roomId: null,
  players: [],
  text: '',
  progress: 0,
  gameState: 'waiting',
  gameResults: [],
  isAdmin: false,
  isPractice: false,
  gameStarted: false,

  setSocket: (socket) => set({ socket }),
  setRoomId: (roomId) => set({ roomId }),
  setPlayers: (players) => set({ players }),
  setText: (text) => set({ text }),
  updateProgress: (progress) => set({ progress }),
  startGame: (text, isPractice = false) => {
    const { socket, roomId } = get();
    if (socket?.connected) {
      if (isPractice) {
        set({ text, gameState: 'playing', isPractice: true, gameStarted: true });
      } else {
        socket.emit('startGame', { roomId, text });
      }
    }
  },
  setGameResults: (results) => set({ gameResults: results, gameState: 'finished' }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  resetGame: () => set({ 
    socket: null,
    roomId: null,
    players: [],
    text: '',
    progress: 0,
    gameState: 'waiting',
    gameResults: [],
    isAdmin: false,
    isPractice: false,
    gameStarted: false
  }),
  connect: () => {
    if (get().socket) return; // Already connected

    const newSocket = io(VITE_BACKEND_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      set({ socket: newSocket });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ socket: null });
    });

    // Centralized event listeners
    newSocket.on('roomCreated', (roomId) => {
      set({ roomId });
    });

    newSocket.on('roomJoined', ({ roomId, isAdmin }) => {
      set({ roomId, isAdmin });
    });

    newSocket.on('playerJoined', (players) => {
      set({ players });
    });

    newSocket.on('playerLeft', (players) => {
      set({ players });
    });

    newSocket.on('gameStarting', ({ text }) => {
      set({ text, gameState: 'playing', gameStarted: true });
    });

    newSocket.on('gameStarted', () => {
      set({ gameState: 'playing' });
    });

    newSocket.on('progressUpdate', ({ playerId, progress }) => {
      set((state) => ({
        players: state.players.map((p) => (p.id === playerId ? { ...p, progress } : p)),
      }));
    });

    newSocket.on('playerFinished', (data) => {
      // Handle player finish logic if needed
      console.log('Player finished:', data);
    });

    newSocket.on('roomClosed', () => {
      get().resetGame();
      // Optionally, redirect to home or show a message
    });

    newSocket.on('roomError', (error) => {
      console.error('Room Error:', error.message);
      // Handle error display to the user
    });
  },
  createRoom: (nickname, avatar, color) => {
    const { socket, connect } = get();
    if (!socket || !socket.connected) {
      console.log('Socket not connected, attempting to connect first...');
      connect();
      // Wait a short time for connection and retry
      setTimeout(() => {
        const { socket: newSocket } = get();
        if (newSocket && newSocket.connected) {
          console.log('Socket connected, creating room...');
          newSocket.emit('createRoom', { nickname, avatar, color });
        } else {
          console.error('Failed to connect socket for room creation');
        }
      }, 1000);
    } else {
      console.log('Socket already connected, creating room...');
      socket.emit('createRoom', { nickname, avatar, color });
    }
  },
  joinRoom: (roomId, nickname, avatar, color) => {
    const { socket, connect } = get();
    if (!socket || !socket.connected) {
      console.log('Socket not connected, attempting to connect first...');
      connect();
      // Wait a short time for connection and retry
      setTimeout(() => {
        const { socket: newSocket } = get();
        if (newSocket && newSocket.connected) {
          console.log('Socket connected, joining room...');
          newSocket.emit('joinRoom', { roomId, nickname, avatar, color });
        } else {
          console.error('Failed to connect socket for joining room');
        }
      }, 1000);
    } else {
      console.log('Socket already connected, joining room...');
      socket.emit('joinRoom', { roomId, nickname, avatar, color });
    }
  },
}));
