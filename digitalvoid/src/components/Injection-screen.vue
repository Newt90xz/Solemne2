<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useGameStore } from '../stores/game'
import type { Lobby } from '../types/lobby'

type InjectionRole = 'host' | 'guest'

const emit = defineEmits<{
  (e: 'start-injection', payload: { lobbyId: string | null; role: InjectionRole }): void
  (e: 'go-back'): void
}>()

const gameStore = useGameStore()
const apihost = 'http://localhost:6139/api'

const mode = ref<'menu' | 'browse'>('menu')
const lobbies = ref<Lobby[]>([])
const loading = ref(false)
const errorMessage = ref('')

function lobbyId(l: Lobby): string {
  return l.id ?? l._id ?? ''
}
function lobbyHost(l: Lobby): string {
  return l.host ?? l.hostUsername ?? ''
}
function alreadyIn(l: Lobby): boolean {
  return (l.players ?? []).includes(gameStore.authUser.username)
}
function isSystemLobby(l: Lobby): boolean {
  return lobbyHost(l) === 'Sistema'
}

function newInjection() {
  errorMessage.value = ''
  emit('start-injection', { lobbyId: null, role: 'host' })
}

async function openBrowse() {
  mode.value = 'browse'
  await loadLobbies()
}

async function loadLobbies() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.get<Lobby[]>(`${apihost}/lobbies`)
    lobbies.value = (res.data ?? []).filter(
      (l: Lobby) => !isSystemLobby(l) && lobbyHost(l) !== gameStore.authUser.username,
    )
  } catch {
    errorMessage.value = 'Error al cargar inyecciones activas'
  } finally {
    loading.value = false
  }
}

function joinInjection(l: Lobby) {
  errorMessage.value = ''
  emit('start-injection', { lobbyId: lobbyId(l), role: 'guest' })
}
</script>

<template>
  <div class="injection-screen">
    <div class="scanlines"></div>
    <div class="vignette"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <div class="header">
      <button class="ghost-button" @click="mode === 'browse' ? (mode = 'menu') : emit('go-back')">
        {{ mode === 'browse' ? '← Volver' : '← Menú' }}
      </button>
      <h1 class="title">Ciclo completado</h1>
      <span class="spacer"></span>
    </div>

    <p class="subtitle">Tus mejoras se han purgado. Reinyecta para continuar.</p>

    <div v-if="mode === 'menu'" class="choices">
      <button class="choice new" @click="newInjection">
        <span class="choice-title">Nueva inyección</span>
        <span class="choice-desc">Abre una sala limpia y empieza de cero.</span>
      </button>

      <button class="choice existing" @click="openBrowse">
        <span class="choice-title">Inyección en proceso</span>
        <span class="choice-desc">Únete a una partida activa de otro operador.</span>
      </button>
    </div>

    <div v-else class="browse">
      <div class="browse-head">
        <h2>Inyecciones activas</h2>
        <button class="ghost-button" :disabled="loading" @click="loadLobbies">
          {{ loading ? 'Cargando...' : '↻ Actualizar' }}
        </button>
      </div>

      <p v-if="!gameStore.authUser.loggedIn" class="login-hint">
        Debes iniciar sesión para unirte a una inyección.
      </p>

      <div v-if="lobbies.length === 0 && !loading" class="empty-state">
        No hay inyecciones activas ahora mismo.
      </div>

      <div class="lobby-list">
        <div v-for="l in lobbies" :key="lobbyId(l)" class="lobby-card">
          <div class="lobby-info">
            <span class="lobby-name">{{ l.name }}</span>
            <span class="lobby-host">Operador: {{ lobbyHost(l) }}</span>
          </div>
          <div class="lobby-actions">
            <span class="player-count">{{ (l.players || []).length }} / {{ l.maxPlayers }}</span>
            <button class="join-button" :disabled="!gameStore.authUser.loggedIn ||
              (l.players || []).length >= l.maxPlayers ||
              alreadyIn(l)
              " @click="joinInjection(l)">
              Inyectar
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.injection-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #000;
  color: #33ff99;
  font-family: 'Share Tech Mono', monospace;
  padding: 2rem;
  overflow: hidden;
}

.scanlines,
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.scanlines {
  background: repeating-linear-gradient(to bottom,
      rgba(40, 255, 145, 0.04) 0,
      rgba(40, 255, 145, 0.04) 1px,
      transparent 1px,
      transparent 4px);
}

.vignette {
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.7) 100%);
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
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.spacer {
  width: 96px;
}

.title {
  font-size: 2.4rem;
  margin: 0;
  color: #72ffad;
  text-shadow: 0 0 8px rgba(50, 255, 150, 0.8);
}

.subtitle {
  z-index: 10;
  color: rgba(188, 255, 217, 0.75);
  margin: 0.75rem 0 2rem;
}

.ghost-button {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(76, 255, 155, 0.35);
  background: rgba(2, 26, 12, 0.7);
  color: #7bffb5;
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-button:hover:not(:disabled) {
  border-color: rgba(112, 255, 178, 0.9);
  background: rgba(5, 34, 18, 0.9);
}

.ghost-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choices {
  z-index: 10;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

.choice {
  width: 340px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(2, 26, 12, 0.7);
  color: #d0ffe9;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.12);
}

.choice:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(112, 255, 178, 0.9);
  box-shadow: 0 0 26px rgba(83, 255, 165, 0.4);
}

.choice:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice.existing {
  border-color: rgba(120, 200, 255, 0.35);
}

.choice.existing:hover:not(:disabled) {
  border-color: rgba(150, 220, 255, 0.9);
}

.choice-title {
  font-size: 1.5rem;
  color: #9affc5;
}

.choice.existing .choice-title {
  color: #9ad4ff;
}

.choice-desc {
  font-size: 0.95rem;
  color: rgba(200, 255, 225, 0.7);
}

.browse {
  z-index: 10;
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.browse-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.browse-head h2 {
  margin: 0;
  color: #9ad4ff;
  font-size: 1.4rem;
}

.empty-state {
  text-align: center;
  color: rgba(188, 255, 217, 0.6);
  padding: 2rem;
}

.lobby-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.lobby-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid rgba(63, 255, 155, 0.3);
  background: rgba(0, 18, 8, 0.7);
}

.lobby-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.lobby-name {
  font-size: 1.15rem;
  color: #72ffad;
}

.lobby-host {
  font-size: 0.85rem;
  color: rgba(188, 255, 217, 0.7);
}

.lobby-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-count {
  color: #9affc5;
}

.join-button {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: linear-gradient(90deg, rgba(72, 212, 133, 0.95), rgba(25, 180, 95, 0.9));
  color: #031e0f;
  font-family: inherit;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.join-button:hover:not(:disabled) {
  box-shadow: 0 0 16px rgba(83, 255, 165, 0.6);
}

.join-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-hint {
  color: rgba(255, 200, 120, 0.9);
  font-size: 0.9rem;
}

.error-message {
  z-index: 10;
  color: #ff8b8b;
  margin-top: 1.5rem;
  text-align: center;
}
</style>