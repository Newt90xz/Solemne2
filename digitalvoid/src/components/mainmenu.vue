<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'new-game'): void
  (e: 'open-instructions'): void
  (e: 'open-settings'): void
}>()

const handleNewGame = () => {
  emit('new-game')
}

const handleLoadGame = () => {
  emit('open-instructions')
}

const handleSettings = () => {
  emit('open-settings')
}

</script>

<template>
  <div class="main-menu">
    <!-- Título centrado en la parte superior -->
    <div class="title-container">
      <h1 class="title">Digital Void</h1>
    </div>

    <!-- Botones en la esquina inferior izquierda -->
    <div class="buttons-container">
      <button class="menu-button" @click="handleNewGame">Nuevo Juego</button>
      <button class="menu-button" @click="handleLoadGame">Instrucciones</button>
      <button class="menu-button" @click="handleSettings">Configuración</button>
    </div>
  </div>
</template>

<style scoped>
.main-menu {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 0;
  position: relative;
  overflow: hidden;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 60px;
}

.title {
  font-size: 4rem;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
  margin: 0;
  letter-spacing: 2px;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
  }
  50% {
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.9);
  }
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 40px;
  position: absolute;
  bottom: 0;
  left: 0;
}

.menu-button {
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  border: 2px solid #00d4ff;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 200px;
}

.menu-button:hover {
  background: rgba(0, 212, 255, 0.25);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  transform: translateX(5px);
}

.menu-button:active {
  transform: translateX(5px) scale(0.98);
}
</style>