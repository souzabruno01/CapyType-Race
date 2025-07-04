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

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      console.error('Backend URL:', backendUrl);
      alert(`Cannot connect to server at ${backendUrl}. Please check if the backend is running.`);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    socket.on('roomCreated', (roomId: string) => {
      console.log('Room created:', roomId);
      set({ roomId, isAdmin: true });
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

    // Handle player color changes from server
    socket.on('playerColorChanged', ({ playerId, color, avatar }: { playerId: string; color: string; avatar?: string }) => {
      console.log('[Avatar] Player color changed:', { playerId, color, avatar });
      
      // Update the player in the store
      set((state) => ({
        players: state.players.map((player) =>
          player.id === playerId 
            ? { 
                ...player, 
                color, 
                avatar: avatar || player.avatar 
              } 
            : player
        ),
      }));
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
      if (message === 'Room not found') {
        alert('The room you tried to join does not exist or has been closed.');
        set({ roomId: null });
        
        // Clear room from session storage
        sessionStorage.removeItem('capy_roomId');
        
        // This will redirect back to login
        if (window.location.pathname.includes('/lobby')) {
          window.location.href = '/';
        }
      } else {
        alert(`Error: ${message}`);
      }
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
      console.log('Attempting to reconnect...');
      get().connect();
      
      // Try again after a short delay
      setTimeout(() => {
        const { socket: newSocket } = get();
        if (newSocket?.connected) {
          console.log('Reconnected, trying createRoom again');
          newSocket.emit('createRoom', { 
            nickname, 
            avatar: finalAvatar, 
            color: finalColor 
          });
        } else {
          console.error('Failed to reconnect to server');
          alert('Cannot connect to server. Please check your internet connection and try again.');
        }
      }, 2000);
    }
  },

  joinRoom: (roomId, nickname, avatar, color) => {
    const { socket } = get();
    
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
        alert('Failed to connect to the game server. Please try again.');
      }
    };

    if (!socket) {
      console.log('[Join] No socket, connecting first...');
      get().connect();
      setTimeout(() => {
        const newSocket = get().socket;
        if (newSocket) {
          console.log('[Join] Connected, now joining room');
          emitJoinRoom(newSocket);
        } else {
          console.error('[Join] Failed to connect after waiting');
          alert('Could not connect to the game server. Please check your internet connection.');
        }
      }, 1000);
    } else if (socket.connected) {
      console.log('[Join] Socket already connected, joining directly');
      emitJoinRoom(socket);
    } else {
      console.log('[Join] Socket exists but disconnected, reconnecting...');
      socket.connect();
      setTimeout(() => {
        if (socket && socket.connected) {
          console.log('[Join] Reconnected, now joining room');
          emitJoinRoom(socket);
        } else {
          console.error('[Join] Failed to reconnect');
          alert('Could not reconnect to the game server. Please refresh the page and try again.');
        }
      }, 1000);
    }
  },
}));
