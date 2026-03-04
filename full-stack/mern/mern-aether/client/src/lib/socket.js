import { io } from 'socket.io-client'

const FALLBACK_SOCKET = 'http://localhost:5050'

export const createCollaborationSocket = () => {
  const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || FALLBACK_SOCKET
  return io(url, {
    transports: ['websocket'],
    autoConnect: false,
  })
}
