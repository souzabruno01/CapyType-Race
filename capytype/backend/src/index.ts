import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('createRoom', (nickname: string) => {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      admin: socket.id,
      players: new Map([[socket.id, { id: socket.id, nickname, progress: 0 }]]),
      gameState: 'waiting',
      text: '',
      startTime: null
    };
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    io.to(roomId).emit('playerJoined', Array.from(room.players.values()));
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomId, nickname }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.gameState !== 'waiting') {
      socket.emit('error', 'Game has already started');
      return;
    }

    room.players.set(socket.id, { id: socket.id, nickname, progress: 0 });
    socket.join(roomId);
    io.to(roomId).emit('playerJoined', Array.from(room.players.values()));
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
    console.log('User disconnected:', socket.id);
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
