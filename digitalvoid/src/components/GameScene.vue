<template>
  <div class="game-viewpoint" ref="viewportRef">
  <div class="game-scene" ref="sceneRef" :style="sceneStyle">
    <div class="player" :style="playerStyle"></div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import escenarioImg from '../assets/Escenario_Principal.png'

const sceneRef = ref<HTMLElement | null>(null)

const player = reactive({ x: 500, y: 500, size: 26 })
const camera = reactive ({x: 0, y: 0})
const speed = 320 // pixels per second

const worldSize = { width: 5000, height: 5000}

const keys = reactive({ up: false, down: false, left: false, right: false })

const sceneStyle = computed(() => ({
  backgroundImage: `url(${escenarioImg})`,
  backgroundSize: 'cover',
  backgroundPosition: `${-camera.x}px ${-camera.y}px`,
  backgroundRepeat: 'repeat',
  width: '100%',
  height: '100vh'
}))

const playerStyle = computed(() => ({
  width: `${player.size}px`,
  height: `${player.size}px`,
  transform: `translate(${Math.round(player.x - camera.x)}px, ${Math.round(player.y - camera.y)}px)`,
}))

let rafId: number | null = null
let lastTime = 0

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false
}

function clampPlayer() {
  if (!sceneRef.value) return
  player.x = Math.max(0, Math.min(player.x, worldSize.width - player.size))
  player.y = Math.max(0, Math.min(player.y, worldSize.height - player.size))
}

function updateCamera() {
  if (!sceneRef.value) return
  
  const vw = sceneRef.value.clientWidth
  const vh = sceneRef.value.clientHeight

  
  const targetX = player.x - vw / 2 + player.size / 2
  const targetY = player.y - vh / 2 + player.size / 2

  camera.x += (targetX - camera.x) * 0.1
  camera.y += (targetY - camera.y) * 0.1
}

function loop(ts: number) {
  if (!lastTime) lastTime = ts
  const dt = (ts - lastTime) / 1000
  lastTime = ts

  let vx = 0
  let vy = 0
  if (keys.up) vy -= 1
  if (keys.down) vy += 1
  if (keys.left) vx -= 1
  if (keys.right) vx += 1

  if (vx !== 0 || vy !== 0) {
    const len = Math.hypot(vx, vy) || 1
    vx = (vx / len) * speed
    vy = (vy / len) * speed
    player.x += vx * dt
    player.y += vy * dt
    clampPlayer()
  }

  updateCamera()

  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.game-scene {
  width: 100%;
  height: 100vh;
  position: relative;
  display: block;
}
.player {
  position: absolute;
  left: 0;
  top: 0;
  background: rgb(255, 255, 0);
  border-radius: 0px;
  box-shadow: none;
  will-change: transform;
}
</style>
