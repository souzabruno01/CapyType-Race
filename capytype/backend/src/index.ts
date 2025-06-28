import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { generateRoomName } from './roomUtils';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

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

function decryptRoomId(cipher: string) {
  // crypto-js AES uses OpenSSL format: Salted__ + 8 bytes salt + ciphertext
  // We need to extract the salt and derive the key/iv as crypto-js does
  const CryptoJS = require('crypto-js');
  const SECRET = process.env.ROOM_ID_SECRET || 'capytype-shared-secret';
  // Decrypt using crypto-js for perfect compatibility
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Room info endpoint for frontend validation
app.get('/api/room-info', (req, res) => {
  const code = req.query.code;
  if (!code || typeof code !== 'string') {
    console.log('[room-info] Missing or invalid code:', code);
    return res.status(400).json({ error: 'Missing or invalid code' });
  }

  let roomIdToLookup = '';
  try {
    // The frontend always sends an encrypted code for validation.
    // We must decrypt it to get the raw room ID.
    const decrypted = decryptRoomId(code);
    if (decrypted) {
      roomIdToLookup = decrypted.toLowerCase();
    }
  } catch (e) {
    // This catch block will handle any unexpected errors during decryption.
    console.error('[room-info] Error during decryption:', e);
  }
  console.log('\n================= ROOM INFO LOOKUP =================');
  console.log('Requested code:     ', code);
  console.log('Decrypted code:     ', roomIdToLookup || '(decryption failed or empty)');
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

  const room = roomIdToLookup ? rooms.get(roomIdToLookup) : undefined;
  if (!room) {
    console.log('[room-info] Room not found for decrypted code:', roomIdToLookup);
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

  // Store nickname and avatar when user creates or joins a room
  socket.on('createRoom', ({ nickname, avatar }) => {
    console.log(`User connected: ${socket.id} with nickname: ${nickname}, avatar: ${avatar}`);
    const roomId = uuidv4().toLowerCase();
    const room = {
      id: roomId,
      admin: socket.id,
      players: new Map([[socket.id, { id: socket.id, nickname, progress: 0, avatar }]]),
      gameState: 'waiting',
      text: '',
      startTime: null
    };
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    io.to(roomId).emit('playerJoined', Array.from(room.players.values()));
    console.log(`[ROOM CREATED] Room ID: ${roomId} | Admin: ${socket.id} | Nickname: ${nickname}`);
    logWithInfo(`connected and created room with nickname: ${nickname}`);
  });

  socket.on('joinRoom', ({ roomId, nickname, avatar }) => {
    console.log(`User connected: ${socket.id} with nickname: ${nickname}, avatar: ${avatar}`);
    const normalizedRoomId = roomId.toLowerCase();
    const room = rooms.get(normalizedRoomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.gameState !== 'waiting') {
      socket.emit('error', 'Game has already started');
      return;
    }

    if (room.players.size >= 32) {
      socket.emit('error', 'Room is full (32 players max)');
      return;
    }

    room.players.set(socket.id, { id: socket.id, nickname, progress: 0, avatar });
    socket.join(normalizedRoomId);
    io.to(normalizedRoomId).emit('playerJoined', Array.from(room.players.values()));
    console.log(`[ROOM JOIN] Room ID: ${normalizedRoomId} | Nickname: ${nickname} | Socket: ${socket.id}`);
    logWithInfo(`connected and joined room ${normalizedRoomId} with nickname: ${nickname}`);
  });

  // Start the game
  socket.on('startGame', ({ roomId, text }) => {
    const room = rooms.get(roomId);
    if (!room || room.admin !== socket.id) {
      socket.emit('error', 'Not authorized to start the game');
      return;
    }

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
    // Find and remove player from rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        io.to(roomId).emit('playerLeft', Array.from(room.players.values()));
        
        // If room is empty, delete it
        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
