<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

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

// Matrix background
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const fontSize = 16
let columns = 0
let drops: number[] = []
let animationInterval: number | null = null

function updateColumns() {
  const canvas = canvasRef.value
  if (!canvas) return
  columns = Math.ceil(canvas.width / fontSize)
  drops = Array.from({ length: columns }).fill(1)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  // Use device pixel ratio for crisper rendering
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.floor(canvas.clientWidth * dpr)
  canvas.height = Math.floor(canvas.clientHeight * dpr)
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  updateColumns()
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#00FF9C'
  ctx.font = `${fontSize}px monospace`

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)]
    ctx.fillText(text, i * fontSize, drops[i] * fontSize)

    if (drops[i] * fontSize > canvas.clientHeight && Math.random() > 0.975) {
      drops[i] = 0
    }

    drops[i]++
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  animationInterval = window.setInterval(draw, 33)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
})

</script>

<template>
  <div class="main-menu">
    <canvas ref="canvasRef" class="matrix-canvas"/>
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
  background: transparent;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.matrix-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: black;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 60px;
  z-index: 2;
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
  z-index: 2;
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