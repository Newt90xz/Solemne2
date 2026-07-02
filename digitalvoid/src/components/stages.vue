<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Mainmenu from './mainmenu.vue'
import Instrucciones from './instructions.vue'
import Configuración from './configuration.vue'
import GameScene from './game-scene.vue'
import Leaderboard from './leader-board.vue'
import InjectionScreen from './Injection-screen.vue'
import { ref, onMounted, watch } from 'vue'
import { useGameStore, type GameSettings } from '../stores/game.ts'
import gameMusicTrack from '../assets/audio/Into The Void (feat. Jordan Lindley).mp4'

type LobbyContext = { lobbyId: string | null; role: 'host' | 'guest' } | null

const currentView = ref<'menu' | 'instructions' | 'game' | 'leaderboard' | 'injection'>('menu')
const showSettingsOverlay = ref(false)
const settingsOrigin = ref<'menu' | 'game'>('menu')
const runKey = ref(0)
const sessionLoops = ref(0)
const lobbyContext = ref<LobbyContext>(null)

const gameStore = useGameStore()
let gameMusic: HTMLAudioElement | null = null

const handleOpenInstructions = () => {
  showSettingsOverlay.value = false
  currentView.value = 'instructions'
}

const handleBackToMenu = () => {
  showSettingsOverlay.value = false
  stopGameMusic()
  currentView.value = 'menu'
}

const handleOpenSettings = () => {
  settingsOrigin.value = currentView.value === 'game' ? 'game' : 'menu'
  showSettingsOverlay.value = true
}

const handleOpenLeaderboard = () => {
  showSettingsOverlay.value = false
  currentView.value = 'leaderboard'
}

const handleOpenInjection = () => {
  showSettingsOverlay.value = false
  currentView.value = 'injection'
}

const handleLoopComplete = () => {
  sessionLoops.value++
  currentView.value = 'injection'
}

const handleStartInjection = (payload: { lobbyId: string | null; role: 'host' | 'guest' }) => {
  gameStore.startNewInjection()
  lobbyContext.value = payload
  runKey.value++
  showSettingsOverlay.value = false
  currentView.value = 'game'
  playGameMusic()
}

const handleStartGame = () => {
  gameStore.resetPlayerStats()
  lobbyContext.value = null
  runKey.value++
  showSettingsOverlay.value = false
  currentView.value = 'game'
  playGameMusic()
}

function getMusicVolume() {
  const volume = gameStore.settings.musicVolume
  return typeof volume === 'number' ? Math.min(1, Math.max(0, volume * 0.15)) : 0.015
}

function ensureGameMusic() {
  if (!gameMusic) {
    gameMusic = new Audio(gameMusicTrack)
    gameMusic.loop = true
    gameMusic.preload = 'auto'
  }

  gameMusic.volume = getMusicVolume()
  return gameMusic
}

function syncGameMusic() {
  if (!gameMusic) return

  if (!gameStore.settings.sound) {
    gameMusic.pause()
    return
  }

  gameMusic.volume = getMusicVolume()
}

function playGameMusic() {
  if (!gameStore.settings.sound) return

  try {
    const music = ensureGameMusic()
    music.currentTime = 0
    void music.play().catch(() => {})
  } catch {
    /* empty */
  }
}

function stopGameMusic() {
  if (!gameMusic) return

  gameMusic.pause()
  gameMusic.currentTime = 0
}

watch(
  () => [gameStore.settings.sound, gameStore.settings.musicVolume],
  () => {
    syncGameMusic()
  },
)

onMounted(() => {
  gameStore.loadFromLocal()
})

function handleSaveSettings(payload: GameSettings) {
  gameStore.setSettings(payload)
  gameStore.saveToLocal()
  showSettingsOverlay.value = false
  if (settingsOrigin.value === 'menu') {
    currentView.value = 'menu'
  }
}

function handleCloseSettings() {
  showSettingsOverlay.value = false
  if (settingsOrigin.value === 'menu') {
    currentView.value = 'menu'
  }
}
</script>
<template>
  <Mainmenu
    v-if="currentView === 'menu'"
    @open-instructions="handleOpenInstructions"
    @open-settings="handleOpenSettings"
    @open-leaderboard="handleOpenLeaderboard"
    @open-lobby="handleOpenInjection"
    @new-game="handleStartGame"
  />
  <Instrucciones v-else-if="currentView === 'instructions'" @go-back="handleBackToMenu" />
  <Leaderboard v-else-if="currentView === 'leaderboard'" @go-back="handleBackToMenu" />
  <InjectionScreen
    v-else-if="currentView === 'injection'"
    @start-injection="handleStartInjection"
    @go-back="handleBackToMenu"
  />
  <GameScene
    v-else-if="currentView === 'game'"
    :key="runKey"
    :lobby-context="lobbyContext"
    @exit="handleBackToMenu"
    @open-settings="handleOpenSettings"
    @loop-complete="handleLoopComplete"
  />
  <div v-if="showSettingsOverlay" class="settings-overlay">
    <Configuración @save="handleSaveSettings" @go-back="handleCloseSettings" />
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
}
</style>