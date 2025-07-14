import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { generateRoomName } from './roomUtils';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure allowed origins
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];

console.log('Allowed origins:', allowedOrigins);

// Configure CORS for Express
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configure CORS for Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store active rooms
const rooms = new Map();
const raceTimers = new Map(); // Store race timers for each room

// NEW: Centralized point calculation function
const calculatePoints = (player: any): number => {
  const basePoints = (player.wpm || 0) * 10;
  const errorPenalty = (player.errors || 0) * 3;
  const progressBonus = Math.round((player.progress || 0) / 5);
  const speedBonus = (player.wpm || 0) > 60 ? ((player.wpm || 0) - 60) * 2 : 0;
  const accuracyBonus = (player.errors || 0) === 0 && (player.progress || 0) > 10 ? 50 : 0;
  
  return Math.max(0, basePoints - errorPenalty + progressBonus + speedBonus + accuracyBonus);
};

// Race timer management
function startRaceTimer(roomId: string, duration: number) {
  const timer = setInterval(() => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') {
      clearInterval(timer);
      raceTimers.delete(roomId);
      return;
    }

    const elapsed = (Date.now() - room.startTime) / 1000;
    const remaining = Math.max(0, duration - elapsed);

    // Send precise server time updates
    io.to(roomId).emit('raceTimer', {
      elapsed,
      remaining,
      serverTime: Date.now()
    });

    // End race when time is up
    if (remaining <= 0) {
      clearInterval(timer);
      raceTimers.delete(roomId);
      room.gameState = 'finished';
      io.to(roomId).emit('raceFinished', { 
        reason: 'timeUp', 
        serverTime: Date.now() 
      });
    }
  }, 250); // 250ms for smooth updates without overwhelming network

  raceTimers.set(roomId, timer);
}

// Helper function to handle player leaving (either explicit leave or disconnect)
function handlePlayerLeaving(socketId: string, isExplicitLeave: boolean = false) {
  // Find and remove player from rooms
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.has(socketId)) {
      const leavingPlayer = room.players.get(socketId);
      const isAdmin = room.admin === socketId;
      
      // For admin disconnections (not explicit leaves), don't immediately delete the room
      // Instead, mark the admin as disconnected and give them time to reconnect
      if (isAdmin && !isExplicitLeave && room.players.size > 1) {
        console.log(`[ADMIN DISCONNECT] Admin ${socketId} disconnected from room ${roomId}, keeping room alive for reconnection`);
        // Mark the admin player as disconnected but keep them in the room
        const adminPlayer = room.players.get(socketId);
        if (adminPlayer) {
          adminPlayer.disconnected = true;
          adminPlayer.disconnectTime = Date.now();
        }
        
        // Set a timeout to clean up if admin doesn't reconnect within 30 seconds
        setTimeout(() => {
          // Check if the admin has reconnected (different socket ID but same nickname)
          let adminReconnected = false;
          for (const [pid, player] of room.players.entries()) {
            if (player.nickname === leavingPlayer.nickname && !player.disconnected) {
              adminReconnected = true;
              break;
            }
          }
          
          if (!adminReconnected && room.players.has(socketId) && room.players.get(socketId)?.disconnected) {
            console.log(`[ROOM TIMEOUT] Admin ${socketId} did not reconnect within 30s, closing room ${roomId}`);
            // Now actually close the room
            io.to(roomId).emit('roomClosed', { 
              reason: 'host_left',
              message: 'The host has left the room. You will be redirected to the login screen.'
            });
            room.players.clear();
            rooms.delete(roomId);
          }
        }, 30000); // 30 second grace period
        
        return; // Don't delete the player yet, give them time to reconnect
      }
      
      // Remove the player normally
      room.players.delete(socketId);
      
      // If the leaving player is the admin and there are other players (explicit leave)
      if (isAdmin && room.players.size > 0) {
        console.log(`[ROOM CLOSED] Admin ${socketId} explicitly left room ${roomId}, closing room for ${room.players.size} remaining players`);
        // Notify all remaining players that the room is being closed
        io.to(roomId).emit('roomClosed', { 
          reason: 'host_left',
          message: 'The host has left the room. You will be redirected to the login screen.'
        });
        // Remove all players and delete the room
        room.players.clear();
        rooms.delete(roomId);
      } else if (room.players.size === 0) {
        // Room is now empty, delete it
        console.log(`[ROOM DELETED] Room ${roomId} is now empty`);
        rooms.delete(roomId);
      } else {
        // Normal player left, just update the player list
        console.log(`[PLAYER LEFT] Player ${socketId} left room ${roomId}, ${room.players.size} players remaining`);
        io.to(roomId).emit('playerLeft', Array.from(room.players.values()));
      }
      break;
    }
  }
}

app.use(express.json());

// Health check endpoint for deployment services
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'CapyType Race Backend Server',
    version: '1.0.0',
    status: 'Running'
  });
});

// Handle OPTIONS preflight requests for room-info
app.options('/api/room-info', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.status(200).send();
});

// Room info endpoint for frontend validation
app.get('/api/room-info', (req, res) => {
  // Add specific CORS headers for this endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  const code = req.query.code;
  if (!code || typeof code !== 'string') {
    console.log('[room-info] Missing or invalid code:', code);
    return res.status(400).json({ 
      error: 'INVALID_FORMAT', 
      message: 'Invalid room code format' 
    });
  }

  console.log('\n================= ROOM INFO LOOKUP =================');
  console.log('Received room code:', code);
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(code)) {
    console.log('[room-info] Invalid UUID format for code:', code);
    return res.status(400).json({ 
      error: 'INVALID_FORMAT', 
      message: 'Invalid room code format' 
    });
  }
  
  // Normalize the room ID to lowercase for lookup (UUID format)
  const roomIdToLookup = code.trim().toLowerCase();
  
  console.log('Room ID to lookup:  ', roomIdToLookup);
  console.log('Current room keys:  ', Array.from(rooms.keys()));
  // Print a grid of room info
  if (rooms.size > 0) {
    console.log('\n| Room ID                                | Admin Socket ID         | # Players | State     |');
    console.log('|----------------------------------------|------------------------|-----------|-----------|');
    for (const [roomId, room] of rooms.entries()) {
      const admin = room.admin || '-';
      const numPlayers = room.players ? room.players.size : 0;
      const state = room.gameState || '-';
      console.log(`| ${roomId.padEnd(36)} | ${admin.padEnd(22)} | ${String(numPlayers).padEnd(9)} | ${state.padEnd(9)} |`);
    }
    console.log('|----------------------------------------|------------------------|-----------|-----------|\n');
  } else {
    console.log('No rooms currently exist.');
  }

  const room = rooms.get(roomIdToLookup);
  if (!room) {
    console.log('[room-info] Room not found for code:', roomIdToLookup);
    return res.status(404).json({ 
      error: 'ROOM_NOT_FOUND', 
      message: 'Room not found' 
    });
  }

  // Check room status for additional validation
  const playerCount = room.players ? room.players.size : 0;
  const isFull = playerCount >= 32;
  const gameInProgress = room.gameState !== 'waiting';

  const name = generateRoomName(roomIdToLookup);
  console.log('[room-info] Room found. Name:', name, 'ID:', roomIdToLookup);
  
  res.json({ 
    name, 
    id: roomIdToLookup,
    playerCount,
    maxPlayers: 32,
    isFull,
    gameInProgress,
    gameState: room.gameState
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const getNickname = () => {
    // Search all rooms for this socket.id and return the nickname if found
    for (const room of rooms.values()) {
      const player = room.players.get(socket.id);
      if (player) return player.nickname;
    }
    return undefined;
  };

  const logWithInfo = (action: string) => {
    const nickname = getNickname();
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0]; // HH:MM:SS
    console.log(`[${timestamp}] User ${action}: ${socket.id}${nickname ? ' (' + nickname + ')' : ''}`);
  };

  // Store nickname, avatar, and color when user creates or joins a room
  socket.on('createRoom', ({ nickname, avatar, color }) => {
    console.log(`\n[CREATE ROOM] User ${socket.id} creating room`);
    console.log(`  - Nickname: ${nickname}`);
    console.log(`  - Avatar: ${avatar}`);
    console.log(`  - Color: ${color}`);
    
    const roomId = uuidv4().toLowerCase();
    console.log(`  - Generated Room ID: ${roomId}`);
    
    const player = {
      id: socket.id,
      nickname,
      progress: 0,
      wpm: 0,
      errors: 0,
      points: 0, // NEW: Initialize points
      position: 1,
      avatar,
      color,
      disconnected: false
    };
    const room = {
      id: roomId,
      admin: socket.id,
      players: new Map([[socket.id, player]]),
      gameState: 'waiting',
      text: '',
      startTime: null
    };
    rooms.set(roomId, room);
    console.log(`  - Room stored in map, total rooms: ${rooms.size}`);
    console.log(`  - Room keys: [${Array.from(rooms.keys()).join(', ')}]`);
    
    socket.join(roomId);
    
    // Send the plain room ID to the frontend
    console.log(`  - Room code: ${roomId}`);
    
    socket.emit('roomCreated', roomId);
    socket.emit('roomJoined', { roomId, isAdmin: true, nickname });
    io.to(roomId).emit('playerJoined', Array.from(room.players.values()).filter((p: any) => !p.disconnected));
    console.log(`[ROOM CREATED] Room ID: ${roomId} | Admin: ${socket.id} | Nickname: ${nickname}`);
    logWithInfo(`connected and created room with nickname: ${nickname}`);
  });

  socket.on('joinRoom', ({ roomId, nickname, avatar, color }) => {
    console.log(`\n[JOIN ROOM ATTEMPT] User ${socket.id} trying to join room: ${roomId}`);
    console.log(`  - Nickname: ${nickname}`);
    console.log(`  - Avatar: ${avatar}`);
    console.log(`  - Color: ${color}`);
    
    const normalizedRoomId = roomId.toLowerCase();
    console.log(`  - Normalized Room ID: ${normalizedRoomId}`);
    console.log(`  - Available rooms: [${Array.from(rooms.keys()).join(', ')}]`);
    
    const room = rooms.get(normalizedRoomId);
    if (!room) {
      console.log(`  - ERROR: Room ${normalizedRoomId} not found!`);
      console.log(`  - Rooms map size: ${rooms.size}`);
      socket.emit('roomError', { message: 'Room not found' });
      return;
    }
    console.log(`  - SUCCESS: Room ${normalizedRoomId} found with ${room.players.size} players`);
    console.log(`  - Room state: ${room.gameState}`);

    if (room.gameState !== 'waiting') {
      socket.emit('roomError', { message: 'Game has already started' });
      return;
    }

    // Check if a player with the same nickname already exists (potential reconnection)
    let existingPlayerSocketId = null;
    let wasAdmin = false;
    let wasDisconnected = false;
    for (const [socketId, player] of room.players.entries()) {
      if (player.nickname === nickname) {
        existingPlayerSocketId = socketId;
        wasAdmin = room.admin === socketId;
        wasDisconnected = player.disconnected || false;
        console.log(`[RECONNECTION] Found existing player ${nickname} with old socket ID ${socketId}, replacing with new ID ${socket.id}`);
        if (wasDisconnected) {
          console.log(`[ADMIN RECONNECTION] Admin ${nickname} is reconnecting after disconnect`);
        }
        break;
      }
    }

    // Remove the old player entry if this is a reconnection
    if (existingPlayerSocketId) {
      room.players.delete(existingPlayerSocketId);
      console.log(`  - Removed old player entry for ${nickname}`);
      // If the reconnecting player was the admin, transfer admin privileges
      if (wasAdmin) {
        room.admin = socket.id;
        console.log(`[ADMIN TRANSFER] Transferred admin privileges from ${existingPlayerSocketId} to ${socket.id} for player ${nickname}`);
      }
    } else {
      // Check room capacity only for truly new players
      if (room.players.size >= 32) {
        socket.emit('roomError', { message: 'Room is full (32 players max)' });
        return;
      }
    }

    const player = {
      id: socket.id,
      nickname,
      progress: 0,
      wpm: 0,
      errors: 0,
      points: 0, // NEW: Initialize points
      position: room.players.size + 1,
      avatar,
      color,
      disconnected: false  // Ensure reconnected players are marked as connected
    };
    room.players.set(socket.id, player);
    socket.join(normalizedRoomId);
    
    console.log(`  - Added player to room, total players: ${room.players.size}`);
    console.log(`  - Current players: [${Array.from(room.players.values()).map((p: any) => p.nickname).join(', ')}]`);
    
    // Emit roomJoined to the joining player with their admin status
    const isAdmin = room.admin === socket.id;
    socket.emit('roomJoined', { roomId: normalizedRoomId, isAdmin, nickname });
    console.log(`  - Emitted roomJoined to ${socket.id} (isAdmin: ${isAdmin})`);
    
    // Emit playerJoined to all players in the room (including the complete player list)
    // Filter out disconnected players from the list
    const currentPlayers = Array.from(room.players.values()).filter((p: any) => !p.disconnected);
    io.to(normalizedRoomId).emit('playerJoined', currentPlayers);
    console.log(`  - Emitted playerJoined to all players with ${currentPlayers.length} players: [${currentPlayers.map((p: any) => p.nickname).join(', ')}]`);
    
    // For reconnections (especially admin), send an additional player list update after a brief delay
    // This ensures all clients have the most up-to-date player list
    if (existingPlayerSocketId) {
      setTimeout(() => {
        const updatedPlayers = Array.from(room.players.values()).filter((p: any) => !p.disconnected);
        io.to(normalizedRoomId).emit('playerJoined', updatedPlayers);
        console.log(`  - [RECONNECTION SYNC] Sent additional player list update with ${updatedPlayers.length} players`);
      }, 100);
    }
    
    const actionType = existingPlayerSocketId ? 'reconnected to' : 'joined';
    logWithInfo(`${actionType} room ${normalizedRoomId} with nickname: ${nickname}${isAdmin ? ' (admin)' : ''}`);
  });

  // Handle time synchronization ping
  socket.on('timePing', (clientTime) => {
    socket.emit('timePong', Date.now());
  });

  // Start the game
  socket.on('startGame', ({ roomId, text }) => {
    console.log(`[Backend] startGame received from ${socket.id} for room ${roomId}`);
    const room = rooms.get(roomId);
    
    if (!room) {
      console.log(`[Backend] Room ${roomId} not found`);
      socket.emit('error', 'Room not found');
      return;
    }
    
    if (room.admin !== socket.id) {
      console.log(`[Backend] Admin check failed. Room admin: ${room.admin}, Socket ID: ${socket.id}`);
      socket.emit('error', 'Not authorized to start the game');
      return;
    }

    console.log(`[Backend] Starting game in room ${roomId} with text length: ${text?.length || 0}`);
    
    // Calculate race duration based on text length with professional formula
    const textLength = text?.length || 0;
    const baseTime = 30; // Minimum 30 seconds
    const charMultiplier = 0.1; // 100ms per character
    const networkBuffer = 10; // 10 second buffer for network delays
    const raceDuration = Math.max(baseTime, (textLength * charMultiplier) + networkBuffer);
    
    room.gameState = 'countdown';
    room.text = text;
    room.raceDuration = raceDuration;
    
    console.log(`[Backend] Race duration calculated: ${raceDuration}s for ${textLength} characters`);
    
    io.to(roomId).emit('gameStarting', { text, raceDuration });

    // Server-controlled countdown with precise timing
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      io.to(roomId).emit('countdown', { count: countdown, serverTime: Date.now() });
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        room.gameState = 'playing';
        room.startTime = Date.now();
        
        // Start the race timer
        startRaceTimer(roomId, raceDuration);
        
        io.to(roomId).emit('gameStarted', { 
          startTime: room.startTime,
          duration: raceDuration,
          serverTime: Date.now()
        });
      }
    }, 1000);
  });

  // Handle player leaving room (explicit leave vs disconnect)
  socket.on('leaveRoom', () => {
    logWithInfo('leaving room explicitly');
    handlePlayerLeaving(socket.id, true); // true = explicit leave
  });

  // Change player color
  socket.on('changePlayerColor', ({ playerId, color, avatar }) => {
    logWithInfo(`changing color for player ${playerId} to ${color} with avatar ${avatar}`);
    
    // Find the room this player is in
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(playerId)) {
        const player = room.players.get(playerId);
        if (player) {
          // Update the player's color and avatar
          player.color = color;
          if (avatar) {
            player.avatar = avatar;
          }
          
          // Notify all players in the room about the color change
          io.to(roomId).emit('playerColorChanged', { playerId, color, avatar: player.avatar });
          
          logWithInfo(`color and avatar updated for player ${playerId} in room ${roomId}`);
        }
        break;
      }
    }
  });

  // Update player progress
  socket.on('updateProgress', ({ roomId, progress }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;

    const player = room.players.get(socket.id);
    if (player) {
      player.progress = progress;
      io.to(roomId).emit('progressUpdate', {
        playerId: socket.id,
        progress
      });

      // Check if player has completed the text but don't end the race
      if (progress >= 100) {
        const timeTaken = (Date.now() - room.startTime) / 1000;
        const minimumRaceTime = 30; // Minimum race duration in seconds
        
        // If race duration is less than minimum, adjust the time to minimum
        const adjustedTime = Math.max(timeTaken, minimumRaceTime);
        
        io.to(roomId).emit('playerFinished', {
          playerId: socket.id,
          nickname: player.nickname,
          time: adjustedTime
        });
      }
    }
  });

  // Update player stats (WPM, errors, etc.) - separate from progress
  socket.on('updatePlayerStats', (stats) => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        if (player) {
          player.wpm = stats.wpm;
          player.errors = stats.errors;
          player.progress = stats.progress;
          // NEW: Recalculate points on the server
          player.points = calculatePoints(player);

          // Broadcast the updated list of all players to the room
          const updatedPlayers = Array.from(room.players.values());
          io.to(roomId).emit('playersUpdated', updatedPlayers);
        }
        break;
      }
    }
  });

  // Handle player finishing the race
  socket.on('playerFinished', (stats) => {
    logWithInfo(`finished race with stats: ${JSON.stringify(stats)}`);
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        if (player) {
          // Update final stats from the payload
          player.wpm = stats.wpm || player.wpm;
          player.errors = stats.errors || player.errors;
          player.progress = stats.progress || player.progress;
          
          // Recalculate final points
          player.points = calculatePoints(player);

          console.log(`[Backend] Player ${player.nickname} finished with stats:`, {
            wpm: player.wpm,
            errors: player.errors,
            progress: player.progress,
            points: player.points,
            time: stats.time
          });
          
          // Broadcast that this player finished and include the full updated player list
          const timeTaken = stats.time || ((Date.now() - room.startTime) / 1000);
          const minimumRaceTime = 30; // Minimum race duration in seconds
          const adjustedTime = Math.max(timeTaken, minimumRaceTime);
          
          io.to(roomId).emit('playerFinished', { 
            playerId: socket.id, 
            time: adjustedTime,
            players: Array.from(room.players.values()) // Send updated list
          });

          // Check if all players have finished
          const allFinished = Array.from(room.players.values()).every((p: any) => p.progress >= 100);
          if (allFinished) {
            // If all finished, end the race for everyone
            const raceTimer = raceTimers.get(roomId);
            if (raceTimer) {
              clearInterval(raceTimer);
              raceTimers.delete(roomId);
            }
            room.gameState = 'finished';
            io.to(roomId).emit('raceFinished', { 
              reason: 'allPlayersFinished',
              serverTime: Date.now() 
            });
          }
        }
        break;
      }
    }
  });

  // Handle return to lobby
  socket.on('returnToLobby', () => {
    logWithInfo('returning to lobby');
    
    // Find the room this player is in
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(socket.id)) {
        console.log(`[Backend] Player ${socket.id} returning to lobby in room ${roomId}`);
        
        // Reset room to waiting state if in finished state
        if (room.gameState === 'finished') {
          room.gameState = 'waiting';
          room.text = '';
          room.startTime = null;
          room.raceDuration = null;
          
          // Reset all player stats but keep them in the room
          for (const [playerId, player] of room.players.entries()) {
            player.progress = 0;
            player.wpm = 0;
            player.errors = 0;
            player.position = 1;
          }
          
          console.log(`[Backend] Room ${roomId} reset to waiting state`);
          
          // Notify all players in the room that we're back in lobby
          const activePlayers = Array.from(room.players.values()).filter((p: any) => !p.disconnected);
          io.to(roomId).emit('gameStateChanged', { 
            gameState: 'waiting',
            players: activePlayers 
          });
          io.to(roomId).emit('playerJoined', activePlayers);
        }
        break;
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logWithInfo('disconnected');
    handlePlayerLeaving(socket.id, false); // false = disconnect, not explicit leave
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
