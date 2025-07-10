import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { generateRoomName } from './roomUtils';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

// Load environment variables
dotenv.config();

const SECRET = 'capytype-shared-secret'; // Must match frontend secret

// Utility functions for room ID encryption/decryption
function decryptRoomId(cipher: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.log('[DECRYPT ERROR] Failed to decrypt room ID:', cipher);
    return '';
  }
}

const app = express();
const httpServer = createServer(app);

// Configure allowed origins
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

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

// Room info endpoint for frontend validation
app.get('/api/room-info', (req, res) => {
  const code = req.query.code;
  if (!code || typeof code !== 'string') {
    console.log('[room-info] Missing or invalid code:', code);
    return res.status(400).json({ error: 'Missing or invalid code' });
  }

  console.log('\n================= ROOM INFO LOOKUP =================');
  console.log('Received encrypted code:', code);
  
  // Decrypt the room ID
  const decryptedRoomId = decryptRoomId(code);
  if (!decryptedRoomId) {
    console.log('[room-info] Failed to decrypt room ID');
    return res.status(400).json({ error: 'Invalid room code format' });
  }
  
  // Normalize the room ID to lowercase for lookup
  const roomIdToLookup = decryptedRoomId.trim().toLowerCase();
  
  console.log('Decrypted room ID:  ', decryptedRoomId);
  console.log('Normalized room ID: ', roomIdToLookup);
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
    return res.status(404).json({ error: 'Room not found' });
  }
  const name = generateRoomName(roomIdToLookup);
  console.log('[room-info] Room found. Name:', name, 'ID:', roomIdToLookup);
  res.json({ name, id: roomIdToLookup });
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
    room.gameState = 'countdown';
    room.text = text;
    io.to(roomId).emit('gameStarting', { text });

    // Start countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      io.to(roomId).emit('countdown', countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        room.gameState = 'playing';
        room.startTime = Date.now();
        io.to(roomId).emit('gameStarted');
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

      // Check if player has completed the text
      if (progress >= 100) {
        const timeTaken = (Date.now() - room.startTime) / 1000;
        io.to(roomId).emit('playerFinished', {
          playerId: socket.id,
          nickname: player.nickname,
          time: timeTaken
        });
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
