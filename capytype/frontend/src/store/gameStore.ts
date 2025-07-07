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
  resetGame: () => {
    // Clear session data when resetting game
    sessionStorage.removeItem('capy_room_id');
    sessionStorage.removeItem('capy_nickname');
    sessionStorage.removeItem('capy_is_admin');
    
    set({ 
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
    });
  },

  connect: () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    console.log('Connecting to backend:', backendUrl);
    
    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Avatar] Connected to server');
      // When connecting, ensure we have avatar/color in sessionStorage
      const storedColor = sessionStorage.getItem('capy_avatar_color');
      const storedFile = sessionStorage.getItem('capy_avatar_file');
      if (!storedColor || !storedFile) {
        // Set defaults if missing
        sessionStorage.setItem('capy_avatar_color', '#6ee7b7');
        sessionStorage.setItem('capy_avatar_file', 'Capy-face-green.png');
      }
      set({ socket });
    });

    socket.on('roomCreated', (roomId: string) => {
      console.log('Room created:', roomId);
      set({ roomId, isAdmin: true });
    });

    socket.on('roomJoined', ({ roomId: joinedRoomId, isAdmin: joinedIsAdmin }: { roomId: string; isAdmin: boolean }) => {
      console.log('Room joined:', { roomId: joinedRoomId, isAdmin: joinedIsAdmin });
      set({ roomId: joinedRoomId, isAdmin: joinedIsAdmin });
    });

    socket.on('playerJoined', (players: Player[]) => {
      console.log('[Avatar] Players updated:', players);
      // Ensure all player objects have avatar and color
      const validatedPlayers = players.map(player => {
        // For the current player, use the values from sessionStorage if available
        if (player.id === socket.id) {
          const storedColor = sessionStorage.getItem('capy_avatar_color');
          const storedFile = sessionStorage.getItem('capy_avatar_file');
          return {
            ...player,
            avatar: storedFile || player.avatar || 'Capy-face-blue.png',
            color: storedColor || player.color || '#60a5fa'
          };
        }
        // For other players, use their provided values or defaults
        return {
          ...player,
          avatar: player.avatar || 'Capy-face-blue.png',
          color: player.color || '#60a5fa'
        };
      });
      console.log('[Avatar] Validated players:', validatedPlayers);
      set({ players: validatedPlayers });
    });

    socket.on('playerLeft', (players: Player[]) => {
      console.log('Player left, new players:', players);
      // Ensure all player objects have avatar and color
      const validatedPlayers = players.map(player => ({
        ...player,
        avatar: player.avatar || 'Capy-face-blue.png',
        color: player.color || '#60a5fa'
      }));
      set({ players: validatedPlayers });
    });

    socket.on('roomClosed', ({ reason, message }: { reason: string; message: string }) => {
      console.log('Room closed:', reason, message);
      // Store the closure reason for display
      sessionStorage.setItem('roomClosureReason', message);
      // Reset game state and disconnect
      get().resetGame();
      // The redirect will be handled by the component that detects the closure reason
    });

    socket.on('gameStarting', ({ text }: { text: string }) => {
      console.log('Game starting with text:', text);
      set({ text });
    });

    socket.on('gameStarted', () => {
      console.log('Game started');
      set({ gameState: 'playing', gameStarted: true });
    });

    socket.on('progressUpdate', ({ playerId, progress }: { playerId: string; progress: number }) => {
      set((state) => ({
        players: state.players.map((player) =>
          player.id === playerId ? { ...player, progress } : player
        ),
      }));
    });

    socket.on('playerFinished', (result: PlayerResult) => {
      // Ensure avatar and color are included in the result
      const player = get().players.find(p => p.id === result.id);
      set((state) => ({
        gameResults: [
          ...state.gameResults,
          {
            ...result,
            position: state.gameResults.length + 1,
            avatar: player?.avatar || 'Capy-face-blue.png',
            color: player?.color || '#60a5fa'
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
    console.log('[Avatar] createRoom called with:', { nickname, avatar, color });
    
    // Store nickname for session persistence
    sessionStorage.setItem('capy_nickname', nickname);
    
    // Ensure we're using the correct avatar/color from session storage
    const storedColor = sessionStorage.getItem('capy_avatar_color');
    const storedFile = sessionStorage.getItem('capy_avatar_file');
    
    // Use stored values if available, otherwise use provided values
    const finalAvatar = storedFile || avatar;
    const finalColor = storedColor || color;
    
    console.log('[Avatar] Using values:', { finalAvatar, finalColor });
    
    if (socket?.connected) {
      console.log('[Avatar] Socket is connected, emitting createRoom');
      socket.emit('createRoom', { 
        nickname, 
        avatar: finalAvatar, 
        color: finalColor 
      });
    } else {
      console.error('Socket not connected');
      get().connect();
    }
  },

  joinRoom: (roomId, nickname, avatar, color) => {
    const { socket } = get();
    
    // Store nickname for session persistence
    sessionStorage.setItem('capy_nickname', nickname);
    
    // Ensure we're using the correct avatar/color from session storage
    const storedColor = sessionStorage.getItem('capy_avatar_color');
    const storedFile = sessionStorage.getItem('capy_avatar_file');
    
    // Use stored values if available, otherwise use provided values
    const finalAvatar = storedFile || avatar;
    const finalColor = storedColor || color;
    
    console.log('[Avatar] joinRoom with values:', { 
      roomId, 
      nickname, 
      avatar: finalAvatar, 
      color: finalColor 
    });

    const emitJoinRoom = (socket: Socket) => {
      if (socket.connected) {
        console.log('[Avatar] Emitting joinRoom');
        socket.emit('joinRoom', { 
          roomId, 
          nickname, 
          avatar: finalAvatar, 
          color: finalColor 
        });
        set({ roomId });
      } else {
        console.error('Failed to connect to server');
      }
    };

    if (!socket) {
      get().connect();
      setTimeout(() => {
        const newSocket = get().socket;
        if (newSocket) emitJoinRoom(newSocket);
      }, 1000);
    } else if (socket.connected) {
      emitJoinRoom(socket);
    } else {
      socket.connect();
      setTimeout(() => {
        if (socket) emitJoinRoom(socket);
      }, 1000);
    }
  },
}));
