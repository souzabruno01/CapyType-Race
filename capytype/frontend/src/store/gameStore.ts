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
  actionQueue: (() => void)[]; // Queue for actions to run on connect
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
  executeOrQueueAction: (action: () => void) => void;
  initializeSocket: () => Socket;
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

console.log('[Store] VITE_BACKEND_URL:', VITE_BACKEND_URL);

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
  actionQueue: [], // Initialize the action queue

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
    roomClosed: null,
    actionQueue: [] // Fix: Reset the action queue
  }),
  connect: () => {
    const { socket, initializeSocket } = get();
    if (!socket || !socket.connected) {
      console.log('[Store] Socket not connected. Initializing...');
      initializeSocket();
    }
  },
  initializeSocket: () => {
    const { socket: existingSocket } = get();
    
    if (existingSocket) {
      // If a socket object exists, we just need to ensure it's connected.
      // The 'connect' event listener below will handle executing the queue.
      if (!existingSocket.connected) {
        existingSocket.connect();
      }
      return existingSocket;
    }

    console.log('[Store] Creating new socket connection to:', VITE_BACKEND_URL);
    const { setConnectionStatus, setError } = get();
    setConnectionStatus('connecting');
    setError(null);

    const newSocket = io(VITE_BACKEND_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    set({ socket: newSocket });

    newSocket.on('connect', () => {
      console.log('[Store] Socket connected:', newSocket.id);
      const { setConnectionStatus, setError, actionQueue } = get();
      setConnectionStatus('connected');
      setError(null);

      // Execute any queued actions
      console.log(`[Store] Executing ${actionQueue.length} queued actions.`);
      actionQueue.forEach(action => {
        try {
          action();
        } catch (error) {
          console.error('[Store] Error executing queued action:', error);
        }
      });
      set({ actionQueue: [] }); // Clear the queue
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



    newSocket.on('roomClosed', (data: { reason: string; message: string }) => {
      console.log('Room closed:', data);
      set({ roomClosed: data });
      // Don't call resetGame() here - let the components handle it after showing the message
    });

    newSocket.on('roomError', (error) => {
      console.error('Room Error:', error.message);
      setError(error.message || 'Room error occurred');
    });

    newSocket.on('error', (error) => {
      console.error('Socket Error:', error);
      setError(typeof error === 'string' ? error : 'Socket error occurred');
    });

    // Handle validation errors from the backend
    newSocket.on('validationError', (error) => {
      console.error('Validation Error:', error);
      const message = error.message || 'Invalid data provided';
      setError(message);
    });

    // Handle server errors from the backend
    newSocket.on('serverError', (error) => {
      console.error('Server Error:', error);
      const message = error.message || 'Server error occurred';
      setError(message);
    });

    // NEW: Listen for updated player data from the server
    newSocket.on('playersUpdated', (updatedPlayers: Player[]) => {
      console.log('[GameStore] Received playersUpdated:', updatedPlayers);
      const { hostId } = get();
      // Preserve host information when updating players
      const playersWithHost = updatedPlayers.map(p => ({
        ...p,
        isHost: p.id === hostId
      }));
      useGameStore.setState({ players: playersWithHost });
    });

    // Listen for player color changes
    newSocket.on('playerColorChanged', ({ playerId, color, avatar }: { playerId: string; color: string; avatar?: string }) => {
      console.log('[GameStore] Received playerColorChanged:', { playerId, color, avatar });
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

    // Listen for when a single player finishes
    newSocket.on('playerFinished', (data: { playerId: string, time: number, players: Player[] }) => {
      console.log('[GameStore] Received playerFinished:', data);
      const { hostId } = get();
      // When a player finishes, the server sends the FULL updated player list
      // Preserve host information when updating players
      const playersWithHost = data.players.map(p => ({
        ...p,
        isHost: p.id === hostId
      }));
      useGameStore.setState({ players: playersWithHost });
    });

    // Listen for when the entire race is finished (e.g., time's up)
    newSocket.on('raceFinished', (data: { reason: string, serverTime: number }) => {
      console.log('[Store] Race finished:', data.reason, 'at server time:', data.serverTime);
      set({ gameState: 'finished' });
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

    return newSocket;
  },
  // New helper function to manage actions
  executeOrQueueAction: (action) => {
    const { socket, initializeSocket, actionQueue } = get();
    console.log('[Store] executeOrQueueAction called, socket state:', { 
      socketExists: !!socket, 
      socketConnected: socket?.connected,
      queueLength: actionQueue.length 
    });
    
    if (socket && socket.connected) {
      console.log('[Store] Socket is connected, executing action immediately');
      action();
    } else {
      console.log('[Store] Socket not connected, queueing action and initializing socket');
      set({ actionQueue: [...actionQueue, action] });
      // Ensure a socket exists and is trying to connect
      initializeSocket();
    }
  },
  createRoom: (nickname, avatar, color) => {
    console.log('[Store] createRoom called with:', { nickname, avatar, color });
    get().executeOrQueueAction(() => {
      const { socket } = get();
      console.log('[Store] Socket connected, creating room...');
      console.log('[Store] Socket state:', { id: socket?.id, connected: socket?.connected });
      // Use the avatar filename, not the full path
      const avatarFile = avatar.split('/').pop() || avatar;
      console.log('[Store] Emitting createRoom with:', { nickname, avatar: avatarFile, color });
      socket?.emit('createRoom', { nickname, avatar: avatarFile, color });
    });
  },
  joinRoom: (roomId, nickname, avatar, color) => {
    get().executeOrQueueAction(() => {
      const { socket } = get();
      console.log('Socket connected, joining room...');
      // Use the avatar filename, not the full path
      const avatarFile = avatar.split('/').pop() || avatar;
      socket?.emit('joinRoom', { roomId, nickname, avatar: avatarFile, color });
    });
  },
}));
