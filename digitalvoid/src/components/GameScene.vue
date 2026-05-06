<template>
  <div class="game-viewpoint" ref="viewportRef">
    <div class="game-scene" ref="sceneRef" :style="sceneStyle">
      <PlayerHub />

      <div class="hud-panel">
        <p class="hud-title">Arma actual</p>
        <p class="hud-name">{{ selectedWeapon.name }}</p>
        <p class="hud-alias">{{ selectedWeapon.alias }}</p>
        <p class="hud-role">{{ selectedWeapon.role }}</p>
        <p class="hud-help">Cambiar: 1-6</p>
      </div>

      <div class="hud-actions">
        <button class="hud-button" type="button" @click="togglePause">
          {{ isPaused ? 'Reanudar' : 'Pausar' }}
        </button>
        <button class="hud-button hud-button-secondary" type="button" @click="exitGame">
          Salir
        </button>
      </div>

      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-card">
          <p class="pause-title">Juego en pausa</p>
          <p class="pause-text">Pulsa reanudar para continuar o salir para volver al menú.</p>
        </div>
      </div>

      <div class="aim-line" :style="aimLineStyle"></div>

      <div v-if="nearestBuilding && hintVisible" class="capture-hint">
        <div class="hint-icon">{{ nearestBuilding.b.icon }}</div>
        <div>Presiona <strong>E</strong> para capturar — {{ nearestBuilding.b.buffText }}</div>
      </div>

      <div
        v-for="b in buildings"
        :key="'area-' + b.id"
        class="building-area"
        :style="buildingAreaStyle(b)"
      ></div>

      <div v-for="b in buildings" :key="b.id" class="building" :style="buildingStyle(b)">
        <div class="building-icon">{{ b.icon }}</div>
        <div class="building-label">{{ b.name }}</div>
        <div v-if="b.captured" class="building-captured">Capturado</div>
      </div>

      <div
        v-for="bullet in bullets"
        :key="bullet.id"
        class="bullet"
        :style="bulletStyle(bullet)"
      ></div>

      <div class="player" :style="playerStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import escenarioImg from '../assets/Escenario_Principal.png'
import { DEFAULT_WEAPON_ID, WEAPON_CATALOG, WEAPON_ORDER, type WeaponId } from '../game/weapons'
import { useGameStore } from '../stores/game'
import PlayerHub from './PlayerHub.vue'

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

interface Building {
  id: number
  x: number
  y: number
  size: number
  name: string
  captured: boolean
  buff: {
    type: 'speed' | 'damage'
    value: number
    duration: number
  }
  areaRadius?: number
  icon?: string
  buffText?: string
}

const emit = defineEmits<{
  (e: 'exit'): void
}>()
import virusImg from '../assets/malware.png'

const viewportRef = ref<HTMLElement | null>(null)
const sceneRef = ref<HTMLElement | null>(null)
const gameStore = useGameStore()

const player = reactive({ x: 500, y: 500, size: 26 })
const camera = reactive({ x: 0, y: 0 })
const baseSpeed = 320 // base pixels per second

const mouseScreen = reactive({ x: 0, y: 0, active: false })
const mouse = reactive({ down: false })

const worldSize = { width: 5000, height: 5000 }

const buildings = reactive<Building[]>([])
let nextBuildingId = 1
const captureRange = 48

const keys = reactive({ up: false, down: false, left: false, right: false })
const bullets = reactive<Bullet[]>([])
const isPaused = ref(false)

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
  backgroundImage: `url(${virusImg})`,
  backgroundSize: 'contain',
  transform: `translate(${Math.round(player.x - camera.x)}px, ${Math.round(player.y - camera.y)}px) rotate(${aimAngleDeg.value}deg)`,
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

const nearestBuilding = computed(() => {
  let nearest: Building | null = null
  let bestDist = Infinity
  const px = player.x + player.size / 2
  const py = player.y + player.size / 2
  for (const b of buildings) {
    const d = Math.hypot(b.x - px, b.y - py)
    if (d < bestDist) {
      bestDist = d
      nearest = b
    }
  }
  if (!nearest) return null
  return { b: nearest, dist: bestDist }
})

const hintVisible = computed(() => {
  if (!nearestBuilding.value) return false
  const b = nearestBuilding.value.b
  const r = b.areaRadius ?? captureRange
  return nearestBuilding.value.dist <= r + 8 && !b.captured
})

let rafId: number | null = null
let lastTime = 0
let nextBulletId = 1
let shootAccumulator = 0

function randRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function spawnBuildings(count = 8) {
  buildings.length = 0
  let attempts = 0
  while (buildings.length < count && attempts < count * 50) {
    attempts++
    const size = randRange(48, 96)
    const x = randRange(size, worldSize.width - size)
    const y = randRange(size, worldSize.height - size)

    // avoid spawning too close to player
    const dx = x - player.x
    const dy = y - player.y
    if (Math.hypot(dx, dy) < 240) continue

    // avoid overlap with other buildings
    let collides = false
    for (const b of buildings) {
      const ddx = b.x - x
      const ddy = b.y - y
      if (Math.hypot(ddx, ddy) < (b.size + size) * 0.7) {
        collides = true
        break
      }
    }
    if (collides) continue

    const type: 'speed' | 'damage' =
      buildings.length % 3 === 0 ? 'speed' : buildings.length % 3 === 1 ? 'damage' : 'speed'
    const buff =
      type === 'speed'
        ? { type: 'speed' as const, value: 1.35, duration: 12 }
        : { type: 'damage' as const, value: 1.25, duration: 10 }

    const icon = type === 'speed' ? '⚡' : '🔥'
    const buffText = type === 'speed' ? 'Velocidad +35% (12s)' : 'Daño +25% (10s)'
    const areaRadius = Math.floor(size * 1.6)

    buildings.push({
      id: nextBuildingId++,
      x,
      y,
      size,
      name: `Edificio ${buildings.length + 1}`,
      captured: false,
      buff,
      areaRadius,
      icon,
      buffText,
    })
  }
}

function buildingAreaStyle(b: Building) {
  const r = b.areaRadius || Math.round(b.size * 1.6)
  return {
    width: `${r * 2}px`,
    height: `${r * 2}px`,
    transform: `translate(${Math.round(b.x - camera.x - r)}px, ${Math.round(b.y - camera.y - r)}px)`,
    background: b.captured ? 'rgba(120,200,120,0.12)' : 'rgba(60,120,220,0.08)',
    border: b.captured ? '2px solid rgba(80,200,120,0.25)' : '1px dashed rgba(120,140,200,0.12)',
    borderRadius: '999px',
    zIndex: 1,
  }
}

function buildingStyle(b: Building) {
  const color = b.captured ? 'rgba(120,200,120,0.95)' : 'rgba(200,120,255,0.95)'
  return {
    width: `${b.size}px`,
    height: `${b.size}px`,
    transform: `translate(${Math.round(b.x - camera.x - b.size / 2)}px, ${Math.round(b.y - camera.y - b.size / 2)}px)`,
    background: color,
    border: '2px solid rgba(0,0,0,0.35)',
    boxShadow: b.captured ? '0 0 18px rgba(80,200,120,0.45)' : '0 0 10px rgba(180,120,220,0.25)',
    borderRadius: '6px',
    zIndex: 5,
  }
}

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
  if (e.key === 'Escape') {
    togglePause()
    return
  }

  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true

  if (e.key >= '1' && e.key <= '6') {
    const index = Number(e.key) - 1
    const id = WEAPON_ORDER[index]
    if (id) {
      selectedWeaponId.value = id
    }
  }

  if (e.key === 'e' || e.key === 'E') {
    tryCapture()
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false
}

function onMouseMove(e: MouseEvent) {
  if (isPaused.value) return
  if (!sceneRef.value) return
  const rect = sceneRef.value.getBoundingClientRect()
  mouseScreen.x = e.clientX - rect.left
  mouseScreen.y = e.clientY - rect.top
  mouseScreen.active = true
}

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  if (isPaused.value) return
  onMouseMove(e)
  // start hold-to-fire + immediate shot
  mouse.down = true
  shootFromPlayer()
}

function onMouseUp(e: MouseEvent) {
  if (e.button !== 0) return
  mouse.down = false
  shootAccumulator = 0
}

function onMouseLeave() {
  mouseScreen.active = false
}

function clampPlayer() {
  player.x = Math.max(0, Math.min(player.x, worldSize.width - player.size))
  player.y = Math.max(0, Math.min(player.y, worldSize.height - player.size))
}

function togglePause() {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    keys.up = false
    keys.down = false
    keys.left = false
    keys.right = false
  }
}

function exitGame() {
  emit('exit')
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
  if (isPaused.value) return

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

function tryCapture() {
  // find nearest uncaptured building within range (world coords)
  const px = player.x + player.size / 2
  const py = player.y + player.size / 2
  let nearest: Building | null = null
  let bestDist = Infinity
  for (const b of buildings) {
    if (b.captured) continue
    const d = Math.hypot(b.x - px, b.y - py)
    if (d < bestDist) {
      bestDist = d
      nearest = b
    }
  }
  if (!nearest) return
  const effectiveRadius = nearest.areaRadius ?? captureRange
  if (bestDist > effectiveRadius) return

  // capture
  nearest.captured = true
  applyBuff(nearest.buff)
}

function applyBuff(buff: { type: 'speed' | 'damage'; value: number; duration: number }) {
  gameStore.addBuff(buff)
}

function updateAutoShoot(dt: number) {
  if (!mouse.down || !mouseScreen.active || isPaused.value) return
  const shotsPerSecond = Math.max(0.2, selectedWeapon.value.fireRate)
  const shotInterval = 1 / shotsPerSecond
  shootAccumulator += dt
  while (shootAccumulator >= shotInterval) {
    shootAccumulator -= shotInterval
    shootFromPlayer()
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

function loop(ts: number) {
  if (!lastTime) lastTime = ts
  const dt = (ts - lastTime) / 1000
  lastTime = ts

  if (isPaused.value) {
    rafId = requestAnimationFrame(loop)
    return
  }

  // Update game store buffs
  gameStore.updateBuffs(dt)

  const speed = baseSpeed * gameStore.playerStats.speedMultiplier
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
  gameStore.resetPlayerStats()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseleave', onMouseLeave)
  spawnBuildings(10)
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
  cursor: none;
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
  bottom: 12px;
  z-index: 15;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 12px;
  line-height: 1.35;
}

.hud-actions {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 20;
  display: flex;
  gap: 8px;
}

.hud-button {
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(14, 22, 35, 0.92);
  color: #ffffff;
  padding: 9px 14px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.hud-button-secondary {
  background: rgba(84, 13, 13, 0.92);
}

.pause-overlay {
  position: absolute;
  inset: 0;
  z-index: 18;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.pause-card {
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(9, 14, 22, 0.9);
  color: #ffffff;
  text-align: center;
  max-width: 320px;
}

.pause-title,
.pause-text {
  margin: 0;
}

.pause-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 6px;
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

.building {
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  color: #07111f;
  font-weight: 800;
  font-size: 12px;
  pointer-events: none;
}

.building-label {
  font-size: 11px;
  color: rgba(8, 12, 16, 0.85);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
}

.building-area {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 999px;
  pointer-events: none;
}

.building-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 18px;
}

.building-captured {
  position: absolute;
  bottom: 6px;
  left: 6px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.12);
  padding: 4px 6px;
  border-radius: 8px;
}

.capture-hint {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 22;
  padding: 10px 14px;
  background: rgba(6, 12, 20, 0.9);
  color: #fff;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.hint-icon {
  font-size: 18px;
}

.player {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 0;
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
