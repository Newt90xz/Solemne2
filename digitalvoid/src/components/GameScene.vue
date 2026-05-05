<template>
  <div class="game-viewpoint" ref="viewportRef">
  <div class="game-scene" ref="sceneRef" :style="sceneStyle">
    <div class="aim-line" :style="aimLineStyle"></div>
    <div class="player" :style="playerStyle"></div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import escenarioImg from '../assets/Escenario_Principal.png'

const viewportRef = ref<HTMLElement | null>(null)
const sceneRef = ref<HTMLElement | null>(null)

const player = reactive({ x: 500, y: 500, size: 26 })
const camera = reactive ({x: 0, y: 0})
const speed = 320 // pixels per second

const mouseScreen = reactive({ x: 0, y: 0, active: false })

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
  transform: `translate(${Math.round(player.x - camera.x)}px, ${Math.round(player.y - camera.y)}px) rotate(${aimAngleDeg.value}deg)`,
  transformOrigin: '50% 50%',
}))

const playerCenterScreen = computed(() => ({
  x: player.x - camera.x + player.size / 2,
  y: player.y - camera.y + player.size / 2,
}))

const aimDelta = computed(() => {
  const start = playerCenterScreen.value
  const targetX = mouseScreen.active ? mouseScreen.x : start.x
  const targetY = mouseScreen.active ? mouseScreen.y : start.y
  return {
    dx: targetX - start.x,
    dy: targetY - start.y,
  }
})

const aimAngleDeg = computed(() => {
  const { dx, dy } = aimDelta.value
  if (dx === 0 && dy === 0) return 0
  return Math.atan2(dy, dx) * (180 / Math.PI)
})

const aimLineStyle = computed(() => {
  const start = playerCenterScreen.value
  const { dx, dy } = aimDelta.value
  const length = Math.hypot(dx, dy)
  return {
    width: `${Math.max(0, Math.round(length))}px`,
    transform: `translate(${Math.round(start.x)}px, ${Math.round(start.y)}px) rotate(${aimAngleDeg.value}deg)`,
    opacity: mouseScreen.active ? '1' : '0.35',
  }
})

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

function onMouseMove(e: MouseEvent) {
  if (!sceneRef.value) return
  const rect = sceneRef.value.getBoundingClientRect()
  mouseScreen.x = e.clientX - rect.left
  mouseScreen.y = e.clientY - rect.top
  mouseScreen.active = true
}

function onMouseLeave() {
  mouseScreen.active = false
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
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseleave', onMouseLeave)
  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.game-viewpoint {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.game-scene {
  width: 100%;
  height: 100vh;
  position: relative;
  display: block;
}

.aim-line {
  position: absolute;
  left: 0;
  top: 0;
  height: 2px;
  background: rgba(255, 70, 70, 0.95);
  transform-origin: 0 50%;
  box-shadow: 0 0 8px rgba(255, 70, 70, 0.6);
  pointer-events: none;
  z-index: 2;
}

.player {
  position: absolute;
  left: 0;
  top: 0;
  background: rgb(255, 255, 0);
  border-radius: 0px;
  box-shadow: none;
  will-change: transform;
  z-index: 3;
}

.player::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  width: 10px;
  height: 4px;
  border-radius: 3px;
  transform: translateY(-50%);
  background: rgba(255, 70, 70, 0.95);
}
</style>
