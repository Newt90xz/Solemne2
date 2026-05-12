<template>
  <div class="game-viewpoint" ref="viewportRef">
    <div class="game-scene" ref="sceneRef" :style="sceneStyle">
      <div class="hud-stack hud-stack-left">
        <PlayerHub />

        <section v-if="showObjective" class="neon-card objective-panel">
          <div class="panel-heading">
            <span class="panel-mark">⌬</span>
            <p class="panel-title">OBJETIVO</p>
          </div>
          <p class="objective-copy">{{ objectiveText }}</p>
        </section>
      </div>

      <section class="neon-card weapon-panel">
        <div class="weapon-visual">
          <img :src="selectedWeapon.image" :alt="selectedWeapon.name" class="weapon-image" />
        </div>

        <div class="weapon-copy">
          <div class="panel-heading">
            <span class="panel-mark">➤</span>
            <p class="panel-title">ARMA ACTUAL</p>
          </div>
          <p class="hud-name">{{ selectedWeapon.name }}</p>
          <p class="hud-alias">{{ selectedWeapon.alias }}</p>
          <p class="hud-role">{{ selectedWeapon.role }}</p>

          <div class="weapon-hints">
            <span class="hint-chip">1-5</span>
            <span class="hint-chip">Q/E</span>
            <span class="hint-chip">Rueda</span>
          </div>
        </div>
      </section>

      <button
        class="music-circle"
        @click="togglePause"
        :aria-label="isPaused ? 'Reanudar' : 'Pausar'"
      >
        {{ isPaused ? '▶' : '⏸' }}
      </button>

      <div class="hud-actions">
        <button
          class="hud-button"
          type="button"
          :aria-label="isPaused ? 'Reanudar' : 'Pausar'"
          @click="togglePause"
        >
          {{ isPaused ? '⏵' : '⏸' }}
        </button>
        <button
          class="hud-button hud-button-secondary"
          type="button"
          aria-label="Salir"
          @click="exitGame"
        >
          ⎋
        </button>
      </div>

      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-card">
          <p class="pause-title">Juego en pausa</p>
          <p class="pause-text">Pulsa reanudar para continuar o salir para volver al menú.</p>
        </div>
      </div>

      <div v-if="nearestBuilding && hintVisible" class="capture-hint">
        <div class="hint-icon">{{ nearestBuilding.b.icon }}</div>
        <div>Presiona <strong>F</strong> para capturar — {{ nearestBuilding.b.buffText }}</div>
      </div>

      <div
        v-for="b in buildings"
        :key="'area-' + b.id"
        class="building-area"
        :style="buildingAreaStyle(b)"
      ></div>

      <div v-for="b in buildings" :key="b.id" class="building" :style="buildingStyle(b)">
        <!--<div class="building-icon">{{ b.icon }}</div>
        <div class="building-label">{{ b.name }}</div>
        <div v-if="b.captured" class="building-captured">Capturado</div>-->
      </div>

      <div
        v-for="bullet in bullets"
        :key="bullet.id"
        class="bullet"
        :style="bulletStyle(bullet)"
      ></div>

      <div v-for="e in enemies" :key="'enemy-' + e.id" class="enemy" :style="enemyStyle(e)"></div>

      <template v-if="showHitboxes">
        <div
          v-for="e in enemies"
          :key="'enemy-hitbox-' + e.id"
          class="hitbox hitbox-enemy"
          :style="enemyHitboxStyle(e)"
        ></div>
      </template>

      <div
        v-for="exp in explosions"
        :key="exp.id"
        class="explosion"
        :style="explosionStyle(exp)"
      ></div>

      <div class="player" :style="playerStyle"></div>

      <div v-if="showHitboxes" class="hitbox hitbox-player" :style="playerHitboxStyle"></div>

      <div class="custom-cursor" :style="customCursorStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, type CSSProperties } from 'vue'
import escenarioImg from '../assets/Escenario_Principal.png'
import { DEFAULT_WEAPON_ID, WEAPON_CATALOG, WEAPON_ORDER, type WeaponId } from '../game/weapons'
import { useGameStore } from '../stores/game'
import PlayerHub from './PlayerHub.vue'
import spritesheetImg from '../assets/New_Piskel.png'
import cursorImg from '../assets/cursorfire.png'
import buildingSpritesheet from '../assets/buildings.png'
interface Bullet {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  ttl: number
  maxTtl: number
  damage: number
  color: string
  type: 'normal' | 'orbiting' | 'explosive'
  orbitPhase?: number
  orbitRadius?: number
  orbitTimeElapsed?: number
  orbitSpeed?: number
  initialVx?: number
  initialVy?: number
  explosiveDeceleration?: number
}

interface Explosion {
  id: number
  x: number
  y: number
  radius: number
  maxRadius: number
  ttl: number
  maxTtl: number
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

interface Enemy {
  id: number
  x: number
  y: number
  size: number
  speed: number
  hp: number
  maxHp: number
  color: string
  type: 'grunt' | 'runner' | 'tank'
}

interface CircleHitbox {
  x: number
  y: number
  radius: number
}

const emit = defineEmits<{
  (e: 'exit'): void
}>()

const viewportRef = ref<HTMLElement | null>(null)
const sceneRef = ref<HTMLElement | null>(null)
const gameStore = useGameStore()

const player = reactive({ x: 2500, y: 2500, size: 48 })
const camera = reactive({ x: 0, y: 0 })
const baseSpeed = 320

const mouseScreen = reactive({ x: 0, y: 0, active: false })
const mouseWorld = reactive({ x: 500, y: 500 })
const mouse = reactive({ down: false })

const worldSize = { width: 7500, height: 7500 }

const buildings = reactive<Building[]>([])
let nextBuildingId = 1
const captureRange = 48

const keys = reactive({ up: false, down: false, left: false, right: false })
const bullets = reactive<Bullet[]>([])
const explosions = reactive<Explosion[]>([])
const enemies = reactive<Enemy[]>([])
const isPaused = ref(false)

const SPRITE_FRAMES = 4
const SPRITE_FPS = 8
const playerFrame = ref(0)
let spriteAccumulator = 0
let isMoving = false

const selectedWeaponId = ref<WeaponId>(DEFAULT_WEAPON_ID)
const selectedWeapon = computed(() => WEAPON_CATALOG[selectedWeaponId.value])
const objectiveText = 'Sobrevive el mayor tiempo posible.'
const showObjective = ref(false)

const ORBIT_APPROACH_TIME = 1.0
const ORBIT_HOLD_TIME = 5.0
const ORBIT_RADIUS = 72
const ORBIT_ANGULAR_SPEED = Math.PI * 2.2
const EXPLOSIVE_DECEL = 280
const EXPLOSION_MAX_RADIUS = 80
const EXPLOSION_DURATION = 0.45
const PLAYER_HITBOX_SCALE = 0.25
const ENEMY_HITBOX_SCALE = 0.34

const sceneStyle = computed(
  () =>
    ({
      backgroundImage: `url(${escenarioImg})`,
      backgroundSize: '2500px 2500px',
      backgroundPosition: `${-camera.x}px ${-camera.y}px`,
      backgroundRepeat: 'repeat',
      width: '100%',
      height: '100vh',
      imageRendering: 'pixelated',
    }) as CSSProperties,
)

const playerStyle = computed(() => {
  const currentFrame = isMoving ? playerFrame.value : 0

  return {
    width: `${player.size}px`,
    height: `${player.size}px`,
    backgroundImage: `url(${spritesheetImg})`,
    backgroundSize: `${player.size}px ${player.size * SPRITE_FRAMES}px`,
    backgroundPosition: `0px ${-currentFrame * player.size}px`,
    backgroundRepeat: 'no-repeat',
    transform: `translate(${Math.round(player.x - camera.x)}px, ${Math.round(player.y - camera.y)}px) rotate(${aimAngleDeg.value}deg)`,
  } as CSSProperties
})

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

const customCursorStyle = computed(
  () =>
    ({
      backgroundImage: `url(${cursorImg})`,
      transform: `translate(${Math.round(mouseScreen.x)}px, ${Math.round(mouseScreen.y)}px)`,
      opacity: mouseScreen.active ? '1' : '0',
    }) as CSSProperties,
)

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
let nextExplosionId = 1
let nextEnemyId = 1
let shootAccumulator = 0
let enemySpawnInterval: number | null = null

function cycleWeapon(dir: 1 | -1) {
  const idx = WEAPON_ORDER.indexOf(selectedWeaponId.value)
  const next = (idx + dir + WEAPON_ORDER.length) % WEAPON_ORDER.length
  const nextWeapon = WEAPON_ORDER[next]
  if (nextWeapon) {
    selectedWeaponId.value = nextWeapon
  }
}

function randRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function spawnOffscreenPosition(minDistFromPlayer = 600) {
  // spawn somewhere outside the player's vicinity (off-screen)
  // choose a side: top, bottom, left, right
  const side = randRange(0, 3)
  let x = 0
  let y = 0
  const margin = 200
  if (side === 0) {
    // top
    x = randRange(-margin, worldSize.width + margin)
    y = -randRange(margin, margin + 400)
  } else if (side === 1) {
    // bottom
    x = randRange(-margin, worldSize.width + margin)
    y = worldSize.height + randRange(margin, margin + 400)
  } else if (side === 2) {
    // left
    x = -randRange(margin, margin + 400)
    y = randRange(-margin, worldSize.height + margin)
  } else {
    // right
    x = worldSize.width + randRange(margin, margin + 400)
    y = randRange(-margin, worldSize.height + margin)
  }

  // ensure sufficiently far from player
  const dx = x - player.x
  const dy = y - player.y
  if (Math.hypot(dx, dy) < minDistFromPlayer) {
    return spawnOffscreenPosition(minDistFromPlayer)
  }
  return { x, y }
}

function startDash() {
  if (gameStore.playerStats.currentdashes <= 0 || isDashing.value) return

  let dx = (keys.left ? -1 : 0) + (keys.right ? 1 : 0)
  let dy = (keys.up ? -1 : 0) + (keys.down ? 1 : 0)

  if (dx === 0 && dy === 0) {
    const angle = (aimAngleDeg.value * Math.PI) / 180
    dx = Math.cos(angle)
    dy = Math.sin(angle)
  }

  const len = Math.hypot(dx, dy)
  dashDirection.x = dx / len
  dashDirection.y = dy / len

  gameStore.playerStats.currentdashes--
  isDashing.value = true
  dashTimeLeft = dashDuration
}

function spawnEnemy(opts?: Partial<Enemy>) {
  const offscreen = spawnOffscreenPosition()
  const typeRoll = randRange(0, 100)
  const type: Enemy['type'] = typeRoll < 60 ? 'grunt' : typeRoll < 85 ? 'runner' : 'tank'
  const base: Enemy = {
    id: nextEnemyId++,
    x: opts?.x ?? offscreen.x,
    y: opts?.y ?? offscreen.y,
    size: opts?.size ?? (type === 'tank' ? 56 : type === 'runner' ? 28 : 40),
    speed: opts?.speed ?? (type === 'runner' ? 420 : type === 'tank' ? 90 : 160),
    hp: opts?.hp ?? (type === 'tank' ? 8 : type === 'runner' ? 2 : 4),
    maxHp: opts?.maxHp ?? (type === 'tank' ? 8 : type === 'runner' ? 2 : 4),
    color: opts?.color ?? (type === 'tank' ? '#ff8c66' : type === 'runner' ? '#ffd36b' : '#ff6b9a'),
    type,
  }
  enemies.push(base)
  return base
}

function getPlayerHitbox(): CircleHitbox {
  return {
    x: player.x + player.size / 2.5,
    y: player.y + player.size / 2,
    radius: player.size * PLAYER_HITBOX_SCALE,
  }
}

function getEnemyHitbox(enemy: Enemy): CircleHitbox {
  return {
    x: enemy.x,
    y: enemy.y,
    radius: enemy.size * ENEMY_HITBOX_SCALE,
  }
}

function circlesOverlap(a: CircleHitbox, b: CircleHitbox) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy)
  const minDist = a.radius + b.radius
  return {
    overlapping: dist < minDist,
    dist,
    minDist,
    dx,
    dy,
  }
}

const playerHitboxStyle = computed(() => {
  const hb = getPlayerHitbox()
  return {
    width: `${hb.radius * 2}px`,
    height: `${hb.radius * 2}px`,
    transform: `translate(${Math.round(hb.x - camera.x - hb.radius)}px, ${Math.round(hb.y - camera.y - hb.radius)}px)`,
  } as CSSProperties
})

function enemyHitboxStyle(enemy: Enemy) {
  const hb = getEnemyHitbox(enemy)
  return {
    width: `${hb.radius * 2}px`,
    height: `${hb.radius * 2}px`,
    transform: `translate(${Math.round(hb.x - camera.x - hb.radius)}px, ${Math.round(hb.y - camera.y - hb.radius)}px)`,
  } as CSSProperties
}

function spawnEnemies(count = 1) {
  for (let i = 0; i < count; i++) spawnEnemy()
}

function enemyStyle(e: Enemy) {
  const screenX = Math.round(e.x - camera.x - e.size / 2)
  const screenY = Math.round(e.y - camera.y - e.size / 2)
  return {
    width: `${e.size}px`,
    height: `${e.size}px`,
    transform: `translate(${screenX}px, ${screenY}px)`,
    borderRadius: '999px',
    background: e.color,
    boxShadow: '0 0 12px rgba(0,0,0,0.35)',
    zIndex: 7,
  } as CSSProperties
}

function updateEnemies(dt: number) {
  // simple AI: move towards player
  const playerHitbox = getPlayerHitbox()

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]
    const px = player.x + player.size / 2
    const py = player.y + player.size / 2
    const dx = px - e.x
    const dy = py - e.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist

    const moveSpeed = e.speed
    e.x += nx * moveSpeed * dt
    e.y += ny * moveSpeed * dt

    // Resolve overlap with player using circle hitboxes.
    const enemyHitbox = getEnemyHitbox(e)
    const overlap = circlesOverlap(playerHitbox, enemyHitbox)
    if (overlap.overlapping) {
      const safeDist = overlap.dist < 0.0001 ? 0.0001 : overlap.dist
      const push = overlap.minDist - safeDist
      const pushX = (overlap.dx / safeDist) * push
      const pushY = (overlap.dy / safeDist) * push
      e.x += pushX
      e.y += pushY
    }

    // check death
    if (e.hp <= 0) {
      enemies.splice(i, 1)
      continue
    }

    // clamp to world
    if (e.x < -200 || e.y < -200 || e.x > worldSize.width + 200 || e.y > worldSize.height + 200) {
      // if it wandered too far, respawn
      enemies.splice(i, 1)
      continue
    }
  }
}

function spawnBuildings(count = 8) {
  buildings.length = 0
  let attempts = 0
  while (buildings.length < count && attempts < count * 50) {
    attempts++
    const size = randRange(48, 96)
    const x = randRange(size, worldSize.width - size)
    const y = randRange(size, worldSize.height - size)

    const dx = x - player.x
    const dy = y - player.y
    if (Math.hypot(dx, dy) < 240) continue

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
  } as CSSProperties
}

function buildingStyle(b: Building) {
  const frameOffset = b.captured ? '100%' : '0%'
  return {
    width: `${b.size}px`,
    height: `${b.size}px`,
    transform: `translate(${Math.round(b.x - camera.x - b.size / 2)}px, ${Math.round(b.y - camera.y - b.size / 2)}px)`,

    backgroundImage: `url(${buildingSpritesheet})`,
    backgroundSize: '200% 100%',
    backgroundPosition: `${frameOffset} 0%`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',

    boxShadow: b.captured ? '0 0 18px rgba(80,200,120,0.45)' : '0 0 10px rgba(180,120,220,0.25)',
    zIndex: 5,
  } as CSSProperties
}

function bulletStyle(bullet: Bullet) {
  const screenX = Math.round(bullet.x - camera.x - bullet.size / 2)
  const screenY = Math.round(bullet.y - camera.y - bullet.size / 2)

  if (bullet.type === 'orbiting') {
    return {
      width: `${bullet.size}px`,
      height: `${bullet.size}px`,
      background: bullet.color,
      borderRadius: '2px',
      transform: `translate(${screenX}px, ${screenY}px)`,
      boxShadow: `0 0 8px ${bullet.color}`,
    } as CSSProperties
  }

  if (bullet.type === 'explosive') {
    const speed = Math.hypot(bullet.vx, bullet.vy)
    const maxSpeed = bullet.explosiveDeceleration! * 1.5
    const glow = Math.round((speed / maxSpeed) * 14)
    return {
      width: `${bullet.size}px`,
      height: `${bullet.size}px`,
      background: bullet.color,
      borderRadius: '99px',
      transform: `translate(${screenX}px, ${screenY}px)`,
      boxShadow: `0 0 ${glow}px rgba(168,218,220,0.85)`,
    } as CSSProperties
  }

  return {
    width: `${bullet.size}px`,
    height: `${bullet.size}px`,
    background: bullet.color,
    borderRadius: '99px',
    transform: `translate(${screenX}px, ${screenY}px)`,
  } as CSSProperties
}

function explosionStyle(exp: Explosion) {
  const progress = 1 - exp.ttl / exp.maxTtl
  const r = exp.radius
  const opacity = (1 - progress).toString()
  return {
    width: `${r * 2}px`,
    height: `${r * 2}px`,
    transform: `translate(${Math.round(exp.x - camera.x - r)}px, ${Math.round(exp.y - camera.y - r)}px)`,
    opacity,
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(255,200,80,0.9) 0%, rgba(255,100,30,0.6) 40%, rgba(255,60,0,0) 100%)',
    boxShadow: `0 0 ${Math.round(r * 0.6)}px rgba(255,160,40,0.7)`,
  } as CSSProperties
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

  if (e.key >= '1' && e.key <= '5') {
    const index = Number(e.key) - 1
    const id = WEAPON_ORDER[index]
    if (id) selectedWeaponId.value = id
  }

  if (e.key === 'q' || e.key === 'Q') cycleWeapon(-1)
  if (e.key === 'e' || e.key === 'E') cycleWeapon(1)

  if (e.key === 'f' || e.key === 'F') tryCapture()
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
  mouseWorld.x = mouseScreen.x + camera.x
  mouseWorld.y = mouseScreen.y + camera.y
}

function onMouseDown(e: MouseEvent) {
  if (isPaused.value) return
  onMouseMove(e)
  
  if (e.button === 0) { 
    mouse.down = true
    shootFromPlayer()
  } else if (e.button === 2) { 
    startDash()
  }
}

function onMouseUp(e: MouseEvent) {
  if (e.button !== 0) return
  mouse.down = false
  shootAccumulator = 0
}

function onMouseLeave() {
  mouseScreen.active = false
}

function onWheel(e: WheelEvent) {
  if (isPaused.value) return
  e.preventDefault()
  cycleWeapon(e.deltaY > 0 ? 1 : -1)
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
    const vx = Math.cos(shotAngle) * weapon.projectileSpeed
    const vy = Math.sin(shotAngle) * weapon.projectileSpeed

    if (weapon.orbiting) {
      bullets.push({
        id: nextBulletId++,
        x: startX,
        y: startY,
        vx,
        vy,
        size: weapon.projectileSize,
        ttl: weapon.projectileLifetime,
        maxTtl: weapon.projectileLifetime,
        damage: weapon.damage,
        color: weapon.projectileColor,
        type: 'orbiting',
        orbitPhase: Math.random() * Math.PI * 2,
        orbitRadius: ORBIT_RADIUS,
        orbitTimeElapsed: 0,
        orbitSpeed: ORBIT_ANGULAR_SPEED,
        initialVx: vx,
        initialVy: vy,
      })
    } else if (weapon.explosive) {
      bullets.push({
        id: nextBulletId++,
        x: startX,
        y: startY,
        vx,
        vy,
        size: weapon.projectileSize,
        ttl: weapon.projectileLifetime,
        maxTtl: weapon.projectileLifetime,
        damage: weapon.damage,
        color: weapon.projectileColor,
        type: 'explosive',
        explosiveDeceleration: EXPLOSIVE_DECEL,
      })
    } else {
      bullets.push({
        id: nextBulletId++,
        x: startX,
        y: startY,
        vx,
        vy,
        size: weapon.projectileSize,
        ttl: weapon.projectileLifetime,
        maxTtl: weapon.projectileLifetime,
        damage: weapon.damage,
        color: weapon.projectileColor,
        type: 'normal',
      })
    }
  }
}

function spawnExplosion(x: number, y: number) {
  explosions.push({
    id: nextExplosionId++,
    x,
    y,
    radius: 4,
    maxRadius: EXPLOSION_MAX_RADIUS,
    ttl: EXPLOSION_DURATION,
    maxTtl: EXPLOSION_DURATION,
  })
}

function updateBullets(dt: number) {
  const margin = 200

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i]
    if (!bullet) continue

    bullet.ttl -= dt

    if (bullet.type === 'orbiting') {
      bullet.orbitTimeElapsed! += dt
      const elapsed = bullet.orbitTimeElapsed!

      if (elapsed < ORBIT_APPROACH_TIME) {
        const t = elapsed / ORBIT_APPROACH_TIME
        const eased = t * t * (3 - 2 * t)
        const targetX = mouseWorld.x
        const targetY = mouseWorld.y
        bullet.x += bullet.initialVx! * dt * (1 - eased) + (targetX - bullet.x) * eased * dt * 4
        bullet.y += bullet.initialVy! * dt * (1 - eased) + (targetY - bullet.y) * eased * dt * 4
      } else if (elapsed < ORBIT_APPROACH_TIME + ORBIT_HOLD_TIME) {
        const orbitElapsed = elapsed - ORBIT_APPROACH_TIME
        const angle = bullet.orbitPhase! + orbitElapsed * bullet.orbitSpeed!
        bullet.x = mouseWorld.x + Math.cos(angle) * bullet.orbitRadius!
        bullet.y = mouseWorld.y + Math.sin(angle) * bullet.orbitRadius!
        bullet.vx = 0
        bullet.vy = 0
      } else {
        const orbitElapsed = elapsed - ORBIT_APPROACH_TIME
        const angle = bullet.orbitPhase! + orbitElapsed * bullet.orbitSpeed!
        if (bullet.vx === 0 && bullet.vy === 0) {
          bullet.vx = -Math.sin(angle) * bullet.orbitSpeed! * bullet.orbitRadius! * 0.5
          bullet.vy = Math.cos(angle) * bullet.orbitSpeed! * bullet.orbitRadius! * 0.5
        }
        bullet.x += bullet.vx * dt
        bullet.y += bullet.vy * dt
      }
    } else if (bullet.type === 'explosive') {
      const speed = Math.hypot(bullet.vx, bullet.vy)
      if (speed > 0) {
        const decel = Math.min(speed, bullet.explosiveDeceleration! * dt)
        const factor = (speed - decel) / speed
        bullet.vx *= factor
        bullet.vy *= factor
      }
      bullet.x += bullet.vx * dt
      bullet.y += bullet.vy * dt

      if (speed < 5 || bullet.ttl <= 0) {
        spawnExplosion(bullet.x, bullet.y)
        bullets.splice(i, 1)
        continue
      }
    } else {
      bullet.x += bullet.vx * dt
      bullet.y += bullet.vy * dt
    }

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

function updateExplosions(dt: number) {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const exp = explosions[i]
    if (!exp) continue
    exp.ttl -= dt
    const progress = 1 - exp.ttl / exp.maxTtl
    exp.radius = 4 + (exp.maxRadius - 4) * progress
    if (exp.ttl <= 0) {
      explosions.splice(i, 1)
    }
  }
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

function preventDefaultMenu(e: Event) {
  e.preventDefault();
}

function tryCapture() {
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
  nearest.captured = true
  applyBuff(nearest.buff)
}

function applyBuff(buff: { type: 'speed' | 'damage'; value: number; duration: number }) {
  gameStore.addBuff(buff)
}

function updateDash(dt: number) {
  if (isDashing.value) {
    dashTimeLeft -= dt
    player.x += dashDirection.x * dashForce * dt
    player.y += dashDirection.y * dashForce * dt
    clampPlayer()

    if (dashTimeLeft <= 0) {
      isDashing.value = false
    }
  }
  const stats = gameStore.playerStats
  if (stats.currentdashes < stats.maxdashes) {
    dashRechargeTimer += dt
    if (dashRechargeTimer >= dashCooldown) {
      dashRechargeTimer = 0
      stats.currentdashes = Math.min(stats.currentdashes + 1, stats.maxdashes)
    }
  } else {
    dashRechargeTimer = 0
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

  gameStore.updateBuffs(dt)
  updateDash(dt)  

  const speed = baseSpeed * gameStore.playerStats.speedMultiplier
  let vx = 0
  let vy = 0
  if (keys.up) vy -= 1
  if (keys.down) vy += 1
  if (keys.left) vx -= 1
  if (keys.right) vx += 1

  const moving = vx !== 0 || vy !== 0
  isMoving = moving

  if (moving) {
    const len = Math.hypot(vx, vy) || 1
    vx = (vx / len) * speed
    vy = (vy / len) * speed
    player.x += vx * dt
    player.y += vy * dt
    clampPlayer()

    spriteAccumulator += dt
    if (spriteAccumulator >= 1 / SPRITE_FPS) {
      spriteAccumulator -= 1 / SPRITE_FPS
      playerFrame.value = (playerFrame.value + 1) % SPRITE_FRAMES
    }
  } else {
    spriteAccumulator = 0
    playerFrame.value = 0
  }

  updateAutoShoot(dt)
  updateBullets(dt)
  updateExplosions(dt)
  updateEnemies(dt)
  updateCamera()

  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  gameStore.resetPlayerStats()
  window.removeEventListener('contextmenu', preventDefaultMenu);
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('wheel', onWheel, { passive: false })
  spawnBuildings(10)
  spawnEnemies(6)
  enemySpawnInterval = window.setInterval(() => spawnEnemies(1), 5000)

  showObjective.value = true
  setTimeout(() => {
    showObjective.value = false
  }, 5000)
  window.addEventListener('contextmenu', preventDefaultMenu);

  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('wheel', onWheel)
  if (rafId) cancelAnimationFrame(rafId)
  if (enemySpawnInterval) clearInterval(enemySpawnInterval)
})
</script>

<style scoped>
.game-viewpoint {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  cursor: none;
  user-select: none;
  -webkit-user-select: none; /* Para Safari/Chrome antiguo */
  -moz-user-select: none;    /* Para Firefox */
  -ms-user-select: none;
}

.game-scene {
  width: 100%;
  height: 100vh;
  position: relative;
  display: block;
  user-select: none;
}

.hud-actions {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 20;
  display: flex;
  gap: 10px;
}

.hud-button {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(198, 94, 255, 0.55);
  background: rgba(19, 8, 32, 0.92);
  color: #f5d3ff;
  padding: 0;
  border-radius: 14px;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 0 18px rgba(189, 77, 255, 0.18);
}

.hud-button-secondary {
  background: rgba(32, 12, 56, 0.94);
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
  border: 1px solid rgba(207, 84, 255, 0.45);
  background: rgba(11, 7, 24, 0.92);
  color: #ffffff;
  text-align: center;
  max-width: 320px;
  box-shadow: 0 0 20px rgba(206, 89, 255, 0.22);
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

.hud-name,
.hud-alias,
.hud-role,
.hud-help {
  margin: 0;
}

.hud-name {
  font-weight: 700;
  color: #f6e9ff;
}

.hud-alias {
  color: #ff7de9;
}

.hud-help {
  margin-top: 6px;
  color: rgba(180, 229, 255, 0.86);
}

.hud-stack {
  position: absolute;
  left: 10px;
  top: -35px;
  z-index: 15;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hud-stack-left {
  width: min(300px, calc(100vw - 20px));
}

.neon-card {
  position: relative;
  color: #f2e9ff;
  background:
    linear-gradient(180deg, rgba(14, 8, 28, 0.92), rgba(7, 8, 18, 0.9)), rgba(7, 8, 18, 0.86);
  border: 1px solid rgba(224, 92, 255, 0.72);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 0 22px rgba(202, 82, 255, 0.26),
    0 0 38px rgba(108, 51, 255, 0.1);
  clip-path: polygon(
    0 12px,
    12px 0,
    calc(100% - 16px) 0,
    100% 16px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    16px 100%,
    0 calc(100% - 16px)
  );
}

.neon-card::before {
  content: '';
  position: absolute;
  inset: 0;
  clip-path: inherit;
  border: 1px solid rgba(255, 121, 255, 0.18);
  pointer-events: none;
}

.neon-card::after {
  content: '';
  position: absolute;
  inset: 1px;
  clip-path: inherit;
  border: 1px solid rgba(99, 209, 255, 0.08);
  pointer-events: none;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.panel-mark {
  color: #ff82ff;
  font-size: 0.85rem;
  text-shadow: 0 0 12px rgba(255, 121, 255, 0.72);
}

.panel-title {
  margin: 0;
  color: #f0d9ff;
  font-size: 0.64rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.objective-panel {
  width: 170px;
  padding: 12px 14px 10px;
  background:
    linear-gradient(180deg, rgba(10, 9, 28, 0.94), rgba(7, 7, 18, 0.92)), rgba(7, 7, 18, 0.88);
  border-color: rgba(89, 132, 255, 0.55);
  animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.objective-copy {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.35;
  color: rgba(246, 235, 255, 0.92);
}

.weapon-panel {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(400px, calc(100vw - 20px));
  padding: 10px 12px;
  background: transparent;
  border: none;
}

.weapon-panel::before,
.weapon-panel::after {
  display: none;
}

.weapon-visual {
  flex: 0 0 86px;
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 109, 245, 0.32);
  background:
    radial-gradient(circle at center, rgba(255, 88, 220, 0.2), rgba(0, 0, 0, 0.28)),
    linear-gradient(180deg, rgba(30, 14, 52, 0.96), rgba(10, 8, 22, 0.96));
  overflow: hidden;
  box-shadow: 0 0 18px rgba(255, 109, 245, 0.12);
}

.weapon-image {
  width: 76%;
  height: 76%;
  object-fit: contain;
  image-rendering: pixelated;
}

.weapon-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.weapon-hints {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.hint-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  padding: 4px 7px;
  border-radius: 999px;
  border: 1px solid rgba(194, 120, 255, 0.4);
  background: rgba(16, 22, 42, 0.92);
  color: #bcecff;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
}

.music-circle {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 15;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 111, 211, 0.4);
  color: #ffd6f7;
  font-size: 1.2rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.music-circle:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 111, 211, 0.7);
  box-shadow: 0 0 18px rgba(255, 111, 211, 0.3);
}

.custom-cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  z-index: 100;
  transform-origin: 0 0;
  translate: -50% -50%;
}

.bullet {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 4;
}

.enemy {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}

.hitbox {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 999px;
  pointer-events: none;
}

.hitbox-player {
  border: 2px solid rgba(110, 227, 255, 0.95);
  box-shadow: 0 0 10px rgba(110, 227, 255, 0.45);
  z-index: 11;
}

.hitbox-enemy {
  border: 2px solid rgba(255, 93, 148, 0.9);
  box-shadow: 0 0 8px rgba(255, 93, 148, 0.35);
  z-index: 10;
}

.explosion {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 6;
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
</style>
