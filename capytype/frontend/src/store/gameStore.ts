import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  nickname: string;
  progress: number;
  wpm: number;
  errors: number;
  points: number; // NEW: Add points field
  position: number;
  avatar: string; // Required field
  color: string; // Required field
  isHost?: boolean;
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
  hostId: string | null;
  players: Player[];
  text: string;
  progress: number;
  gameState: 'waiting' | 'playing' | 'finished';
  gameResults: PlayerResult[];
  isAdmin: boolean;
  isPractice: boolean;
  gameStarted: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastError: string | null;
  roomClosed: { reason: string; message: string } | null;
}

interface GameStore extends GameState {
  setSocket: (socket: Socket | null) => void;
  setRoomId: (roomId: string) => void;
  setHostId: (hostId: string) => void;
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
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setError: (error: string | null) => void;
  clearRoomClosed: () => void;
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  roomId: null,
  hostId: null,
  players: [],
  text: '',
  progress: 0,
  gameState: 'waiting',
  gameResults: [],
  isAdmin: false,
  isPractice: false,
  gameStarted: false,
  connectionStatus: 'disconnected',
  lastError: null,
  roomClosed: null,

  setSocket: (socket) => set({ socket }),
  setRoomId: (roomId) => set({ roomId }),
  setHostId: (hostId) => set({ hostId }),
  setPlayers: (players) => set({ players }),
  setText: (text) => set({ text }),
  updateProgress: (progress) => set({ progress }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setError: (lastError) => set({ lastError }),
  startGame: (text, isPractice = false) => {
    const { socket, roomId, setError } = get();
    console.log('[Store] startGame called with:', { text: text.substring(0, 50) + '...', isPractice, roomId, socketConnected: socket?.connected });
    
    if (!socket || !socket.connected) {
      const error = 'Not connected to server. Please check your internet connection.';
      console.error('[Store]', error);
      setError(error);
      return;
    }

    if (!isPractice && !roomId) {
      const error = 'No room ID found. Please rejoin the room.';
      console.error('[Store]', error);
      setError(error);
      return;
    }
    
    if (socket.connected) {
      setError(null); // Clear any previous errors
      if (isPractice) {
        console.log('[Store] Setting up practice game');
        set({ text, gameState: 'playing', isPractice: true, gameStarted: true });
      } else {
        console.log('[Store] Emitting startGame to backend with roomId:', roomId);
        socket.emit('startGame', { roomId, text });
      }
    }
  },
  setGameResults: (results) => set({ gameResults: results, gameState: 'finished' }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  clearRoomClosed: () => set({ roomClosed: null }),
  resetGame: () => set({ 
    socket: null,
    roomId: null,
    hostId: null,
    players: [],
    text: '',
    progress: 0,
    gameState: 'waiting',
    gameResults: [],
    isAdmin: false,
    isPractice: false,
    gameStarted: false,
    connectionStatus: 'disconnected',
    lastError: null,
    roomClosed: null
  }),
  connect: () => {
    const { socket: existingSocket, setConnectionStatus, setError, setHostId } = get();
    if (existingSocket?.connected) {
      console.log('[Store] Already connected');
      return;
    }

    console.log('[Store] Connecting to backend:', VITE_BACKEND_URL);
    setConnectionStatus('connecting');
    setError(null);

    const newSocket = io(VITE_BACKEND_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('[Store] Socket connected:', newSocket.id);
      const { setSocket, setConnectionStatus, setError } = get();
      setSocket(newSocket);
      setConnectionStatus('connected');
      setError(null);

      // When a new connection is made, the player is not yet in a room, so they can't be host.
      // However, if they create or join a room, the 'roomJoined' event will update their admin status.
      // We can also listen for an event that explicitly sets the host.
      newSocket.on('hostAssigned', (hostId) => {
        setHostId(hostId);
        set((state) => ({
          players: state.players.map((p) => ({ ...p, isHost: p.id === hostId })),
          isAdmin: state.socket?.id === hostId,
        }));
      });
    });

    newSocket.on('disconnect', () => {
      console.log('[Store] Socket disconnected');
      const { setSocket, setConnectionStatus } = get();
      setSocket(null);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Store] Connection error:', error);
      const { setConnectionStatus, setError } = get();
      setConnectionStatus('error');
      setError(`Connection failed: ${error.message}`);
    });

    // Centralized event listeners
    newSocket.on('roomCreated', (roomId) => {
      set({ roomId });
      // When creating a room, the creator becomes the host
      const { socket } = get();
      if (socket) {
        set({ hostId: socket.id, isAdmin: true });
      }
    });

    newSocket.on('roomJoined', ({ roomId, isAdmin, hostId }) => {
      console.log('[Store] Room joined event:', { roomId, isAdmin, hostId });
      set({ roomId, isAdmin, hostId });
      // Update all players with host status
      set((state) => ({
        players: state.players.map((p) => ({ ...p, isHost: p.id === hostId })),
      }));
    });

    newSocket.on('playerJoined', (players: Player[]) => {
      const { hostId } = get();
      // If no hostId is set, make the first player the host
      const effectiveHostId = hostId || (players.length > 0 ? players[0].id : null);
      const updatedPlayers = players.map((p, index) => ({ 
        ...p, 
        isHost: p.id === effectiveHostId || (index === 0 && !hostId)
      }));
      set({ players: updatedPlayers });
      
      // Update hostId if it wasn't set
      if (!hostId && players.length > 0) {
        set({ hostId: players[0].id });
      }
    });

    newSocket.on('playerLeft', (players: Player[]) => {
      const { hostId } = get();
      // If no hostId is set, make the first player the host
      const effectiveHostId = hostId || (players.length > 0 ? players[0].id : null);
      const updatedPlayers = players.map((p, index) => ({ 
        ...p, 
        isHost: p.id === effectiveHostId || (index === 0 && !hostId)
      }));
      set({ players: updatedPlayers });
      
      // Update hostId if it wasn't set
      if (!hostId && players.length > 0) {
        set({ hostId: players[0].id });
      }
    });

    newSocket.on('gameStarting', ({ text, raceDuration }) => {
      console.log('[Store] Game starting with duration:', raceDuration);
      set({ text, gameState: 'playing', gameStarted: true });
    });

    newSocket.on('gameStarted', ({ duration, serverTime }) => {
      console.log('[Store] Game started at server time:', serverTime, 'duration:', duration);
      set({ gameState: 'playing' });
    });

    newSocket.on('raceFinished', ({ reason, serverTime }) => {
      console.log('[Store] Race finished:', reason, 'at server time:', serverTime);
      set({ gameState: 'finished' });
    });

    // Handle game state changes from backend (e.g., when returning to lobby)
    newSocket.on('gameStateChanged', ({ gameState, reason }) => {
      console.log('[Store] Game state changed to:', gameState, 'reason:', reason);
      set({ gameState });
      
      // If we're returning to waiting state, clear race data
      if (gameState === 'waiting') {
        set((state) => ({
          text: '',
          progress: 0,
          gameStarted: false,
          gameResults: [],
          players: state.players.map(p => ({
            ...p,
            wpm: 0,
            errors: 0,
            progress: 0,
            time: 0,
            position: 0
          }))
        }));
      }
    });

    newSocket.on('progressUpdate', ({ playerId, progress }) => {
      set((state) => ({
        players: state.players.map((p) => (p.id === playerId ? { ...p, progress } : p)),
      }));
    });

    newSocket.on('playerStatsUpdated', ({ playerId, wpm, errors, progress }) => {
      set((state) => ({
        players: state.players.map((p) => 
          p.id === playerId ? { ...p, wpm, errors, progress } : p
        ),
      }));
    });

    newSocket.on('playerFinished', (data) => {
      // Handle player finish logic and update their final stats
      console.log('Player finished:', data);
      if (data.playerId && data.wpm !== undefined && data.errors !== undefined) {
        set((state) => ({
          players: state.players.map((p) => 
            p.id === data.playerId ? { 
              ...p, 
              wpm: data.wpm, 
              errors: data.errors, 
              progress: data.progress || p.progress 
            } : p
          ),
        }));
      }
    });

    newSocket.on('roomClosed', (data: { reason: string; message: string }) => {
      console.log('Room closed:', data);
      set({ roomClosed: data });
      // Don't call resetGame() here - let the components handle it after showing the message
    });

    newSocket.on('roomError', (error) => {
      console.error('Room Error:', error.message);
      // Handle error display to the user
    });

    newSocket.on('error', (error) => {
      console.error('Socket Error:', error);
      // Handle error display to the user
    });

    // NEW: Listen for updated player data from the server
    newSocket.on('playersUpdated', (updatedPlayers: Player[]) => {
      console.log('[GameStore] Received playersUpdated:', updatedPlayers);
      useGameStore.setState({ players: updatedPlayers });
    });

    // Listen for when a single player finishes
    newSocket.on('playerFinished', (data: { playerId: string, time: number, players: Player[] }) => {
      console.log('[GameStore] Received playerFinished:', data);
      // When a player finishes, the server sends the FULL updated player list
      // This ensures all clients are in sync
      useGameStore.setState({ players: data.players });
    });

    // Listen for when the entire race is finished (e.g., time's up)
    newSocket.on('raceFinished', (data: { reason: string, serverTime: number }) => {
      console.log('[Store] Race finished:', data.reason, 'at server time:', data.serverTime);
      set({ gameState: 'finished' });
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
