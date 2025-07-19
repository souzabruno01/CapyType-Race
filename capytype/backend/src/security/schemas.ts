import { z } from 'zod';

// Schema for creating a room or joining with a new player
export const PlayerSchema = z.object({
  nickname: z.string().trim().min(1, { message: "Nickname cannot be empty." }).max(20, { message: "Nickname cannot be longer than 20 characters." }),
  avatar: z.string().regex(/^Capy-face-\w+\.png$/, { message: "Invalid avatar format." }),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
});

// Schema for joining an existing room
export const JoinRoomSchema = PlayerSchema.extend({
  roomId: z.string().uuid({ message: "Invalid Room ID format." }),
});

// Schema for starting a game
export const StartGameSchema = z.object({
  roomId: z.string().uuid(),
  text: z.string().min(10).max(2000).optional(), // Optional text - if not provided, will be generated
  category: z.enum(['quotes', 'code', 'facts', 'stories', 'technical', 'literature']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Schema for player progress updates
export const UpdateProgressSchema = z.object({
  roomId: z.string().uuid(),
  progress: z.number().min(0).max(100),
});

// Schema for player stats updates
export const UpdatePlayerStatsSchema = z.object({
  wpm: z.number().min(0).max(500), // Generous but sane limits
  errors: z.number().min(0).max(1000),
  progress: z.number().min(0).max(100),
});

// Schema for player finishing the race
export const PlayerFinishedSchema = z.object({
  wpm: z.number().min(0).max(500),
  errors: z.number().min(0).max(1000),
  progress: z.number().min(0).max(100),
  time: z.number().min(0),
});

// Schema for changing player color/avatar
export const ChangePlayerDetailsSchema = z.object({
  playerId: z.string(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  avatar: z.string().regex(/^Capy-face-\w+\.png$/).optional(), // Match the same format as PlayerSchema
});
