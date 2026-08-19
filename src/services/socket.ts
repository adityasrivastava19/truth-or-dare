import { io, Socket } from 'socket.io-client';

// Use same origin in production / deployed host, fallback to localhost:3001 in local dev
const URL = (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'))
  ? window.location.origin
  : 'http://localhost:3001';

export const socket: Socket = io(URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export function connectSocket(): Socket {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}
