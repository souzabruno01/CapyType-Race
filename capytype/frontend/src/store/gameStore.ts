import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  nickname: string;
  progress: number;
  wpm: number;
  errors: number;
  position: number;
  avatar?: string; // Add avatar to Player
  color?: string; // Add color to Player
}

interface PlayerResult {
  id: string;
  nickname: string;
  wpm: number;
  errors: number;
  time: number;
  position: number;
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
  createRoom: (nickname: string, avatar?: string, color?: string) => void;
  joinRoom: (roomId: string, nickname: string, avatar?: string, color?: string) => void;
  setAdmin: (isAdmin: boolean) => void;
}

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
        // For practice mode, just set the text and game state locally
        set({ text, gameState: 'playing', isPractice: true, gameStarted: true });
      } else {
        // For multiplayer mode, emit the start game event with roomId
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
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    console.log('Connecting to backend:', backendUrl);
    
    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      set({ socket });
    });

    socket.on('roomCreated', (roomId: string) => {
      console.log('Room created:', roomId);
      set({ roomId, isAdmin: true });
    });

    socket.on('playerJoined', (players: Player[]) => {
      console.log('Players updated:', players);
      set({ players });
    });

    socket.on('playerLeft', (players: Player[]) => {
      console.log('Player left, new players:', players);
      set({ players });
    });

    socket.on('gameStarting', ({ text }: { text: string }) => {
      console.log('Game starting with text:', text);
      set({ text });
    });

    socket.on('gameStarted', () => {
      console.log('Game started');
      set({ gameState: 'playing' });
    });

    socket.on('progressUpdate', ({ playerId, progress }: { playerId: string; progress: number }) => {
      set((state) => ({
        players: state.players.map((player) =>
          player.id === playerId ? { ...player, progress } : player
        ),
      }));
    });

    socket.on('playerFinished', (result: PlayerResult) => {
      set((state) => ({
        gameResults: [
          ...state.gameResults,
          {
            ...result,
            position: state.gameResults.length + 1,
          },
        ],
      }));
    });

    socket.on('error', (message: string) => {
      console.error('Socket error:', message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ socket: null });
    });

    set({ socket });
  },

  createRoom: (nickname, avatar, color) => {
    const { socket } = get();
    console.log('createRoom called with nickname:', nickname, 'avatar:', avatar, 'color:', color);
    if (socket?.connected) {
      console.log('Socket is connected, emitting createRoom');
      socket.emit('createRoom', { nickname, avatar, color });
    } else {
      console.error('Socket not connected');
      // Try to reconnect if not connected
      get().connect();
    }
  },

  joinRoom: (roomId, nickname, avatar, color) => {
    const { socket } = get();
    if (!socket) {
      // If no socket exists, try to connect first
      get().connect();
      // Wait for socket to connect
      setTimeout(() => {
        const newSocket = get().socket;
        if (newSocket?.connected) {
          console.log('Joining room:', roomId, 'with nickname:', nickname, 'avatar:', avatar, 'color:', color);
          newSocket.emit('joinRoom', { roomId, nickname, avatar, color });
          // Set the roomId in the store
          set({ roomId });
        } else {
          console.error('Failed to connect to server');
        }
      }, 1000); // Wait 1 second for connection
    } else if (socket.connected) {
      console.log('Joining room:', roomId, 'with nickname:', nickname, 'avatar:', avatar, 'color:', color);
      socket.emit('joinRoom', { roomId, nickname, avatar, color });
      // Set the roomId in the store
      set({ roomId });
    } else {
      // If socket exists but not connected, try to reconnect
      socket.connect();
      // Wait for socket to connect
      setTimeout(() => {
        if (socket.connected) {
          console.log('Joining room:', roomId, 'with nickname:', nickname, 'avatar:', avatar, 'color:', color);
          socket.emit('joinRoom', { roomId, nickname, avatar, color });
          // Set the roomId in the store
          set({ roomId });
        } else {
          console.error('Failed to connect to server');
        }
      }, 1000); // Wait 1 second for connection
    }
  },
}));
