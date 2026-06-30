<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useGameStore } from '../stores/game'

const emit = defineEmits<{
  (e: 'go-back'): void
}>()

const gameStore = useGameStore()
const lobbies = ref<any[]>([])
const lobbyName = ref('')
const lobbyMaxPlayers = ref(4)
const creatingLobby = ref(false)
const joiningLobby = ref(false)
const loadingLobbies = ref(false)
const errorMessage = ref('')

const apihost = 'http://localhost:6139/api'

async function loadLobbies() {
  loadingLobbies.value = true
  try {
    const res = await axios.get(`${apihost}/lobbies`)
    lobbies.value = res.data
  } catch (err) {
    console.error('Error loading lobbies:', err)
    errorMessage.value = 'Error loading lobbies'
  } finally {
    loadingLobbies.value = false
  }
}

async function createLobby() {
  if (!lobbyName.value.trim()) {
    errorMessage.value = 'Enter a lobby name'
    return
  }
  creatingLobby.value = true
  try {
    await axios.post(
      `${apihost}/lobbies`,
      { name: lobbyName.value, maxPlayers: lobbyMaxPlayers.value },
      { withCredentials: true }
    )
    lobbyName.value = ''
    errorMessage.value = ''
    await loadLobbies()
  } catch (err: any) {
    console.error('Error creating lobby:', err)
    errorMessage.value = err.response?.data?.message || 'Error creating lobby'
  } finally {
    creatingLobby.value = false
  }
}

async function joinLobby(lobbyId: string) {
  joiningLobby.value = true
  try {
    await axios.post(
      `${apihost}/lobbies/${lobbyId}/join`,
      {},
      { withCredentials: true }
    )
    errorMessage.value = ''
    await loadLobbies()
  } catch (err: any) {
    console.error('Error joining lobby:', err)
    errorMessage.value = err.response?.data?.message || 'Error joining lobby'
  } finally {
    joiningLobby.value = false
  }
}

onMounted(() => {
  loadLobbies()
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
      <div class="create-lobby-panel">
        <h2>Crear Lobby</h2>
        <div class="input-group">
          <label>Nombre del Lobby</label>
          <input type="text" v-model="lobbyName" placeholder="Mi Lobby" />
        </div>
        <div class="input-group">
          <label>Máximo de Jugadores</label>
          <input type="number" v-model.number="lobbyMaxPlayers" min="2" max="8" />
        </div>
        <button class="create-button" :disabled="!gameStore.authUser.loggedIn || creatingLobby" @click="createLobby">
          {{ creatingLobby ? 'Creando...' : 'Crear Lobby' }}
        </button>
        <p v-if="!gameStore.authUser.loggedIn" class="login-hint">Debes iniciar sesión para crear un lobby</p>
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
          <div v-for="lobby in lobbies" :key="lobby._id" class="lobby-card">
            <div class="lobby-info">
              <span class="lobby-name">{{ lobby.name }}</span>
              <span class="lobby-host">Host: {{ lobby.hostUsername }}</span>
            </div>
            <div class="lobby-status">
              <span class="player-count">{{ lobby.players.length }} / {{ lobby.maxPlayers }}</span>
              <button
                class="join-button"
                :disabled="
                  !gameStore.authUser.loggedIn ||
                  lobby.players.length >= lobby.maxPlayers ||
                  lobby.players.includes(gameStore.authUser.username) ||
                  joiningLobby
                "
                @click="joinLobby(lobby._id)"
              >
                Unirse
              </button>
            </div>
          </div>
        </div>
      </div>
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
.lobbies-panel {
  flex: 1;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(2, 26, 12, 0.7);
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.14);
}

.create-lobby-panel h2,
.lobbies-panel h2 {
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

.error-message {
  color: #ff8b8b;
  font-size: 1rem;
  text-align: center;
  margin: 1rem 0 0 0;
  z-index: 10;
}
</style>
