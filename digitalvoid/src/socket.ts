import { io } from 'socket.io-client'

export const socket = io('http://localhost:6139', {
  withCredentials: true,
  autoConnect: false,
})

socket.on('connect_error', (err) => {
  console.error('Socket rechazado:', err.message)
})

socket.on('connect', () => {
  console.log('Socket conectado:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('Socket desconectado:', reason)
})