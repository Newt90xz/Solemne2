<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Mainmenu from './mainmenu.vue'
import Instrucciones from './Instrucciones.vue'
import Configuración from './Configuración.vue'
import GameScene from './GameScene.vue'
import { ref, onMounted } from 'vue'
import { useGameStore, type GameSettings } from '../stores/game'

const currentView = ref<'menu' | 'instructions' | 'settings' | 'game'>('menu')

const handleOpenInstructions = () => {
  currentView.value = 'instructions'
}

const handleBackToMenu = () => {
  currentView.value = 'menu'
}

const handleOpenSettings = () => {
  currentView.value = 'settings'
}

const handleNewGameView = () => {
  currentView.value = 'game'
}

const gameStore = useGameStore()

onMounted(() => {
  gameStore.loadFromLocal()
})

function handleSaveSettings(payload: GameSettings) {
  gameStore.setSettings(payload)
  gameStore.saveToLocal()
  currentView.value = 'menu'
}
</script>
<template>
  <Mainmenu
    v-if="currentView === 'menu'"
    @open-instructions="handleOpenInstructions"
    @open-settings="handleOpenSettings"
    @new-game="handleNewGameView"
  />
  <Instrucciones v-else-if="currentView === 'instructions'" @go-back="handleBackToMenu" />
  <Configuración
    v-else-if="currentView === 'settings'"
    @save="handleSaveSettings"
    @go-back="handleBackToMenu"
  />
  <GameScene v-else-if="currentView === 'game'" />
</template>
