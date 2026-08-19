import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getRandomQuestion, QuestionItem } from './questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Health Check Endpoint for Render Keep-Alive
app.get('/health', (req, res) => {
  res.status(200).send('OK - Server Active');
});

// Serve static frontend files if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path.startsWith('/health')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Keep-Alive Self-Ping for Render Free Tier (pings every 40 seconds)
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_EXTERNAL_URL) {
  const pingUrl = `${RENDER_EXTERNAL_URL.replace(/\/$/, '')}/health`;
  console.log(`[Keep-Alive] Configured self-ping to ${pingUrl} every 40 seconds`);
  setInterval(() => {
    fetch(pingUrl)
      .then((r) => r.text())
      .then((txt) => console.log(`[Keep-Alive] Self-ping result: ${txt}`))
      .catch((err) => console.warn(`[Keep-Alive] Self-ping warning:`, err.message));
  }, 40 * 1000);
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

export interface Player {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female' | 'neutral';
  score: number;
  streak: number;
  truthsDone: number;
  daresDone: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
}

export interface CustomPrompt {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  author: string;
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  turnMode: 'random' | 'staggered';
  lastGenderTurn?: 'male' | 'female' | 'neutral';
  activeCategory: 'all' | 'classic' | 'party' | 'deep' | 'spicy' | 'couples' | 'icebreaker';
  currentTurnPlayerId: string | null;
  gameState: 'idle' | 'spinning' | 'choosing' | 'answering' | 'verdict' | 'verifying';
  currentQuestion: {
    id?: string;
    type: 'truth' | 'dare';
    text: string;
    category: string;
    intensity: string;
  } | null;
  questionTimer: number;
  usedQuestionIds: string[];
  customPrompts: CustomPrompt[];
}

const rooms = new Map<string, Room>();

// Matchmaking Queue for complementary/opposite gender pairing
interface MatchQueueUser {
  socketId: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female' | 'neutral';
  preference: 'opposite' | 'any';
  matchMode: 'erotic' | 'normal';
}
const matchQueue: MatchQueueUser[] = [];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getNextStaggeredPlayer(room: Room): Player | null {
  if (room.players.length === 0) return null;
  if (room.players.length === 1) return room.players[0];

  const males = room.players.filter((p) => p.gender === 'male');
  const females = room.players.filter((p) => p.gender === 'female');
  const neutrals = room.players.filter((p) => p.gender === 'neutral');

  // If we have both males and females, alternate
  if (males.length > 0 && females.length > 0) {
    const targetGender = room.lastGenderTurn === 'male' ? 'female' : 'male';
    const candidates = targetGender === 'male' ? males : females;

    // Pick candidate least recently picked or random
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex];
    room.lastGenderTurn = chosen.gender;
    return chosen;
  }

  // Fallback if only one gender present or all neutral
  const remaining = room.players.filter((p) => p.id !== room.currentTurnPlayerId);
  const pool = remaining.length > 0 ? remaining : room.players;
  return pool[Math.floor(Math.random() * pool.length)];
}

function checkMatchmaking() {
  if (matchQueue.length < 2) return;

  // Try to find male + female pair first
  let idx1 = -1;
  let idx2 = -1;

  for (let i = 0; i < matchQueue.length; i++) {
    for (let j = i + 1; j < matchQueue.length; j++) {
      const u1 = matchQueue[i];
      const u2 = matchQueue[j];

      const isOpposite =
        (u1.gender === 'male' && u2.gender === 'female') ||
        (u1.gender === 'female' && u2.gender === 'male');

      if (isOpposite || u1.preference === 'any' || u2.preference === 'any') {
        idx1 = i;
        idx2 = j;
        break;
      }
    }
    if (idx1 !== -1) break;
  }

  // Fallback to any two players if queue > 2
  if (idx1 === -1 && matchQueue.length >= 2) {
    idx1 = 0;
    idx2 = 1;
  }

  if (idx1 !== -1 && idx2 !== -1) {
    const user1 = matchQueue[idx1];
    const user2 = matchQueue[idx2];

    const s1 = io.sockets.sockets.get(user1.socketId);
    const s2 = io.sockets.sockets.get(user2.socketId);

    if (s1 && s2) {
      // Remove from queue (higher index first)
      matchQueue.splice(idx2, 1);
      matchQueue.splice(idx1, 1);

      const roomCode = 'DATE_' + generateRoomCode();
      
      s1.join(roomCode);
      s2.join(roomCode);

      const player1: Player = {
        id: user1.socketId,
        name: user1.name,
        avatar: user1.avatar,
        gender: user1.gender,
        score: 0,
        streak: 0,
        truthsDone: 0,
        daresDone: 0,
        isMuted: false,
        isVideoOff: false,
        isHost: true
      };

      const player2: Player = {
        id: user2.socketId,
        name: user2.name,
        avatar: user2.avatar,
        gender: user2.gender,
        score: 0,
        streak: 0,
        truthsDone: 0,
        daresDone: 0,
        isMuted: false,
        isVideoOff: false,
        isHost: false
      };

      // Determine category: if either user selected erotic, set mode to spicy/couples with pending consent if one selected normal
      const isEroticRequested = user1.matchMode === 'erotic' || user2.matchMode === 'erotic';
      const initialCategory = isEroticRequested ? 'spicy' : 'classic';

      const newRoom: Room = {
        code: roomCode,
        hostId: user1.socketId,
        players: [player1, player2],
        turnMode: 'staggered',
        activeCategory: initialCategory,
        currentTurnPlayerId: null,
        gameState: 'idle',
        currentQuestion: null,
        questionTimer: 60,
        usedQuestionIds: [],
        customPrompts: []
      };

      rooms.set(roomCode, newRoom);

      console.log(`[Matchmaker] Auto-connected ${user1.name} (${user1.gender}, ${user1.matchMode}) & ${user2.name} (${user2.gender}, ${user2.matchMode}) into room ${roomCode}`);

      io.to(roomCode).emit('room-updated', newRoom);

      s1.emit('match-found', { roomCode, peerName: user2.name, player: player1, room: newRoom, requestedMode: user2.matchMode });
      s2.emit('match-found', { roomCode, peerName: user1.name, player: player2, room: newRoom, requestedMode: user1.matchMode });

      // Signal WebRTC peer join to kick off video stream handshake!
      // Emit peer-joined only to s1 (the room initiator) to prevent SDP offer collisions!
      s1.emit('peer-joined', { peerId: user2.socketId, player: player2 });

      // If one user requested erotic mode, send consent prompt to opponent!
      if (user1.matchMode === 'erotic' && user2.matchMode !== 'erotic') {
        s2.emit('consent-request-mode', { requesterName: user1.name, proposedMode: 'erotic' });
      } else if (user2.matchMode === 'erotic' && user1.matchMode !== 'erotic') {
        s1.emit('consent-request-mode', { requesterName: user2.name, proposedMode: 'erotic' });
      }
    }
  }
}

// Continuous automatic matchmaking loop sweeping every 2 seconds
setInterval(checkMatchmaking, 2000);

io.on('connection', (socket: Socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create Room
  socket.on('create-room', ({ name, avatar, gender, turnMode, category }, callback) => {
    const code = generateRoomCode();
    const newPlayer: Player = {
      id: socket.id,
      name: name || 'Player 1',
      avatar: avatar || '🔥',
      gender: gender || 'neutral',
      score: 0,
      streak: 0,
      truthsDone: 0,
      daresDone: 0,
      isMuted: false,
      isVideoOff: false,
      isHost: true
    };

    const newRoom: Room = {
      code,
      hostId: socket.id,
      players: [newPlayer],
      turnMode: turnMode || 'staggered',
      activeCategory: category || 'all',
      currentTurnPlayerId: null,
      gameState: 'idle',
      currentQuestion: null,
      questionTimer: 60,
      usedQuestionIds: [],
      customPrompts: []
    };

    rooms.set(code, newRoom);
    socket.join(code);

    if (callback) callback({ success: true, room: newRoom, player: newPlayer });
    io.to(code).emit('room-updated', newRoom);
  });

  // Join Room
  socket.on('join-room', ({ code, name, avatar, gender }, callback) => {
    const cleanCode = (code || '').toUpperCase().trim();
    const room = rooms.get(cleanCode);

    if (!room) {
      if (callback) callback({ success: false, error: 'Room not found' });
      return;
    }

    const existingPlayer = room.players.find((p) => p.id === socket.id);
    if (!existingPlayer) {
      const newPlayer: Player = {
        id: socket.id,
        name: name || `Player ${room.players.length + 1}`,
        avatar: avatar || '✨',
        gender: gender || 'neutral',
        score: 0,
        streak: 0,
        truthsDone: 0,
        daresDone: 0,
        isMuted: false,
        isVideoOff: false,
        isHost: room.players.length === 0
      };
      room.players.push(newPlayer);
    }

    socket.join(cleanCode);

    // Notify existing peers to initiate WebRTC connections
    socket.to(cleanCode).emit('peer-joined', {
      peerId: socket.id,
      player: room.players.find((p) => p.id === socket.id)
    });

    if (callback) callback({ success: true, room, player: room.players.find((p) => p.id === socket.id) });
    io.to(cleanCode).emit('room-updated', room);
  });

  // WebRTC Signaling
  socket.on('signal-offer', ({ targetId, offer }) => {
    io.to(targetId).emit('signal-offer', { senderId: socket.id, offer });
  });

  socket.on('signal-answer', ({ targetId, answer }) => {
    io.to(targetId).emit('signal-answer', { senderId: socket.id, answer });
  });

  socket.on('signal-ice-candidate', ({ targetId, candidate }) => {
    io.to(targetId).emit('signal-ice-candidate', { senderId: socket.id, candidate });
  });

  // Toggle Media Status (Mute / Video Off)
  socket.on('toggle-media', ({ code, isMuted, isVideoOff }) => {
    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      if (typeof isMuted === 'boolean') player.isMuted = isMuted;
      if (typeof isVideoOff === 'boolean') player.isVideoOff = isVideoOff;
      io.to(code).emit('room-updated', room);
    }
  });

  // Room Settings update (Host only)
  socket.on('update-room-settings', ({ code, turnMode, category, timerDuration }) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;

    if (turnMode) room.turnMode = turnMode;
    if (category) room.activeCategory = category;
    if (timerDuration) room.questionTimer = timerDuration;

    io.to(code).emit('room-updated', room);
  });

  // Spin Wheel to select next player
  socket.on('spin-wheel', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.players.length === 0) return;

    let targetPlayer: Player | null = null;
    if (room.turnMode === 'staggered') {
      targetPlayer = getNextStaggeredPlayer(room);
    } else {
      // Random mode
      const available = room.players.filter((p) => p.id !== room.currentTurnPlayerId);
      const pool = available.length > 0 ? available : room.players;
      targetPlayer = pool[Math.floor(Math.random() * pool.length)];
    }

    if (!targetPlayer) return;

    room.currentTurnPlayerId = targetPlayer.id;
    room.gameState = 'spinning';
    room.currentQuestion = null;

    io.to(code).emit('wheel-spinning', {
      targetPlayerId: targetPlayer.id,
      targetPlayerName: targetPlayer.name
    });

    // After spin animation delay (3.5 seconds), update room state to 'choosing'
    setTimeout(() => {
      if (rooms.has(code)) {
        const currentRoom = rooms.get(code)!;
        currentRoom.gameState = 'choosing';
        io.to(code).emit('room-updated', currentRoom);
      }
    }, 3500);
  });

  // Select Choice: Truth or Dare
  socket.on('select-choice', ({ code, choice }) => {
    const room = rooms.get(code);
    if (!room) return;

    // Check custom prompts first or draw random
    let selectedPrompt: { id?: string; type: 'truth' | 'dare'; text: string; category: string; intensity: string } | null = null;

    const availableCustom = room.customPrompts.filter((cp) => cp.type === choice);
    if (availableCustom.length > 0 && Math.random() < 0.35) {
      // 35% chance to draw custom prompt if available!
      const cpIndex = Math.floor(Math.random() * availableCustom.length);
      const cp = availableCustom[cpIndex];
      selectedPrompt = {
        type: cp.type,
        text: `${cp.text} (Submitted by ${cp.author})`,
        category: 'custom',
        intensity: 'wild'
      };
      // remove used custom prompt
      room.customPrompts = room.customPrompts.filter((p) => p.id !== cp.id);
    } else {
      const q = getRandomQuestion(choice as 'truth' | 'dare', room.activeCategory, room.usedQuestionIds);
      room.usedQuestionIds.push(q.id);
      selectedPrompt = {
        id: q.id,
        type: q.type,
        text: q.text,
        category: q.category,
        intensity: q.intensity
      };
    }

    room.currentQuestion = selectedPrompt;
    room.gameState = 'answering';

    io.to(code).emit('card-revealed', {
      question: selectedPrompt,
      turnPlayerId: room.currentTurnPlayerId,
      timerSeconds: room.questionTimer
    });

    io.to(code).emit('room-updated', room);
  });

  // Reroll Question
  socket.on('reroll-question', ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.currentQuestion) return;

    const q = getRandomQuestion(room.currentQuestion.type, room.activeCategory, room.usedQuestionIds);
    room.usedQuestionIds.push(q.id);
    room.currentQuestion = {
      id: q.id,
      type: q.type,
      text: q.text,
      category: q.category,
      intensity: q.intensity
    };

    io.to(code).emit('card-revealed', {
      question: room.currentQuestion,
      turnPlayerId: room.currentTurnPlayerId,
      timerSeconds: room.questionTimer
    });
    io.to(code).emit('room-updated', room);
  });

  // Request Opponent Dare Verification
  socket.on('request-dare-verification', ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.currentTurnPlayerId) return;

    const turnPlayer = room.players.find((p) => p.id === room.currentTurnPlayerId);
    if (!turnPlayer) return;

    // Set game state to verifying
    room.gameState = 'verifying';

    io.to(code).emit('dare-verification-requested', {
      turnPlayerId: turnPlayer.id,
      turnPlayerName: turnPlayer.name,
      question: room.currentQuestion
    });
    io.to(code).emit('room-updated', room);
  });

  // Opponent Verdict: Accept (+10 Pts) or Reject (-5 Pts)
  socket.on('submit-opponent-verdict', ({ code, accepted }) => {
    const room = rooms.get(code);
    if (!room || !room.currentTurnPlayerId) return;

    const player = room.players.find((p) => p.id === room.currentTurnPlayerId);
    const verifier = room.players.find((p) => p.id === socket.id);

    if (player) {
      if (accepted) {
        player.score += 10;
        player.streak += 1;
        if (room.currentQuestion?.type === 'truth') player.truthsDone += 1;
        if (room.currentQuestion?.type === 'dare') player.daresDone += 1;

        io.to(code).emit('verdict-result', {
          verdict: 'completed',
          player,
          points: 10,
          question: room.currentQuestion,
          verifierName: verifier ? verifier.name : 'Opponent'
        });
      } else {
        player.score = Math.max(0, player.score - 5);
        player.streak = 0;

        io.to(code).emit('verdict-result', {
          verdict: 'forfeited',
          player,
          points: -5,
          question: room.currentQuestion,
          verifierName: verifier ? verifier.name : 'Opponent'
        });
      }
    }

    room.gameState = 'idle';
    room.currentQuestion = null;
    io.to(code).emit('room-updated', room);
  });

  // Legacy direct verdict fallback
  socket.on('submit-verdict', ({ code, verdict }) => {
    const room = rooms.get(code);
    if (!room || !room.currentTurnPlayerId) return;

    const player = room.players.find((p) => p.id === room.currentTurnPlayerId);
    if (player) {
      if (verdict === 'completed') {
        player.score += 10;
        player.streak += 1;
        if (room.currentQuestion?.type === 'truth') player.truthsDone += 1;
        if (room.currentQuestion?.type === 'dare') player.daresDone += 1;

        io.to(code).emit('verdict-result', {
          verdict: 'completed',
          player,
          points: 10,
          question: room.currentQuestion
        });
      } else {
        player.score = Math.max(0, player.score - 5);
        player.streak = 0;

        io.to(code).emit('verdict-result', {
          verdict: 'forfeited',
          player,
          points: -5,
          question: room.currentQuestion
        });
      }
    }

    room.gameState = 'idle';
    room.currentQuestion = null;
    io.to(code).emit('room-updated', room);
  });

  // Add Custom Prompt
  socket.on('add-custom-prompt', ({ code, type, text }) => {
    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    const newPrompt: CustomPrompt = {
      id: Date.now().toString(),
      type: type || 'truth',
      text: text.trim(),
      author: player ? player.name : 'Anonymous'
    };

    room.customPrompts.push(newPrompt);
    io.to(code).emit('room-updated', room);
    io.to(code).emit('chat-message', {
      id: Date.now().toString(),
      sender: 'System',
      text: `✨ ${newPlayerName(player)} added a custom ${type.toUpperCase()} prompt to the deck!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  });

  // Chat message
  socket.on('send-chat', ({ code, message }) => {
    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    io.to(code).emit('chat-message', {
      id: Date.now().toString(),
      sender: player ? player.name : 'Guest',
      avatar: player ? player.avatar : '💬',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Floating Emoji Reaction
  socket.on('send-reaction', ({ code, emoji, targetPlayerId }) => {
    io.to(code).emit('reaction-received', {
      emoji,
      senderId: socket.id,
      targetPlayerId
    });
  });

  // Matchmaking Queue
  socket.on('join-matchmaking', ({ name, avatar, gender, preference, matchMode }) => {
    const existingIdx = matchQueue.findIndex((u) => u.socketId === socket.id);
    if (existingIdx !== -1) matchQueue.splice(existingIdx, 1);

    matchQueue.push({
      socketId: socket.id,
      name: name || 'Match Player',
      avatar: avatar || '⚡',
      gender: gender || 'neutral',
      preference: preference || 'opposite',
      matchMode: matchMode || 'erotic'
    });

    socket.emit('matchmaking-queued', { position: matchQueue.length });
    checkMatchmaking();
  });

  // Respond to Erotic Mode consent request
  socket.on('respond-mode-consent', ({ code, accept }) => {
    const room = rooms.get(code);
    if (!room) return;

    if (accept) {
      room.activeCategory = 'spicy';
      io.to(code).emit('chat-message', {
        id: Date.now().toString(),
        sender: 'System',
        text: '🔥 Opponent Accepted Erotic Mode! Deck set to Spicy & Romantic.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    } else {
      room.activeCategory = 'classic';
      io.to(code).emit('chat-message', {
        id: Date.now().toString(),
        sender: 'System',
        text: '🧊 Opponent preferred Normal Mode. Deck set to Classic.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    }

    io.to(code).emit('room-updated', room);
  });

  // Mark / Rate Opponent
  socket.on('mark-opponent', ({ code, targetPlayerId, badgeTag, rating }) => {
    const room = rooms.get(code);
    const senderPlayer = room?.players.find((p) => p.id === socket.id);

    io.to(code).emit('opponent-marked', {
      senderName: senderPlayer ? senderPlayer.name : 'Opponent',
      targetPlayerId,
      badgeTag, // 'spicy' | 'polite' | 'fun' | 'reported'
      rating
    });
  });

  socket.on('leave-matchmaking', () => {
    const idx = matchQueue.findIndex((u) => u.socketId === socket.id);
    if (idx !== -1) matchQueue.splice(idx, 1);
    socket.emit('matchmaking-cancelled');
  });

  // Skip Partner (Auto Find Next Partner of Opposite Sex)
  socket.on('skip-partner', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    const partner = room.players.find((p) => p.id !== socket.id);

    // Leave socket room
    socket.leave(code);
    socket.to(code).emit('peer-left', { peerId: socket.id });

    // Clean up current room
    rooms.delete(code);

    if (player) {
      // Re-queue skipper into matchmaking pool
      matchQueue.push({
        socketId: socket.id,
        name: player.name,
        avatar: player.avatar,
        gender: player.gender,
        preference: 'opposite',
        matchMode: 'erotic'
      });
      socket.emit('matchmaking-queued', { position: matchQueue.length });
    }

    if (partner) {
      const partnerSocket = io.sockets.sockets.get(partner.id);
      if (partnerSocket) {
        partnerSocket.leave(code);
        matchQueue.push({
          socketId: partner.id,
          name: partner.name,
          avatar: partner.avatar,
          gender: partner.gender,
          preference: 'opposite',
          matchMode: 'erotic'
        });
        partnerSocket.emit('partner-skipped', { message: 'Your partner skipped. Finding next match...' });
        partnerSocket.emit('matchmaking-queued', { position: matchQueue.length });
      }
    }

    console.log(`[Skip] Partner skipped in room ${code}. Re-queuing players for next match.`);

    // Trigger instant checkMatchmaking to pair with available opposite-sex partners
    checkMatchmaking();
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);

    // Remove from matchQueue if present
    const qIdx = matchQueue.findIndex((u) => u.socketId === socket.id);
    if (qIdx !== -1) matchQueue.splice(qIdx, 1);

    // Clean up rooms
    rooms.forEach((room, code) => {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        socket.to(code).emit('peer-left', { peerId: socket.id });

        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          // Reassign host if host left
          if (room.hostId === socket.id) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
          }
          if (room.currentTurnPlayerId === socket.id) {
            room.currentTurnPlayerId = null;
            room.gameState = 'idle';
          }
          io.to(code).emit('room-updated', room);
        }
      }
    });
  });
});

function newPlayerName(p?: Player) {
  return p ? p.name : 'Someone';
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🔥 Truth or Dare Signaling Server running on http://localhost:${PORT}`);
});
