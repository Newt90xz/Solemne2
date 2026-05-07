<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Mainmenu from './mainmenu.vue'
import Instrucciones from './Instrucciones.vue'
import Configuración from './Configuración.vue'
import GameScene from './GameScene.vue'
import { ref, onMounted, watch } from 'vue'
import { useGameStore, type GameSettings } from '../stores/game'
import gameMusicTrack from '../assets/Into The Void (feat. Jordan Lindley).mp4'

const currentView = ref<'menu' | 'instructions' | 'settings' | 'game'>('menu')

const handleOpenInstructions = () => {
  currentView.value = 'instructions'
}

const handleBackToMenu = () => {
  stopGameMusic()
  currentView.value = 'menu'
}

const handleOpenSettings = () => {
  currentView.value = 'settings'
}

const handleNewGameView = () => {
  currentView.value = 'game'
}

const gameStore = useGameStore()
let gameMusic: HTMLAudioElement | null = null

function getMusicVolume() {
  const volume = gameStore.settings.musicVolume
  return typeof volume === 'number' ? Math.min(1, Math.max(0, volume)) : 0.7
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
    void music.play().catch(() => {
      // Ignore autoplay restrictions or playback failures.
    })
  } catch {
    // Keep the game flow alive even if the browser blocks audio setup.
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
  currentView.value = 'menu'
}

function handleStartGame() {
  handleNewGameView()
  playGameMusic()
}
</script>
<template>
  <Mainmenu
    v-if="currentView === 'menu'"
    @open-instructions="handleOpenInstructions"
    @open-settings="handleOpenSettings"
    @new-game="handleStartGame"
  />
  <Instrucciones v-else-if="currentView === 'instructions'" @go-back="handleBackToMenu" />
  <Configuración
    v-else-if="currentView === 'settings'"
    @save="handleSaveSettings"
    @go-back="handleBackToMenu"
  />
  <GameScene v-else-if="currentView === 'game'" @exit="handleBackToMenu" />
</template>
