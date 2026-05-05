<template>
  <div class="game-viewpoint" ref="viewportRef">
    <div class="game-scene" ref="sceneRef" :style="sceneStyle">
      <div class="hud-panel">
        <p class="hud-title">Arma actual</p>
        <p class="hud-name">{{ selectedWeapon.name }}</p>
        <p class="hud-alias">{{ selectedWeapon.alias }}</p>
        <p class="hud-role">{{ selectedWeapon.role }}</p>
        <p class="hud-help">Cambiar: 1-6</p>
      </div>

      <div class="aim-line" :style="aimLineStyle"></div>

      <div v-for="bullet in bullets" :key="bullet.id" class="bullet" :style="bulletStyle(bullet)"></div>

      <div class="player" :style="playerStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import escenarioImg from '../assets/Escenario_Principal.png'
import {
  DEFAULT_WEAPON_ID,
  WEAPON_CATALOG,
  WEAPON_ORDER,
  type WeaponId,
} from '../game/weapons'

interface Bullet {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  ttl: number
  damage: number
  color: string
}

const viewportRef = ref<HTMLElement | null>(null)
const sceneRef = ref<HTMLElement | null>(null)

const player = reactive({ x: 500, y: 500, size: 26 })
const camera = reactive({ x: 0, y: 0 })
const speed = 320 // pixels per second

const mouseScreen = reactive({ x: 0, y: 0, active: false })
const mouse = reactive({ down: false })

const worldSize = { width: 5000, height: 5000 }

const keys = reactive({ up: false, down: false, left: false, right: false })
const bullets = reactive<Bullet[]>([])

const selectedWeaponId = ref<WeaponId>(DEFAULT_WEAPON_ID)
const selectedWeapon = computed(() => WEAPON_CATALOG[selectedWeaponId.value])

const sceneStyle = computed(() => ({
  backgroundImage: `url(${escenarioImg})`,
  backgroundSize: 'cover',
  backgroundPosition: `${-camera.x}px ${-camera.y}px`,
  backgroundRepeat: 'repeat',
  width: '100%',
  height: '100vh',
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
let nextBulletId = 1
let shootAccumulator = 0

function bulletStyle(bullet: Bullet) {
  return {
    width: `${bullet.size}px`,
    height: `${bullet.size}px`,
    background: bullet.color,
    transform: `translate(${Math.round(bullet.x - camera.x - bullet.size / 2)}px, ${Math.round(
      bullet.y - camera.y - bullet.size / 2,
    )}px)`,
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true

  if (e.key >= '1' && e.key <= '6') {
    const index = Number(e.key) - 1
    const id = WEAPON_ORDER[index]
    if (id) {
      selectedWeaponId.value = id
      shootAccumulator = 0
    }
  }
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

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  mouse.down = true
  onMouseMove(e)
}

function onMouseUp(e: MouseEvent) {
  if (e.button !== 0) return
  mouse.down = false
}

function onMouseLeave() {
  mouseScreen.active = false
  mouse.down = false
}

function clampPlayer() {
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

function shootFromPlayer() {
  const weapon = selectedWeapon.value
  const { dx, dy } = aimDelta.value
  const aimLength = Math.hypot(dx, dy)
  if (aimLength < 1) return

  const startX = player.x + player.size / 2
  const startY = player.y + player.size / 2
  const baseAngle = Math.atan2(dy, dx)
  const pelletCount = Math.max(1, weapon.pellets)
  const spreadRad = (weapon.spreadDeg * Math.PI) / 180

  for (let i = 0; i < pelletCount; i += 1) {
    const spreadFactor = pelletCount === 1 ? 0 : i / (pelletCount - 1) - 0.5
    const shotAngle = baseAngle + spreadFactor * spreadRad

    bullets.push({
      id: nextBulletId,
      x: startX,
      y: startY,
      vx: Math.cos(shotAngle) * weapon.projectileSpeed,
      vy: Math.sin(shotAngle) * weapon.projectileSpeed,
      size: weapon.projectileSize,
      ttl: weapon.projectileLifetime,
      damage: weapon.damage,
      color: weapon.projectileColor,
    })
    nextBulletId += 1
  }
}

function updateBullets(dt: number) {
  const margin = 200
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i]
    if (!bullet) continue

    bullet.x += bullet.vx * dt
    bullet.y += bullet.vy * dt
    bullet.ttl -= dt

    const outOfWorld =
      bullet.x < -margin ||
      bullet.y < -margin ||
      bullet.x > worldSize.width + margin ||
      bullet.y > worldSize.height + margin

    if (bullet.ttl <= 0 || outOfWorld) {
      bullets.splice(i, 1)
    }
  }
}

function updateAutoShoot(dt: number) {
  if (!mouseScreen.active || !mouse.down) {
    shootAccumulator = 0
    return
  }

  const shotsPerSecond = Math.max(0.2, selectedWeapon.value.fireRate)
  const shotInterval = 1 / shotsPerSecond

  shootAccumulator += dt
  while (shootAccumulator >= shotInterval) {
    shootAccumulator -= shotInterval
    shootFromPlayer()
  }
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

  updateAutoShoot(dt)
  updateBullets(dt)
  updateCamera()

  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseleave', onMouseLeave)
  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mouseup', onMouseUp)
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

.hud-panel {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 15;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 12px;
  line-height: 1.35;
}

.hud-title,
.hud-name,
.hud-alias,
.hud-role,
.hud-help {
  margin: 0;
}

.hud-title {
  opacity: 0.8;
}

.hud-name {
  font-weight: 700;
}

.hud-alias {
  color: #ffd166;
}

.hud-help {
  margin-top: 6px;
  opacity: 0.9;
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

.bullet {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 99px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 4;
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
