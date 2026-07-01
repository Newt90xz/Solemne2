<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useGameStore } from '../stores/game'
import { socket } from '../socket'
import type { Lobby } from '../types/lobby'

const emit = defineEmits<{
  (e: 'go-back'): void
  (e: 'startGame', lobby: Lobby): void
}>()

const gameStore = useGameStore()
const lobbies = ref<Lobby[]>([])
const lobbyName = ref('')
const lobbyMaxPlayers = ref(2)
const creatingLobby = ref(false)
const joiningLobby = ref(false)
const loadingLobbies = ref(false)
const errorMessage = ref('')
const currentLobby = ref<Lobby | null>(null)

const apihost = 'http://localhost:6139/api'

async function loadLobbies() {
  loadingLobbies.value = true
  try {
    const res = await axios.get<Array<Record<string, unknown>>>(`${apihost}/lobbies`)
    lobbies.value = res.data.map((lobby: Record<string, unknown>) => ({
      id: (lobby.id as string) || (lobby._id as { toString(): string })?.toString() || '',
      _id: (lobby._id as { toString(): string })?.toString(),
      name: lobby.name as string,
      host: (lobby.host as string) || (lobby.hostUsername as string),
      hostUsername: lobby.hostUsername as string,
      players: lobby.players as string[],
      maxPlayers: lobby.maxPlayers as number,
      isActive: lobby.isActive as boolean,
    }))
  } catch (err) {
    console.error('Error loading lobbies:', err)
    errorMessage.value = 'Error loading lobbies'
  } finally {
    loadingLobbies.value = false
  }
}

function getLobbyId(lobby: Lobby): string {
  return lobby.id || lobby._id || ''
}

function joinLobby(lobby: Lobby) {
  console.log('Joining lobby:', lobby)
  socket.emit('lobby:join', getLobbyId(lobby))
}

async function createLobby() {
  if (!lobbyName.value.trim()) {
    errorMessage.value = 'Enter a lobby name'
    return
  }
  creatingLobby.value = true
  try {
    const res = await axios.post(
      `${apihost}/lobbies`,
      { name: lobbyName.value, maxPlayers: lobbyMaxPlayers.value },
      { withCredentials: true },
    )
    lobbyName.value = ''
    errorMessage.value = ''
    // Join the new lobby
    socket.emit('lobby:join', res.data._id)
  } catch (err: unknown) {
    console.error('Error creating lobby:', err)
    const axiosError = err as { response?: { data?: { message?: string } } }
    errorMessage.value = axiosError.response?.data?.message || 'Error creating lobby'
  } finally {
    creatingLobby.value = false
  }
}

// Socket event listeners
function handleLobbyUpdate(lobbiesOrLobby: Lobby | Lobby[]) {
  if (Array.isArray(lobbiesOrLobby)) {
    lobbies.value = lobbiesOrLobby
  } else if (lobbiesOrLobby.id) {
    currentLobby.value = lobbiesOrLobby
    // Also update the lobbies list
    const index = lobbies.value.findIndex((l) => l.id === lobbiesOrLobby.id)
    if (index !== -1) {
      lobbies.value[index] = lobbiesOrLobby
    } else {
      lobbies.value.push(lobbiesOrLobby)
    }
  }
}

function handleLobbyError(message: string) {
  errorMessage.value = message
}

function handleLobbyStartGame(lobby: Lobby) {
  currentLobby.value = lobby
  emit('startGame', lobby)
}

onMounted(() => {
  loadLobbies()

  // Connect socket if not already connected
  if (!socket.connected && gameStore.authUser.loggedIn) {
    socket.connect()
  }

  // Add socket event listeners
  socket.on('lobby:update', handleLobbyUpdate)
  socket.on('lobby:error', handleLobbyError)
  socket.on('lobby:startGame', handleLobbyStartGame)
})

onBeforeUnmount(() => {
  // Remove socket event listeners
  socket.off('lobby:update', handleLobbyUpdate)
  socket.off('lobby:error', handleLobbyError)
  socket.off('lobby:startGame', handleLobbyStartGame)
})
</script>

<template>
  <div class="lobby-screen">
    <div class="matrix-canvas-placeholder"></div>
    <div class="scanlines"></div>
    <div class="vignette"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <div class="header">
      <button class="back-button" @click="emit('go-back')">← Volver al Menú</button>
      <h1 class="title">Multijugador</h1>
    </div>

    <div class="content">
      <!-- If in a lobby -->
      <div v-if="currentLobby" class="current-lobby">
        <h2>{{ currentLobby.name }}</h2>
        <p>Host: {{ currentLobby.host }}</p>
        <p>Jugadores ({{ currentLobby.players.length }}/{{ currentLobby.maxPlayers }}):</p>
        <ul class="player-list">
          <li v-for="player in currentLobby.players" :key="player">{{ player }}</li>
        </ul>
        <p v-if="currentLobby.players.length === currentLobby.maxPlayers" class="waiting-message">
          ¡Partida empezando en breve...!
        </p>
        <p v-else class="waiting-message">Esperando a que se una el otro jugador...</p>
      </div>

      <!-- Otherwise, show lobbies list and create form -->
      <template v-else>
        <div class="create-lobby-panel">
          <h2>Crear Lobby</h2>
          <div class="input-group">
            <label>Nombre del Lobby</label>
            <input type="text" v-model="lobbyName" placeholder="Mi Lobby" />
          </div>
          <div class="input-group">
            <label>Máximo de Jugadores</label>
            <input type="number" v-model.number="lobbyMaxPlayers" min="2" max="2" disabled />
          </div>
          <button
            class="create-button"
            :disabled="!gameStore.authUser.loggedIn || creatingLobby"
            @click="createLobby"
          >
            {{ creatingLobby ? 'Creando...' : 'Crear Lobby' }}
          </button>
          <p v-if="!gameStore.authUser.loggedIn" class="login-hint">
            Debes iniciar sesión para crear un lobby
          </p>
        </div>

        <div class="lobbies-panel">
          <h2>Lobbies Disponibles</h2>
          <button class="refresh-button" @click="loadLobbies" :disabled="loadingLobbies">
            {{ loadingLobbies ? 'Cargando...' : '↻ Actualizar' }}
          </button>
          <div v-if="lobbies.length === 0" class="empty-state">
            No hay lobbies disponibles. ¡Crea uno!
          </div>
          <div class="lobbies-list">
            <div v-for="lobby in lobbies" :key="lobby.id" class="lobby-card">
              <div class="lobby-info">
                <span class="lobby-name">{{ lobby.name }}</span>
                <span class="lobby-host">Host: {{ lobby.host }}</span>
              </div>
              <div class="lobby-status">
                <span class="player-count"
                  >{{ lobby.players.length }} / {{ lobby.maxPlayers }}</span
                >
                <button
                  class="join-button"
                  :disabled="
                    !gameStore.authUser.loggedIn ||
                    lobby.players.length >= lobby.maxPlayers ||
                    lobby.players.includes(gameStore.authUser.username) ||
                    joiningLobby
                  "
                  @click="joinLobby(lobby)"
                >
                  Unirse
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.lobby-screen {
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000;
  padding: 1.5rem;
  position: fixed;
  inset: 0;
  overflow: hidden;
  color: #33ff99;
  font-family: 'Share Tech Mono', monospace;
}

.matrix-canvas-placeholder {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: #000;
}

.scanlines,
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.scanlines {
  background: repeating-linear-gradient(
    to bottom,
    rgba(40, 255, 145, 0.04) 0,
    rgba(40, 255, 145, 0.04) 1px,
    transparent 1px,
    transparent 4px
  );
}

.vignette {
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.68) 100%);
  z-index: 2;
}

.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #46ff9f;
  border-style: solid;
  opacity: 0.8;
  z-index: 5;
}

.tl {
  top: 1rem;
  left: 1rem;
  border-width: 2px 0 0 2px;
}

.tr {
  top: 1rem;
  right: 1rem;
  border-width: 2px 2px 0 0;
}

.bl {
  bottom: 1rem;
  left: 1rem;
  border-width: 0 0 2px 2px;
}

.br {
  right: 1rem;
  bottom: 1rem;
  border-width: 0 2px 2px 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  z-index: 10;
}

.back-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(76, 255, 155, 0.35);
  background: rgba(2, 26, 12, 0.7);
  color: #7bffb5;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  transform: translateY(-1px);
  border-color: rgba(112, 255, 178, 0.9);
  background: rgba(5, 34, 18, 0.9);
}

.title {
  font-size: 2.5rem;
  margin: 0;
  color: #72ffad;
  text-shadow: 0 0 8px rgba(50, 255, 150, 0.8);
}

.content {
  display: flex;
  gap: 2rem;
  flex: 1;
  z-index: 10;
  overflow-y: auto;
  padding-bottom: 2rem;
}

.create-lobby-panel,
.lobbies-panel,
.current-lobby {
  flex: 1;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(2, 26, 12, 0.7);
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.14);
}

.create-lobby-panel h2,
.lobbies-panel h2,
.current-lobby h2 {
  font-size: 1.5rem;
  color: #9affc5;
  margin: 0 0 1rem 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-group label {
  color: #7bffb5;
  font-size: 1rem;
}

.input-group input {
  padding: 0.75rem;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(0, 18, 8, 0.7);
  color: #d0ffe9;
  font-family: inherit;
  font-size: 1rem;
}

.input-group input:focus {
  outline: none;
  border-color: rgba(112, 255, 178, 0.9);
}

.create-button,
.refresh-button,
.join-button {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: linear-gradient(90deg, rgba(72, 212, 133, 0.95), rgba(25, 180, 95, 0.9));
  color: #031e0f;
  font-family: inherit;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.create-button:hover:not(:disabled),
.refresh-button:hover:not(:disabled),
.join-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(83, 255, 165, 0.6);
}

.create-button:disabled,
.refresh-button:disabled,
.join-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-hint {
  color: rgba(255, 139, 139, 0.9);
  font-size: 0.9rem;
  margin: 0;
}

.lobbies-panel {
  display: flex;
  flex-direction: column;
}

.refresh-button {
  width: auto;
  align-self: flex-start;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  color: rgba(188, 255, 217, 0.7);
  padding: 2rem;
}

.lobbies-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lobby-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(0, 18, 8, 0.7);
  padding: 1rem;
}

.lobby-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.lobby-name {
  font-size: 1.25rem;
  color: #72ffad;
}

.lobby-host {
  font-size: 0.9rem;
  color: rgba(188, 255, 217, 0.8);
}

.lobby-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-count {
  font-size: 1rem;
  color: #9affc5;
}

.join-button {
  width: auto;
  margin: 0;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.player-list li {
  padding: 0.5rem 0;
  border-bottom: 1px dashed rgba(51, 255, 153, 0.3);
}

.waiting-message {
  color: #9affc5;
  font-size: 1.1rem;
  margin-top: 1rem;
}

.error-message {
  color: #ff8b8b;
  font-size: 1rem;
  text-align: center;
  margin: 1rem 0 0 0;
  z-index: 10;
}
</style>
