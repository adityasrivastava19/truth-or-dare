import { io, Socket } from 'socket.io-client';

// Use same host or fallback to localhost:3001
const URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';

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
