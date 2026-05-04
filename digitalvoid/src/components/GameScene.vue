<template>
  <div class="game-scene" ref="sceneRef" :style="sceneStyle">
    <div class="player" :style="playerStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import escenarioImg from '../assets/Escenario_Principal.png'

const sceneRef = ref<HTMLElement | null>(null)

const player = reactive({ x: 80, y: 80, size: 56 })
const speed = 220 // pixels per second

const keys = reactive({ up: false, down: false, left: false, right: false })

const sceneStyle = computed(() => ({
  backgroundImage: `url(${escenarioImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}))

const playerStyle = computed(() => ({
  width: `${player.size}px`,
  height: `${player.size}px`,
  transform: `translate(${Math.round(player.x)}px, ${Math.round(player.y)}px)`,
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
  const rect = sceneRef.value.getBoundingClientRect()
  const maxX = rect.width - player.size
  const maxY = rect.height - player.size
  if (player.x < 0) player.x = 0
  if (player.y < 0) player.y = 0
  if (player.x > maxX) player.x = maxX
  if (player.y > maxY) player.y = maxY
}

function loop(ts: number) {
  if (!lastTime) lastTime = ts
  const dt = (ts - lastTime) / 1000
  lastTime = ts

  let vx = 0,
    vy = 0
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
  background: linear-gradient(135deg, #ffd86b, #ff7aa2);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  transition: transform 0.04s linear;
}
</style>
