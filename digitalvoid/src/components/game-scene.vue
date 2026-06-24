<template>
  <div class="game-viewpoint" ref="viewportRef">
    <div class="game-scene" ref="sceneRef" :style="sceneStyle">
      <!-- World background (tiled) clipped to world bounds -->
      <div class="world" :style="worldStyle"></div>

      <div class="hud-stack hud-stack-left">
        <PlayerHub />

        <!-- OBJETIVO (primero) -->
        <section
          v-if="showObjective && !weaponUnlockMenu.visible && !upgradeMenu.visible"
          class="neon-card objective-panel"
        >
          <div class="panel-heading">
            <span class="panel-mark">⌬</span>
            <p class="panel-title">OBJETIVO</p>
          </div>
          <p class="objective-copy">{{ objectiveText }}</p>
        </section>
        <!-- DISPLAY CONTROLS (segundo) -->
        <section
          v-if="showObjective && !weaponUnlockMenu.visible && !upgradeMenu.visible"
          class="neon-card objective-panel"
        >
          <div class="panel-heading">
            <span class="panel-mark">⌬</span>
            <p class="panel-title">Display Controls</p>
          </div>
          <p class="Mostrar-Controles">
            W / A / S / D movimiento arriba, izquierda, abajo y derecha.
          </p>
        </section>
      </div>
      <!-- Weapon selector -->
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
        class="menu-toggle-button"
        type="button"
        :aria-label="isPaused ? 'Cerrar menú' : 'Abrir menú del sistema'"
        @click="togglePause"
      >
        {{ isPaused ? '×' : '☰' }}
      </button>

      <div class="top-score">
        <div class="score-card">
          <div class="score-label">SCORE</div>
          <div class="score-value">{{ currentScore }}</div>
        </div>
      </div>

      <Bosses
        :enemies="enemies"
        :bullets="bullets"
        :player="player"
        :player-size="playerSize"
        :camera="camera"
        :world-size="worldSize"
        :is-paused="isPaused"
        :is-game-over="isGameOver"
        :is-menu-open="isMenuOpen"
        @state-change="handleBossStateChange"
        @shake="onBossShake"
        @escape="handleBossEscape"
      />

      <!-- Upgrade Menu Overlay Centered -->
      <div v-if="weaponUnlockMenu.visible || upgradeMenu.visible" class="upgrade-overlay">
        <div class="upgrade-menu-container">
          <template v-if="weaponUnlockMenu.visible">
            <section class="neon-card objective-panel">
              <div class="panel-heading">
                <span class="panel-mark">⚙</span>
                <p class="panel-title">NUEVA ARMA</p>
              </div>
              <p class="objective-copy">Elegí un arma para desbloquear.</p>
            </section>

            <div class="upgrade-cards-row">
              <button
                v-for="weaponId in availableWeaponUnlocks"
                :key="weaponId"
                class="neon-card upgrade-card"
                @click="selectWeaponUnlock(weaponId)"
              >
                <div class="panel-heading">
                  <img
                    :src="WEAPON_CATALOG[weaponId].image"
                    :alt="WEAPON_CATALOG[weaponId].name"
                    class="panel-mark-icon"
                  />
                  <p class="panel-title">{{ WEAPON_CATALOG[weaponId].name }}</p>
                </div>
                <p class="objective-copy">
                  {{ WEAPON_CATALOG[weaponId].alias }} · {{ WEAPON_CATALOG[weaponId].role }}
                </p>
              </button>
            </div>
          </template>

          <template v-else-if="upgradeMenu.visible">
            <section class="neon-card objective-panel">
              <div class="panel-heading">
                <span class="panel-mark">✦</span>
                <p class="panel-title">MEJORA DISPONIBLE</p>
              </div>
              <p class="objective-copy">Elige una mejora para tu personaje.</p>
            </section>

            <div class="upgrade-cards-row">
              <button class="neon-card upgrade-card" @click="selectUpgrade('dash')">
                <div class="panel-heading">
                  <img :src="upgradeIcons.dash" alt="dash" class="panel-mark-icon" />
                  <p class="panel-title">DASH EXTRA</p>
                </div>
                <p class="objective-copy">+1 carga de dash permanente</p>
              </button>
              <button class="neon-card upgrade-card" @click="selectUpgrade('akimbo')">
                <div class="panel-heading">
                  <img :src="upgradeIcons.akimbo" alt="akimbo" class="panel-mark-icon" />
                  <p class="panel-title">AKIMBO</p>
                </div>
                <p class="objective-copy">Doble cadencia por 15 segundos</p>
              </button>
              <button class="neon-card upgrade-card" @click="selectUpgrade('health_up')">
                <div class="panel-heading">
                  <img :src="upgradeIcons.health_up" alt="health" class="panel-mark-icon" />
                  <p class="panel-title">VIDA MÁXIMA</p>
                </div>
                <p class="objective-copy">+30 de salud máxima permanente</p>
              </button>
            </div>
          </template>
        </div>
      </div>

      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-card">
          <p class="pause-title">Menú del sistema</p>
          <p class="pause-text">Elige una acción para seguir.</p>
          <br />
          <div class="pause-actions">
            <button
              class="pause-action-button pause-action-button-secondary"
              type="button"
              @click="togglePause"
            >
              Continuar
            </button>
            <button
              class="pause-action-button pause-action-button-secondary"
              type="button"
              @click="openSettingsFromGame"
            >
              Ajustes del sistema
            </button>
            <button
              class="pause-action-button pause-action-button-secondary"
              type="button"
              @click="exitGame"
            >
              Salir al menú principal
            </button>
          </div>
        </div>
      </div>

      <div v-if="isGameOver" class="lose-overlay">
        <div class="lose-card">
          <p class="lose-title">GAME LOSE</p>
          <p class="lose-score">Score final: {{ finalScore }}</p>
          <p class="lose-kills">Bajas: {{ finalKills }}</p>
          <p class="lose-best">Mejor score: {{ displayedBestScore }}</p>
          <p v-if="isNewRecord" class="lose-record">NUEVO RECORD</p>
          <button class="lose-button" type="button" @click="exitGame">
            Regresar al menu principal
          </button>
        </div>
      </div>

      <div v-if="nearestBuilding && hintVisible" class="capture-hint">
        <div class="hint-icon">🏢</div>
        <div>Presiona <strong>F</strong> para capturar</div>
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
        v-for="o in obstacles"
        :key="'obstacle-' + o.id"
        class="obstacle"
        :style="obstacleStyle(o)"
      ></div>

      <div
        v-for="bullet in bullets"
        :key="bullet.id"
        class="bullet"
        :style="bulletStyle(bullet)"
      ></div>

      <EnemyCharacter
        v-for="e in normalEnemies"
        :key="'enemy-' + e.id"
        :enemy="e"
        :camera="camera"
      />

      <template v-if="showHitboxes">
        <div
          v-for="e in normalEnemies"
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

      <div
        v-for="dn in damageNumbers"
        :key="dn.id"
        class="damage-number"
        :style="{
          left: `${Math.round(dn.x - camera.x)}px`,
          top: `${Math.round(dn.y - camera.y)}px`,
          opacity: dn.ttl / dn.maxTtl,
        }"
      >
        {{ dn.damage }}
      </div>

      <div class="player" :style="playerStyle"></div>
      <div v-if="isStunned" class="stun-ring" :style="stunStyle"></div>
      <div v-if="showDashBar || showAkimboBar" class="cooldown-bars" :style="cooldownBarsStyle">
        <div v-if="showDashBar" class="cooldown-bar cooldown-bar-dash">
          <div class="cooldown-bar-fill" :style="dashBarFillStyle"></div>
        </div>
        <div v-if="showAkimboBar" class="cooldown-bar cooldown-bar-akimbo">
          <div class="cooldown-bar-fill" :style="akimboBarFillStyle"></div>
        </div>
      </div>

      <div v-if="showHitboxes" class="hitbox hitbox-player" :style="playerHitboxStyle"></div>

      <div class="custom-cursor" :style="customCursorStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, type CSSProperties } from 'vue'
// import axios from 'axios'
import escenarioImg from '../assets/other/escenario.png'
import { DEFAULT_WEAPON_ID, WEAPON_CATALOG, WEAPON_ORDER, type WeaponId } from '../game/weapons.ts'
import { DEFAULT_CONTROLS, useGameStore } from '../stores/game.ts'
import PlayerHub from './player-hub.vue'
import Bosses from './boss-enemies.vue'
import EnemyCharacter from './EnemyCharacter.vue'
import spritesheetImg from '../assets/charactersprites/buggy.png'
import cursorImg from '../assets/other/cursorfire.png'
import buildingSpritesheet from '../assets/other/buildings.png'
import upgradeDashIcon from '../assets/icons/upgrade_dash.png'
import upgradeHealthIcon from '../assets/icons/upgrade_health.png'
import upgradeAkimboIcon from '../assets/icons/upgrade_akimbo.png'
import bulletTexture from '../assets/weaponsprites/Orbital.png'
import troyanoBulletSpritesheet from '../assets/weaponsprites/troyanobullet.png'
import memoriaBulletSpritesheet from '../assets/weaponsprites/memorybulletsprite.png'
import martilloBulletTexture from '../assets/weaponsprites/martillobullet.png'
import gusanoBulletSpritesheet from '../assets/weaponsprites/gusanosprite.png'

interface Bullet {
  id: number
  weaponId: WeaponId | string
  x: number
  y: number
  vx: number
  vy: number
  angleDeg?: number
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
  orbitTargetX?: number
  orbitTargetY?: number
  explosiveDeceleration?: number
  blastRadius?: number
  blastDamage?: number
  flashTimeElapsed?: number
  animTimeElapsed?: number
  piercing?: boolean
  bouncesLeft?: number
  owner?: 'player' | 'enemy'
  ownerId?: number
  stun?: boolean
  stunDuration?: number
  hitEnemyIds?: Set<number>
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

interface DamageNumber {
  id: number
  x: number
  y: number
  damage: number
  ttl: number
  maxTtl: number
  velocityY: number
}

interface Building {
  id: number
  x: number
  y: number
  size: number
  name: string
  captured: boolean
  upgradeType: 'dash' | 'akimbo' | 'health_up'
  areaRadius?: number
}

interface Obstacle {
  id: number
  x: number
  y: number
  w: number
  h: number
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
  type: 'grunt' | 'runner' | 'tank' | 'shooter' | 'mcaffe' | 'norton' | 'windows-defender'
  // optional runtime fields for special enemies
  shootTimer?: number
  shootCooldown?: number
  tornadoTimer?: number
  tornadoCooldown?: number
  explosiveTimer?: number
  explosiveCooldown?: number
}

interface CircleHitbox {
  x: number
  y: number
  radius: number
}

const emit = defineEmits<{
  (e: 'exit'): void
  (e: 'open-settings'): void
}>()

const viewportRef = ref<HTMLElement | null>(null)
const sceneRef = ref<HTMLElement | null>(null)
const gameStore = useGameStore()
const controlBindings = computed(() => ({
  ...DEFAULT_CONTROLS,
  ...gameStore.settings.controls,
}))

const player = reactive({ x: 2500, y: 2500 })

const playerSize = computed(() => gameStore.playerStats.playerSize)
const camera = reactive({ x: 0, y: 0 })
const baseSpeed = 320

const mouseScreen = reactive({ x: 0, y: 0, active: false })
const mouseWorld = reactive({ x: 500, y: 500 })
const mouse = reactive({ down: false })

const worldSize = { width: 7500, height: 7500 }

const buildings = reactive<Building[]>([])
let nextBuildingId = 1
const captureRange = 48
const obstacles = reactive<Obstacle[]>([])
let nextObstacleId = 1

const keys = reactive({ up: false, down: false, left: false, right: false })
const bullets = reactive<Bullet[]>([])
const explosions = reactive<Explosion[]>([])
const damageNumbers = reactive<DamageNumber[]>([])
const enemies = reactive<Enemy[]>([])
const isPaused = ref(false)
const showHitboxes = ref(false)
const playerDamageFlash = ref(false)
const playerDamageFlashTimer = ref(0)
const isGameOver = computed(() => gameStore.playerStats.health <= 0)
const isStunned = ref(false)
const stunTimeLeft = ref(0)
const DEFAULT_STUN_DURATION = 1.2

const stunStyle = computed(() => {
  const r = Math.round(playerSize.value * 1.6)
  const x = Math.round(player.x - camera.x - r + playerSize.value / 2)
  const y = Math.round(player.y - camera.y - r + playerSize.value / 2)
  return {
    width: `${r * 2}px`,
    height: `${r * 2}px`,
    transform: `translate(${x}px, ${y}px)`,
  } as CSSProperties
})

const isDashing = ref(false)
const dashDuration = 0.15
const dashForce = 1500
let dashTimeLeft = 0
const dashDirection = { x: 0, y: 0 }
const dashCooldown = 2
const dashRechargeTimer = ref(0)
const akimboTimeLeft = ref(0)

const upgradeMenu = reactive<{ visible: boolean; buildingId: number | null }>({
  visible: false,
  buildingId: null,
})

const upgradeIcons = {
  dash: upgradeDashIcon,
  akimbo: upgradeAkimboIcon,
  health_up: upgradeHealthIcon,
}

const SPRITE_FRAMES = 4
const SPRITE_FPS = 8
const playerFrame = ref(0)
let spriteAccumulator = 0
let isMoving = false

const selectedWeaponId = ref<WeaponId>(DEFAULT_WEAPON_ID)
const selectedWeapon = computed(() => WEAPON_CATALOG[selectedWeaponId.value])

// --- Desbloqueo de armas por nivel (múltiplos de 5) ---
const weaponUnlockMenu = reactive<{ visible: boolean }>({ visible: false })

const unlockedWeaponOrder = computed(() => {
  const unlocked = gameStore.playerStats.unlockedWeapons ?? [DEFAULT_WEAPON_ID]
  return WEAPON_ORDER.filter((id) => unlocked.includes(id))
})

const availableWeaponUnlocks = computed(() => {
  const unlocked = gameStore.playerStats.unlockedWeapons ?? [DEFAULT_WEAPON_ID]
  return WEAPON_ORDER.filter((id) => !unlocked.includes(id))
})

const isMenuOpen = computed(() => weaponUnlockMenu.visible || upgradeMenu.visible)
const isInputLocked = computed(
  () => isPaused.value || isMenuOpen.value || isGameOver.value || isStunned.value,
)

function tryOpenWeaponUnlockMenu() {
  if (weaponUnlockMenu.visible) return
  if (isPaused.value || upgradeMenu.visible || isGameOver.value) return

  const tokens = gameStore.playerStats.weaponUnlockTokens ?? 0
  if (tokens <= 0) return

  // Si ya no quedan armas por desbloquear, consumimos los tokens para no trabar el juego.
  if (availableWeaponUnlocks.value.length === 0) {
    gameStore.playerStats.weaponUnlockTokens = 0
    return
  }

  weaponUnlockMenu.visible = true
  // Evitar que queden teclas "pegadas" cuando se abre el menú.
  keys.up = false
  keys.down = false
  keys.left = false
  keys.right = false
  mouse.down = false
}

function selectWeaponUnlock(weaponId: WeaponId) {
  const unlocked = gameStore.playerStats.unlockedWeapons ?? [DEFAULT_WEAPON_ID]
  if (unlocked.includes(weaponId)) return

  gameStore.playerStats.unlockedWeapons = [...unlocked, weaponId]
  gameStore.playerStats.weaponUnlockTokens = Math.max(
    0,
    (gameStore.playerStats.weaponUnlockTokens ?? 0) - 1,
  )
  selectedWeaponId.value = weaponId
  weaponUnlockMenu.visible = false

  // Si todavía quedan tokens (por haber subido varios niveles de golpe), reintentar abrir.
  tryOpenWeaponUnlockMenu()
}

watch(
  () => gameStore.playerStats.weaponUnlockTokens,
  () => {
    tryOpenWeaponUnlockMenu()
  },
  { immediate: true },
)

watch(
  () => upgradeMenu.visible,
  (visible) => {
    if (!visible) tryOpenWeaponUnlockMenu()
  },
)

watch(isGameOver, (Over) => {
  if (Over) {
    return console.log('Subiendo puntaje....')
  }
})

const objectiveText = 'Sobrevive el mayor tiempo posible.'
const showObjective = ref(false)
const finalScore = computed(() => gameStore.playerStats.score)
const finalKills = computed(() => gameStore.playerStats.kills)
const storedHighScore = ref(0)
const displayedBestScore = computed(() => Math.max(storedHighScore.value, finalScore.value))
const isNewRecord = computed(() => finalScore.value > storedHighScore.value)
const currentScore = computed(() => gameStore.playerStats.score)

const ORBIT_APPROACH_TIME = 1.0
const ORBIT_HOLD_TIME = 5.0
const ORBIT_RADIUS = 72
const ORBIT_ANGULAR_SPEED = Math.PI * 2.2
const EXPLOSIVE_DECEL = 280
const EXPLOSION_MAX_RADIUS = 80
const EXPLOSION_DURATION = 0.45
const PLAYER_HITBOX_SCALE = 0.25
const ENEMY_HITBOX_SCALE = 0.34
const TROYANO_FLASH_INTERVAL = 8 / 60
const MEMORIA_FRAMES = 4
const MEMORIA_FRAME_INTERVAL = 8 / 60
const GUSANO_FRAMES = 4
const GUSANO_FRAME_INTERVAL = 8 / 60
const AKIMBO_DURATION = 15
const AKIMBO_BARREL_OFFSET = 12
const HIGH_SCORE_KEY = 'digitalvoidHighScore'

const sceneStyle = computed(
  () =>
    ({
      // Outside the world bounds you'll see this "void" color
      backgroundColor: '#05060b',
      width: '100%',
      height: '100vh',
      imageRendering: 'pixelated',
    }) as CSSProperties,
)

const worldStyle = computed(
  () =>
    ({
      width: `${worldSize.width}px`,
      height: `${worldSize.height}px`,
      backgroundImage: `url(${escenarioImg})`,
      backgroundSize: '1500px 1500px',
      backgroundRepeat: 'repeat',
      imageRendering: 'pixelated',
      boxSizing: 'border-box',
      // Move the world opposite the camera so the player appears centered.
      transform: `translate3d(${-Math.round(camera.x) + Math.round(screenShake.x)}px, ${-Math.round(camera.y) + Math.round(screenShake.y)}px, 0px)`,
      // Optional: visible border to clearly mark the world edge
      border: '2px solid rgba(120, 200, 255, 0.18)',
    }) as CSSProperties,
)

const playerStyle = computed(() => {
  const currentFrame = isMoving ? playerFrame.value : 0

  return {
    width: `${playerSize.value}px`,
    height: `${playerSize.value}px`,
    backgroundImage: `url(${spritesheetImg})`,
    backgroundSize: `${playerSize.value}px ${playerSize.value * SPRITE_FRAMES}px`,
    backgroundPosition: `0px ${-currentFrame * playerSize.value}px`,
    backgroundRepeat: 'no-repeat',
    transform: `translate(${Math.round(player.x - camera.x)}px, ${Math.round(
      player.y - camera.y,
    )}px) rotate(${aimAngleDeg.value}deg)`,
    filter: playerDamageFlash.value ? 'brightness(2) hue-rotate(320deg)' : 'none',
  } as CSSProperties
})

const playerCenterScreen = computed(() => ({
  x: player.x - camera.x + playerSize.value / 2,
  y: player.y - camera.y + playerSize.value / 2,
}))

const showDashBar = computed(
  () => gameStore.playerStats.currentdashes < gameStore.playerStats.maxdashes,
)
const dashCooldownProgress = computed(() => {
  if (!showDashBar.value) return 1
  return Math.min(1, Math.max(0, dashRechargeTimer.value / dashCooldown))
})

const showAkimboBar = computed(() => akimboTimeLeft.value > 0.0001)
const akimboProgress = computed(() => {
  if (!showAkimboBar.value) return 1
  return Math.min(1, Math.max(0, 1 - akimboTimeLeft.value / AKIMBO_DURATION))
})

const cooldownBarsStyle = computed(
  () =>
    ({
      transform: `translate3d(${Math.round(player.x - camera.x + playerSize.value / 2)}px, ${Math.round(
        player.y - camera.y + playerSize.value + 10,
      )}px, 0px) translateX(-50%)`,
    }) as CSSProperties,
)

const dashBarFillStyle = computed(
  () =>
    ({
      transform: `scaleX(${dashCooldownProgress.value})`,
    }) as CSSProperties,
)

const akimboBarFillStyle = computed(
  () =>
    ({
      transform: `scaleX(${akimboProgress.value})`,
    }) as CSSProperties,
)

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
  const px = player.x + playerSize.value / 2
  const py = player.y + playerSize.value / 2
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
let lastDamageTime = 0
const DAMAGE_COOLDOWN = 0.5 // segundos entre cada daño
const ENEMY_DAMAGE = {
  grunt: 10,
  runner: 8,
  tank: 15,
  shooter: 18,
  mcaffe: 26,
  'windows-defender': 42,
}
const ENEMY_EXPERIENCE = {
  grunt: 25,
  runner: 35,
  tank: 50,
  shooter: 55,
  mcaffe: 250,
  'windows-defender': 0,
}
const ENEMY_SPAWN_INTERVAL_MS = 1
const MIN_ACTIVE_ENEMIES = 40
const MAX_ACTIVE_ENEMIES = 60
const ENEMY_TYPES: Enemy['type'][] = ['grunt', 'runner', 'tank', 'shooter']
const normalEnemies = computed(() =>
  enemies.filter(
    (enemy) =>
      enemy.type !== 'mcaffe' && enemy.type !== 'norton' && enemy.type !== 'windows-defender',
  ),
)
const bossActive = ref(false)
const screenShake = reactive({ x: 0, y: 0, timeLeft: 0, intensity: 0, duration: 0 })

function cycleWeapon(dir: 1 | -1) {
  const order =
    unlockedWeaponOrder.value.length > 0 ? unlockedWeaponOrder.value : [DEFAULT_WEAPON_ID]
  const idx = order.indexOf(selectedWeaponId.value)
  const next = (idx + dir + order.length) % order.length
  const nextWeapon = order[next]
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
  if (gameStore.playerStats.currentdashes <= 0 || isDashing.value || isStunned.value) return

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
  // start recharge bar immediately when consuming a dash
  dashRechargeTimer.value = 0
  isDashing.value = true
  dashTimeLeft = dashDuration
}

function spawnEnemy(opts?: Partial<Enemy>) {
  const offscreen = spawnOffscreenPosition()
  const typeRoll = randRange(0, 100)
  const randomType: Enemy['type'] =
    typeRoll < 55 ? 'grunt' : typeRoll < 80 ? 'runner' : typeRoll < 95 ? 'tank' : 'shooter'
  const type = opts?.type ?? randomType
  const base: Enemy = {
    id: nextEnemyId++,
    x: opts?.x ?? offscreen.x,
    y: opts?.y ?? offscreen.y,
    size:
      opts?.size ?? (type === 'tank' ? 100 : type === 'runner' ? 50 : type === 'shooter' ? 55 : 70),
    speed:
      opts?.speed ??
      (type === 'runner' ? 420 : type === 'tank' ? 90 : type === 'shooter' ? 120 : 160),
    hp: opts?.hp ?? (type === 'tank' ? 70 : type === 'runner' ? 8 : type === 'shooter' ? 40 : 32),
    maxHp:
      opts?.maxHp ?? (type === 'tank' ? 80 : type === 'runner' ? 20 : type === 'shooter' ? 40 : 60),
    color:
      opts?.color ??
      (type === 'tank'
        ? '#ff8c66'
        : type === 'runner'
          ? '#ffd36b'
          : type === 'shooter'
            ? '#6bff8a'
            : '#ff6b9a'),
    type,
  }
  if (type === 'shooter') {
    base.shootCooldown = opts?.shootCooldown ?? 0.55
    base.shootTimer = opts?.shootTimer ?? 0
  }
  enemies.push(base)
  return base
}

function getPlayerHitbox(): CircleHitbox {
  return {
    x: player.x + playerSize.value / 2.5,
    y: player.y + playerSize.value / 2,
    radius: playerSize.value * PLAYER_HITBOX_SCALE,
  }
}

function getEnemyHitbox(enemy: Enemy): CircleHitbox {
  return {
    x: enemy.x,
    y: enemy.y,
    radius: enemy.size * ENEMY_HITBOX_SCALE,
  }
}

function getObstacleRect(o: Obstacle) {
  return {
    left: o.x - o.w / 2,
    right: o.x + o.w / 2,
    top: o.y - o.h / 2,
    bottom: o.y + o.h / 2,
  }
}

function circleRectOverlap(
  circle: CircleHitbox,
  rectObj: { left: number; right: number; top: number; bottom: number },
) {
  const nearestX = Math.max(rectObj.left, Math.min(circle.x, rectObj.right))
  const nearestY = Math.max(rectObj.top, Math.min(circle.y, rectObj.bottom))
  const dx = circle.x - nearestX
  const dy = circle.y - nearestY
  // PERF: avoid sqrt unless overlapping
  const dist2 = dx * dx + dy * dy
  const r2 = circle.radius * circle.radius
  const overlapping = dist2 < r2
  const dist = overlapping ? Math.sqrt(dist2) : 0
  return {
    overlapping,
    dist,
    dx,
    dy,
    nearestX,
    nearestY,
    penetration: overlapping ? circle.radius - dist : 0,
  }
}

function getBuildingHitbox(b: Building): CircleHitbox {
  return {
    x: b.x,
    y: b.y,
    radius: Math.max(8, b.size * 0.5),
  }
}

function getBulletHitbox(bullet: Bullet): CircleHitbox {
  return {
    x: bullet.x,
    y: bullet.y,
    radius: Math.max(2, bullet.size * 0.5),
  }
}

function consumeBulletBounce(bullet: Bullet) {
  const bounces = bullet.bouncesLeft ?? 0
  if (bounces <= 0) return false
  bullet.bouncesLeft = bounces - 1
  bullet.ttl -= 0.04
  return true
}

function bounceBulletOnWorldBounds(bullet: Bullet) {
  const radius = Math.max(2, bullet.size * 0.5)
  let bounced = false

  if (bullet.x - radius < 0) {
    bullet.x = radius
    bullet.vx = Math.abs(bullet.vx)
    bounced = true
  } else if (bullet.x + radius > worldSize.width) {
    bullet.x = worldSize.width - radius
    bullet.vx = -Math.abs(bullet.vx)
    bounced = true
  }

  if (bullet.y - radius < 0) {
    bullet.y = radius
    bullet.vy = Math.abs(bullet.vy)
    bounced = true
  } else if (bullet.y + radius > worldSize.height) {
    bullet.y = worldSize.height - radius
    bullet.vy = -Math.abs(bullet.vy)
    bounced = true
  }

  if (!bounced) return false
  if (!consumeBulletBounce(bullet)) return false

  bullet.vx *= 0.75
  bullet.vy *= 0.75
  return true
}

function bounceBulletOnObstacle(
  bullet: Bullet,
  rect: { left: number; right: number; top: number; bottom: number },
) {
  const radius = Math.max(2, bullet.size * 0.5)
  const overlapO = circleRectOverlap(getBulletHitbox(bullet), rect)
  if (!overlapO.overlapping) return false
  if (!consumeBulletBounce(bullet)) return false

  const overlapLeft = Math.abs(bullet.x + radius - rect.left)
  const overlapRight = Math.abs(rect.right - (bullet.x - radius))
  const overlapTop = Math.abs(bullet.y + radius - rect.top)
  const overlapBottom = Math.abs(rect.bottom - (bullet.y - radius))

  const minHorizontal = Math.min(overlapLeft, overlapRight)
  const minVertical = Math.min(overlapTop, overlapBottom)

  if (minHorizontal < minVertical) {
    if (overlapLeft < overlapRight) {
      bullet.x = rect.left - radius - 0.5
      bullet.vx = -Math.abs(bullet.vx)
    } else {
      bullet.x = rect.right + radius + 0.5
      bullet.vx = Math.abs(bullet.vx)
    }
  } else {
    if (overlapTop < overlapBottom) {
      bullet.y = rect.top - radius - 0.5
      bullet.vy = -Math.abs(bullet.vy)
    } else {
      bullet.y = rect.bottom + radius + 0.5
      bullet.vy = Math.abs(bullet.vy)
    }
  }

  bullet.vx *= 0.75
  bullet.vy *= 0.75
  return true
}

function circlesOverlap(a: CircleHitbox, b: CircleHitbox) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const minDist = a.radius + b.radius
  // PERF: avoid sqrt unless overlapping
  const dist2 = dx * dx + dy * dy
  const overlapping = dist2 < minDist * minDist
  const dist = overlapping ? Math.sqrt(dist2) : 0
  return {
    overlapping,
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
    transform: `translate(${Math.round(hb.x - camera.x - hb.radius)}px, ${Math.round(
      hb.y - camera.y - hb.radius,
    )}px)`,
  } as CSSProperties
})

function enemyHitboxStyle(enemy: Enemy) {
  const hb = getEnemyHitbox(enemy)
  return {
    width: `${hb.radius * 2}px`,
    height: `${hb.radius * 2}px`,
    transform: `translate(${Math.round(hb.x - camera.x - hb.radius)}px, ${Math.round(
      hb.y - camera.y - hb.radius,
    )}px)`,
  } as CSSProperties
}

function spawnEnemies(count = 1) {
  for (let i = 0; i < count; i++) spawnEnemy()
}

function spawnEnemyTick() {
  if (isPaused.value || isGameOver.value || bossActive.value) return

  const missingTypes = ENEMY_TYPES.filter((type) => !enemies.some((enemy) => enemy.type === type))

  if (enemies.length < MIN_ACTIVE_ENEMIES) {
    const missing = MIN_ACTIVE_ENEMIES - enemies.length
    const spawnCount = Math.min(6, missing)
    for (let i = 0; i < spawnCount; i += 1) {
      const forcedType = missingTypes.shift()
      if (forcedType) {
        spawnEnemy({ type: forcedType })
      } else {
        spawnEnemy()
      }
    }
    return
  }

  if (missingTypes.length > 0 && enemies.length < MAX_ACTIVE_ENEMIES) {
    const forcedType = missingTypes[randRange(0, missingTypes.length - 1)]
    if (forcedType) {
      spawnEnemy({ type: forcedType })
      return
    }
  }

  if (enemies.length < MAX_ACTIVE_ENEMIES) spawnEnemy()
}

function updateEnemies(dt: number) {
  // simple AI: move towards player
  const playerHitbox = getPlayerHitbox()

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]
    if (!e) continue
    if (e.type === 'mcaffe' || e.type === 'norton' || e.type === 'windows-defender') continue
    const px = player.x + playerSize.value / 2
    const py = player.y + playerSize.value / 2
    const dx = px - e.x
    const dy = py - e.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist

    if (e.type === 'shooter') {
      if (e.shootTimer === undefined) {
        e.shootTimer = 0
      }
      const SHOOTER_STOP_DISTANCE = 500

      // Move until it reaches the stop distance.
      if (dist > SHOOTER_STOP_DISTANCE) {
        const moveSpeed = e.speed
        e.x += nx * moveSpeed * dt
        e.y += ny * moveSpeed * dt
      } else {
        // Once in position, start shooting continuously.
        e.shootTimer -= dt
        if (e.shootTimer <= 0) {
          shootFromEnemy(e, px, py)
          e.shootTimer = e.shootCooldown ?? 0.55
        }
      }
    } else {
      const moveSpeed = e.speed
      e.x += nx * moveSpeed * dt
      e.y += ny * moveSpeed * dt
    }

    // Resolve overlap with buildings
    const enemyHit = getEnemyHitbox(e)
    for (let bi = 0; bi < buildings.length; bi++) {
      const b = buildings[bi]
      if (!b) continue
      const overlapB = circlesOverlap(enemyHit, getBuildingHitbox(b!))
      if (!overlapB.overlapping) continue
      const safeDist = overlapB.dist < 0.0001 ? 0.0001 : overlapB.dist
      const push = overlapB.minDist - safeDist
      const pushX = (overlapB.dx / safeDist) * push
      const pushY = (overlapB.dy / safeDist) * push
      e.x -= pushX
      e.y -= pushY
    }

    // Resolve overlap with obstacles (rectangles)
    for (let oi = 0; oi < obstacles.length; oi++) {
      const o = obstacles[oi]
      if (!o) continue
      const rect = getObstacleRect(o!)
      const overlapO = circleRectOverlap(enemyHit, rect)
      if (!overlapO.overlapping) continue
      const safeDistO = overlapO.dist < 0.0001 ? 0.0001 : overlapO.dist
      const nx = (enemyHit.x - overlapO.nearestX) / safeDistO
      const ny = (enemyHit.y - overlapO.nearestY) / safeDistO
      e.x += nx * (overlapO.penetration + 1)
      e.y += ny * (overlapO.penetration + 1)
    }

    // Resolve overlap with player using circle hitboxes.
    const enemyHitbox = getEnemyHitbox(e)
    const overlap = circlesOverlap(playerHitbox, enemyHitbox)
    if (overlap.overlapping) {
      // Aplicar daño al jugador si pasó el cooldown
      if (lastDamageTime <= 0) {
        const damageAmount = ENEMY_DAMAGE[e.type]
        gameStore.takeDamage(damageAmount)
        lastDamageTime = DAMAGE_COOLDOWN
        playerDamageFlash.value = true
        playerDamageFlashTimer.value = 0.2
      }

      // Push del enemigo hacia atrás
      const safeDist = overlap.dist < 0.0001 ? 0.0001 : overlap.dist
      const push = overlap.minDist - safeDist
      const pushX = (overlap.dx / safeDist) * push
      const pushY = (overlap.dy / safeDist) * push
      e.x += pushX
      e.y += pushY
    }

    // check death
    if (e.hp <= 0) {
      gameStore.incrementKills()
      const experienceAmount = ENEMY_EXPERIENCE[e.type]
      gameStore.addExperience(experienceAmount)
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
  const upgradeTypes: Array<'dash' | 'akimbo' | 'health_up'> = ['dash', 'akimbo', 'health_up']
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

    const upgradeType = upgradeTypes[buildings.length % upgradeTypes.length]!
    const areaRadius = Math.floor(size * 1.6)

    buildings.push({
      id: nextBuildingId++,
      x,
      y,
      size,
      name: `Edificio ${buildings.length + 1}`,
      captured: false,
      upgradeType,
      areaRadius,
    })
  }
}

function buildingAreaStyle(b: Building) {
  const r = b.areaRadius || Math.round(b.size * 1.6)
  return {
    width: `${r * 2}px`,
    height: `${r * 2}px`,
    transform: `translate(${Math.round(b.x - camera.x - r)}px, ${Math.round(b.y - camera.y - r)}px)`,
    background: b.captured ? 'rgba(37,40,91,0.08)' : 'rgba(60,120,220,0.08)',
    border: b.captured ? '2px solid rgba(74,48,81,0.12)' : '1px dashed rgba(120,140,200,0.12)',
    borderRadius: '999px',
    zIndex: 1,
  } as CSSProperties
}

function buildingStyle(b: Building) {
  const frameOffset = b.captured ? '100%' : '0%'
  return {
    width: `${b.size}px`,
    height: `${b.size}px`,
    transform: `translate(${Math.round(b.x - camera.x - b.size / 2)}px, ${Math.round(
      b.y - camera.y - b.size / 2,
    )}px)`,

    backgroundImage: `url(${buildingSpritesheet})`,
    backgroundSize: '200% 100%',
    backgroundPosition: `${frameOffset} 0%`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',

    boxShadow: b.captured ? '0 0 18px rgba(74,48,81,0.12)' : '0 0 10px rgba(180,120,220,0.25)',
    zIndex: 5,
  } as CSSProperties
}

function obstacleStyle(o: Obstacle) {
  const screenX = Math.round(o.x - camera.x - o.w / 2)
  const screenY = Math.round(o.y - camera.y - o.h / 2)
  return {
    width: `${o.w}px`,
    height: `${o.h}px`,
    transform: `translate(${screenX}px, ${screenY}px)`,
    background: 'linear-gradient(180deg,#2b2b3a,#1b1b22)',
    border: '2px solid rgba(120,120,140,0.6)',
    boxShadow: '0 0 18px rgba(0,0,0,0.45)',
    zIndex: 4,
  } as CSSProperties
}

function spawnObstacles(count = 6) {
  let attempts = 0
  while (obstacles.length < count && attempts < count * 50) {
    attempts++
    const w = randRange(48, 220)
    const h = randRange(24, 160)
    const x = randRange(w / 2, worldSize.width - w / 2)
    const y = randRange(h / 2, worldSize.height - h / 2)

    const dx = x - player.x
    const dy = y - player.y
    if (Math.hypot(dx, dy) < 240) continue

    let collides = false
    const rect = { left: x - w / 2, right: x + w / 2, top: y - h / 2, bottom: y + h / 2 }
    for (const b of buildings) {
      const bb = {
        left: b.x - b.size / 2,
        right: b.x + b.size / 2,
        top: b.y - b.size / 2,
        bottom: b.y + b.size / 2,
      }
      if (
        !(
          rect.right < bb.left ||
          rect.left > bb.right ||
          rect.bottom < bb.top ||
          rect.top > bb.bottom
        )
      ) {
        collides = true
        break
      }
    }
    if (collides) continue

    obstacles.push({ id: nextObstacleId++, x, y, w, h })
  }
}

function bulletStyle(bullet: Bullet) {
  const screenX = Math.round(bullet.x - camera.x - bullet.size / 2)
  const screenY = Math.round(bullet.y - camera.y - bullet.size / 2)

  if (bullet.type === 'orbiting') {
    const isBossTornado = bullet.weaponId === 'mcaffe'
    const isWindowsOrbit = bullet.weaponId === 'windows-orbit'
    const isPlayerOrbit = bullet.weaponId === 'tormenta_anuncios'

    if (isPlayerOrbit) {
      const rotationDeg = bullet.angleDeg ?? 0
      return {
        width: `${bullet.size}px`,
        height: `${bullet.size}px`,
        backgroundImage: `url(${bulletTexture})`, // o el sprite que uses para orbiting
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: '0px',
        imageRendering: 'pixelated',
        transform: `translate3d(${screenX}px, ${screenY}px, 0px) rotate(${rotationDeg}deg)`,
      } as CSSProperties
    }

    return {
      width: `${bullet.size}px`,
      height: `${bullet.size}px`,
      backgroundImage: isWindowsOrbit ? 'none' : `url(${bulletTexture})`,
      background: isWindowsOrbit
        ? 'radial-gradient(circle, rgba(248,255,250,1) 0%, rgba(152,255,204,0.95) 45%, rgba(84,226,158,0.92) 100%)'
        : undefined,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      borderRadius: isWindowsOrbit ? '50%' : '2px',
      transform: `translate3d(${screenX}px, ${screenY}px, 0px)`,
      imageRendering: 'pixelated',
      boxShadow: isWindowsOrbit
        ? '0 0 18px rgba(115, 255, 184, 0.9)'
        : isBossTornado
          ? '0 0 16px rgba(255, 120, 160, 0.8)'
          : '0 0 10px rgba(255,255,255,0.22)',
    } as CSSProperties
  }

  if (bullet.type === 'explosive') {
    if (bullet.weaponId === 'mcaffe-explosive') {
      const pulse = Math.sin((bullet.flashTimeElapsed ?? 0) * 12) * 0.5 + 0.5
      const innerAlpha = 0.85 + pulse * 0.15
      return {
        width: `${bullet.size}px`,
        height: `${bullet.size}px`,
        background: `radial-gradient(circle, rgba(255,255,255,${innerAlpha}) 0%, rgba(255,140,20,0.95) 35%, rgba(220,40,10,0.88) 65%, rgba(80,0,0,0) 100%)`,
        borderRadius: '50%',
        boxShadow: `0 0 ${18 + pulse * 10}px rgba(255, 80, 0, 0.85)`,
        transform: `translate3d(${screenX}px, ${screenY}px, 0px)`,
      } as CSSProperties
    }

    const frame = Math.floor((bullet.flashTimeElapsed ?? 0) / TROYANO_FLASH_INTERVAL) % 2
    const backgroundX = frame === 0 ? '0%' : '100%'
    return {
      width: `${bullet.size}px`,
      height: `${bullet.size}px`,
      backgroundImage: `url(${troyanoBulletSpritesheet})`,
      backgroundSize: '200% 100%',
      backgroundPosition: `${backgroundX} 0%`,
      backgroundRepeat: 'no-repeat',
      borderRadius: '0px',
      transform: `translate3d(${screenX}px, ${screenY}px, 0px)`,
    } as CSSProperties
  }

  if (bullet.type === 'normal') {
    const rotationDeg = bullet.angleDeg ?? Math.atan2(bullet.vy, bullet.vx) * (180 / Math.PI) + 90

    if (bullet.weaponId === 'mcaffe' && bullet.owner === 'enemy') {
      return {
        width: `${bullet.size}px`,
        height: `${bullet.size}px`,
        background: `radial-gradient(circle, rgba(255,255,255,0.92) 0%, ${bullet.color} 42%, rgba(0,0,0,0) 100%)`,
        borderRadius: '50%',
        boxShadow: '0 0 14px rgba(255, 120, 160, 0.65)',
        transform: `translate3d(${screenX}px, ${screenY}px, 0px) rotate(${rotationDeg}deg)`,
      } as CSSProperties
    }

    if (bullet.weaponId === 'norton-lightning') {
      const width = Math.max(12, Math.round(bullet.size * 2.2))
      const height = Math.max(3, Math.round(bullet.size * 0.8))
      const dartX = Math.round(bullet.x - camera.x - width / 2)
      const dartY = Math.round(bullet.y - camera.y - height / 2)
      return {
        width: `${width}px`,
        height: `${height}px`,
        background:
          'linear-gradient(90deg, rgba(225,248,255,0.2) 0%, rgba(225,248,255,0.95) 32%, rgba(126,226,255,0.98) 70%, rgba(94,166,255,0.92) 100%)',
        borderRadius: '2px',
        boxShadow: '0 0 10px rgba(116, 220, 255, 0.75)',
        transform: `translate3d(${dartX}px, ${dartY}px, 0px) rotate(${rotationDeg}deg)`,
        transformOrigin: 'center',
      } as CSSProperties
    }

    // Enemy shooter bullet: draw a small dart so it's easy to see.
    if (bullet.weaponId === 'shooter') {
      const width = Math.max(10, Math.round(bullet.size * 2))
      const height = Math.max(2, Math.round(bullet.size * 0.6))
      const dartX = Math.round(bullet.x - camera.x - width / 2)
      const dartY = Math.round(bullet.y - camera.y - height / 2)
      return {
        width: `${width}px`,
        height: `${height}px`,
        background:
          'linear-gradient(90deg, rgba(234,246,255,0.15) 0%, rgba(234,246,255,0.95) 40%, rgba(140,220,255,0.95) 100%)',
        borderRadius: '2px',
        boxShadow: '0 0 8px rgba(140,220,255,0.55)',
        transform: `translate3d(${dartX}px, ${dartY}px, 0px) rotate(${rotationDeg}deg)`,
        transformOrigin: 'center',
      } as CSSProperties
    }

    if (bullet.weaponId === 'Disparo_Memoria') {
      const frame =
        Math.floor((bullet.animTimeElapsed ?? 0) / MEMORIA_FRAME_INTERVAL) % MEMORIA_FRAMES
      const backgroundX = (frame / (MEMORIA_FRAMES - 1)) * 100
      return {
        width: `${bullet.size}px`,
        height: `${bullet.size}px`,
        backgroundImage: `url(${memoriaBulletSpritesheet})`,
        backgroundSize: `${MEMORIA_FRAMES * 100}% 100%`,
        backgroundPosition: `${backgroundX}% 0%`,
        backgroundRepeat: 'no-repeat',
        borderRadius: '0px',
        imageRendering: 'pixelated',
        transform: `translate3d(${screenX}px, ${screenY}px, 0px) rotate(${rotationDeg}deg)`,
      } as CSSProperties
    }

    if (bullet.weaponId === 'gusano') {
      const frame =
        Math.floor((bullet.animTimeElapsed ?? 0) / GUSANO_FRAME_INTERVAL) % GUSANO_FRAMES
      const backgroundX = (frame / (GUSANO_FRAMES - 1)) * 100
      return {
        width: `${bullet.size}px`,
        height: `${bullet.size}px`,
        backgroundImage: `url(${gusanoBulletSpritesheet})`,
        backgroundSize: `${GUSANO_FRAMES * 100}% 100%`,
        backgroundPosition: `${backgroundX}% 0%`,
        backgroundRepeat: 'no-repeat',
        borderRadius: '0px',
        imageRendering: 'pixelated',
        transform: `translate3d(${screenX}px, ${screenY}px, 0px) rotate(${rotationDeg}deg)`,
      } as CSSProperties
    }

    const sprite = bullet.weaponId === 'ransomware' ? martilloBulletTexture : bulletTexture

    return {
      width: `${bullet.size}px`,
      height: `${bullet.size}px`,
      backgroundImage: `url(${sprite})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '0px',
      imageRendering: 'pixelated',
      transform: `translate3d(${screenX}px, ${screenY}px, 0px) rotate(${rotationDeg}deg)`,
    } as CSSProperties
  }

  return {
    width: `${bullet.size}px`,
    height: `${bullet.size}px`,
    backgroundImage: `url(${bulletTexture})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    borderRadius: '99px',
    imageRendering: 'pixelated',
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

function spawnExplosion(x: number, y: number, maxRadius = EXPLOSION_MAX_RADIUS) {
  explosions.push({
    id: nextExplosionId++,
    x,
    y,
    radius: 4,
    maxRadius,
    ttl: EXPLOSION_DURATION,
    maxTtl: EXPLOSION_DURATION,
  })
}

let nextDamageNumberId = 1

function spawnDamageNumber(x: number, y: number, damage: number) {
  damageNumbers.push({
    id: nextDamageNumberId++,
    x: x + (Math.random() * 20 - 10),
    y: y - 20,
    damage,
    ttl: 1,
    maxTtl: 1,
    velocityY: -60,
  })
}

function applyAreaDamageToPlayer(x: number, y: number, radius: number, damage: number) {
  const playerHitbox = getPlayerHitbox()
  const overlap = circlesOverlap({ x, y, radius }, playerHitbox)
  if (overlap.overlapping) {
    gameStore.takeDamage(damage)
    playerDamageFlash.value = true
    playerDamageFlashTimer.value = 0.2
  }
}

function matchesBinding(event: KeyboardEvent, binding: string) {
  const normalizedBinding = binding.toLowerCase()
  const normalizedKey = event.key.toLowerCase()
  return event.code === binding || normalizedKey === normalizedBinding || event.key === binding
}

function onKeyDown(e: KeyboardEvent) {
  if (matchesBinding(e, controlBindings.value.pause)) {
    // Si hay un menú abierto (upgrade/armas), evitamos el toggle de pausa para no romper el flow.
    if (!isMenuOpen.value) togglePause()
    return
  }

  if (isInputLocked.value) return

  let handled = false

  if (matchesBinding(e, controlBindings.value.moveUp)) {
    keys.up = true
    handled = true
  }

  if (matchesBinding(e, controlBindings.value.moveDown)) {
    keys.down = true
    handled = true
  }

  if (matchesBinding(e, controlBindings.value.moveLeft)) {
    keys.left = true
    handled = true
  }

  if (matchesBinding(e, controlBindings.value.moveRight)) {
    keys.right = true
    handled = true
  }

  if (e.key >= '1' && e.key <= '5') {
    const index = Number(e.key) - 1
    const id = WEAPON_ORDER[index]
    if (id && unlockedWeaponOrder.value.includes(id)) {
      selectedWeaponId.value = id
    }
  }

  if (matchesBinding(e, controlBindings.value.weaponPrev)) {
    cycleWeapon(-1)
    handled = true
  }

  if (matchesBinding(e, controlBindings.value.weaponNext)) {
    cycleWeapon(1)
    handled = true
  }

  if (matchesBinding(e, controlBindings.value.interact)) {
    tryCapture()
    handled = true
  }

  if (handled) {
    e.preventDefault()
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (matchesBinding(e, controlBindings.value.moveUp)) keys.up = false
  if (matchesBinding(e, controlBindings.value.moveDown)) keys.down = false
  if (matchesBinding(e, controlBindings.value.moveLeft)) keys.left = false
  if (matchesBinding(e, controlBindings.value.moveRight)) keys.right = false
}

function onMouseMove(e: MouseEvent) {
  if (!sceneRef.value) return
  const rect = sceneRef.value.getBoundingClientRect()
  mouseScreen.x = e.clientX - rect.left
  mouseScreen.y = e.clientY - rect.top
  mouseScreen.active = true
  mouseWorld.x = mouseScreen.x + camera.x
  mouseWorld.y = mouseScreen.y + camera.y
}

function onMouseDown(e: MouseEvent) {
  if (isInputLocked.value) return
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
  if (isInputLocked.value) return
  e.preventDefault()
  cycleWeapon(e.deltaY > 0 ? 1 : -1)
}

function clampPlayer() {
  player.x = Math.max(0, Math.min(player.x, worldSize.width - playerSize.value))
  player.y = Math.max(0, Math.min(player.y, worldSize.height - playerSize.value))
}

function resolvePlayerBuildingCollisions() {
  const ph = getPlayerHitbox()
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i]
    const overlap = circlesOverlap(ph, getBuildingHitbox(b!))
    if (!overlap.overlapping) continue
    const safeDist = overlap.dist < 0.0001 ? 0.0001 : overlap.dist
    const push = overlap.minDist - safeDist
    const pushX = (overlap.dx / safeDist) * push
    const pushY = (overlap.dy / safeDist) * push
    player.x -= pushX
    player.y -= pushY
  }
  clampPlayer()
}

function resolvePlayerObstacleCollisions() {
  const ph = getPlayerHitbox()
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i]
    if (!o) continue
    const rect = getObstacleRect(o!)
    const overlap = circleRectOverlap(ph, rect)
    if (!overlap.overlapping) continue
    const safeDist = overlap.dist < 0.0001 ? 0.0001 : overlap.dist
    const push = overlap.penetration
    const nx = (ph.x - overlap.nearestX) / safeDist
    const ny = (ph.y - overlap.nearestY) / safeDist
    player.x += nx * (push + 1)
    player.y += ny * (push + 1)
  }
  clampPlayer()
}

function togglePause() {
  if (isGameOver.value) return

  isPaused.value = !isPaused.value
  if (isPaused.value) {
    keys.up = false
    keys.down = false
    keys.left = false
    keys.right = false
  }
}

function persistHighScore() {
  try {
    const saved = Number(localStorage.getItem(HIGH_SCORE_KEY) || '0')
    const current = gameStore.playerStats.score
    if (current > saved) {
      localStorage.setItem(HIGH_SCORE_KEY, String(current))
      storedHighScore.value = current
    } else {
      storedHighScore.value = saved
    }
  } catch {
    // ignore storage failures
  }
}

function exitGame() {
  persistHighScore()
  emit('exit')
}

function openSettingsFromGame() {
  persistHighScore()
  emit('open-settings')
}

function updateCamera() {
  if (!sceneRef.value) return
  const vw = sceneRef.value.clientWidth
  const vh = sceneRef.value.clientHeight
  const targetX = player.x - vw / 2 + playerSize.value / 2
  const targetY = player.y - vh / 2 + playerSize.value / 2
  camera.x += (targetX - camera.x) * 0.1
  camera.y += (targetY - camera.y) * 0.1
}

function handleBossStateChange(active: boolean) {
  bossActive.value = active
}

function resetRunAfterEscape() {
  // Keep player progression/stats after escaping the immortal boss.
  // Only restart the world loop and infection progress.
  gameStore.playerStats.kills = 0

  weaponUnlockMenu.visible = false
  upgradeMenu.visible = false
  upgradeMenu.buildingId = null
  bossActive.value = false

  keys.up = false
  keys.down = false
  keys.left = false
  keys.right = false
  mouse.down = false
  mouseScreen.active = false
  shootAccumulator = 0
  lastDamageTime = 0
  dashRechargeTimer.value = 0
  dashTimeLeft = 0
  isDashing.value = false
  isStunned.value = false
  stunTimeLeft.value = 0
  akimboTimeLeft.value = 0

  screenShake.x = 0
  screenShake.y = 0
  screenShake.timeLeft = 0
  screenShake.duration = 0
  screenShake.intensity = 0

  player.x = 2500
  player.y = 2500
  camera.x = 0
  camera.y = 0

  buildings.length = 0
  obstacles.length = 0
  bullets.length = 0
  explosions.length = 0
  enemies.length = 0

  spawnBuildings(10)
  spawnBuildings(10)
  spawnObstacles(8)
  spawnEnemies(MIN_ACTIVE_ENEMIES)

  showObjective.value = true
  window.setTimeout(() => {
    showObjective.value = false
  }, 5000)
}

function handleBossEscape() {
  resetRunAfterEscape()
}

function onBossShake(payload: { duration: number; intensity: number }) {
  screenShake.timeLeft = payload.duration
  screenShake.duration = payload.duration
  screenShake.intensity = payload.intensity
}

function shootFromEnemy(enemy: Enemy, targetX: number, targetY: number) {
  const dx = targetX - enemy.x
  const dy = targetY - enemy.y
  const angle = Math.atan2(dy, dx)
  const shotSpeed = 580

  bullets.push({
    id: nextBulletId++,
    weaponId: 'shooter',
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * shotSpeed,
    vy: Math.sin(angle) * shotSpeed,
    angleDeg: (angle * 180) / Math.PI + 90,
    size: 6,
    ttl: 3.2,
    maxTtl: 3.2,
    damage: 10,
    color: '#eaf6ff',
    type: 'normal',
    piercing: false,
    bouncesLeft: 0,
    owner: 'enemy',
    ownerId: enemy.id,
    stun: false,
    stunDuration: 0,
  })
}

function shootFromPlayer() {
  if (isPaused.value || isGameOver.value) return

  const weapon = selectedWeapon.value
  const { dx, dy } = aimDelta.value
  const aimLength = Math.hypot(dx, dy)
  if (aimLength < 1) return

  const startX = player.x + playerSize.value / 2
  const startY = player.y + playerSize.value / 2
  const baseAngle = Math.atan2(dy, dx)
  const pelletCount = Math.max(1, weapon.pellets)
  const spreadRad = (weapon.spreadDeg * Math.PI) / 180
  const akimboActive = akimboTimeLeft.value > 0.0001

  for (let i = 0; i < pelletCount; i += 1) {
    const spreadFactor = pelletCount === 1 ? 0 : i / (pelletCount - 1) - 0.5
    const shotAngle = baseAngle + spreadFactor * spreadRad
    const vx = Math.cos(shotAngle) * weapon.projectileSpeed
    const vy = Math.sin(shotAngle) * weapon.projectileSpeed

    // Akimbo: spawn 2 bullets with a small lateral offset so it's obvious.
    const perpX = -Math.sin(shotAngle)
    const perpY = Math.cos(shotAngle)
    const barrelOffset = akimboActive ? AKIMBO_BARREL_OFFSET : 0
    const barrelCount = akimboActive ? 2 : 1

    for (let barrelIndex = 0; barrelIndex < barrelCount; barrelIndex += 1) {
      const sign = barrelCount === 1 ? 0 : barrelIndex === 0 ? 1 : -1
      const bulletStartX = startX + perpX * barrelOffset * sign
      const bulletStartY = startY + perpY * barrelOffset * sign

      if (weapon.orbiting) {
        bullets.push({
          id: nextBulletId++,
          weaponId: selectedWeaponId.value,
          x: bulletStartX,
          y: bulletStartY,
          vx,
          vy,
          angleDeg: undefined,
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
          piercing: Boolean(weapon.piercing),
          bouncesLeft: 2,
        })
      } else if (weapon.explosive) {
        bullets.push({
          id: nextBulletId++,
          weaponId: selectedWeaponId.value,
          x: bulletStartX,
          y: bulletStartY,
          vx,
          vy,
          angleDeg: undefined,
          size: weapon.projectileSize,
          ttl: weapon.projectileLifetime,
          maxTtl: weapon.projectileLifetime,
          damage: weapon.damage,
          color: weapon.projectileColor,
          type: 'explosive',
          explosiveDeceleration: EXPLOSIVE_DECEL,
          flashTimeElapsed: 0,
          piercing: Boolean(weapon.piercing),
          bouncesLeft: 2,
        })
      } else {
        const baseAngleDeg = (shotAngle * 180) / Math.PI
        bullets.push({
          id: nextBulletId++,
          weaponId: selectedWeaponId.value,
          x: bulletStartX,
          y: bulletStartY,
          vx,
          vy,
          // cache angle to avoid atan2 per bullet per frame (perf)
          angleDeg: baseAngleDeg + 90,
          size: weapon.projectileSize,
          ttl: weapon.projectileLifetime,
          maxTtl: weapon.projectileLifetime,
          damage: weapon.damage,
          color: weapon.projectileColor,
          type: 'normal',
          piercing: Boolean(weapon.piercing),
          bouncesLeft: 2,
        })
      }
    }
  }
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
      const orbitTargetX = bullet.orbitTargetX ?? mouseWorld.x
      const orbitTargetY = bullet.orbitTargetY ?? mouseWorld.y

      if (elapsed < ORBIT_APPROACH_TIME) {
        const t = elapsed / ORBIT_APPROACH_TIME
        const eased = t * t * (3 - 2 * t)
        bullet.x +=
          bullet.initialVx! * dt * (1 - eased) + (orbitTargetX - bullet.x) * eased * dt * 4
        bullet.y +=
          bullet.initialVy! * dt * (1 - eased) + (orbitTargetY - bullet.y) * eased * dt * 4
      } else if (elapsed < ORBIT_APPROACH_TIME + ORBIT_HOLD_TIME) {
        const orbitElapsed = elapsed - ORBIT_APPROACH_TIME
        const angle = bullet.orbitPhase! + orbitElapsed * bullet.orbitSpeed!
        bullet.x = orbitTargetX + Math.cos(angle) * bullet.orbitRadius!
        bullet.y = orbitTargetY + Math.sin(angle) * bullet.orbitRadius!
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
      bullet.flashTimeElapsed = (bullet.flashTimeElapsed ?? 0) + dt
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
        const blastRadius =
          bullet.owner === 'enemy'
            ? (bullet.blastRadius ?? EXPLOSION_MAX_RADIUS)
            : EXPLOSION_MAX_RADIUS
        spawnExplosion(bullet.x, bullet.y, blastRadius)
        if (bullet.owner === 'enemy') {
          applyAreaDamageToPlayer(
            bullet.x,
            bullet.y,
            blastRadius,
            bullet.blastDamage ?? bullet.damage,
          )
        }
        bullets.splice(i, 1)
        continue
      }
    } else {
      bullet.x += bullet.vx * dt
      bullet.y += bullet.vy * dt
    }

    let destroyBullet = false

    if (
      bullet.type !== 'orbiting' ||
      bullet.orbitTimeElapsed! >= ORBIT_APPROACH_TIME + ORBIT_HOLD_TIME
    ) {
      const bouncedOnWorld = bounceBulletOnWorldBounds(bullet)
      if (!bouncedOnWorld) {
        const radius = Math.max(2, bullet.size * 0.5)
        const touchingWorldBounds =
          bullet.x - radius <= 0 ||
          bullet.y - radius <= 0 ||
          bullet.x + radius >= worldSize.width ||
          bullet.y + radius >= worldSize.height
        if (touchingWorldBounds) {
          destroyBullet = true
        }
      }
    }

    for (let oi = 0; oi < obstacles.length; oi++) {
      const o = obstacles[oi]
      if (!o) continue
      if (
        bullet.type === 'orbiting' &&
        bullet.orbitTimeElapsed! < ORBIT_APPROACH_TIME + ORBIT_HOLD_TIME
      ) {
        continue
      }

      const bouncedOnObstacle = bounceBulletOnObstacle(bullet, getObstacleRect(o))
      if (bouncedOnObstacle) {
        break
      }

      const overlapO = circleRectOverlap(getBulletHitbox(bullet), getObstacleRect(o))
      if (overlapO.overlapping) {
        destroyBullet = true
        break
      }
    }

    if (
      bullet.type === 'normal' &&
      (bullet.weaponId === 'gusano' || bullet.weaponId === 'Disparo_Memoria')
    ) {
      bullet.animTimeElapsed = (bullet.animTimeElapsed ?? 0) + dt
    }

    if (bullet.type === 'explosive' && bullet.owner === 'enemy' && bullet.ttl <= 0) {
      const blastRadius = bullet.blastRadius ?? EXPLOSION_MAX_RADIUS
      spawnExplosion(bullet.x, bullet.y, blastRadius)
      applyAreaDamageToPlayer(bullet.x, bullet.y, blastRadius, bullet.blastDamage ?? bullet.damage)
      bullets.splice(i, 1)
      continue
    }

    const outOfWorld =
      bullet.x < -margin ||
      bullet.y < -margin ||
      bullet.x > worldSize.width + margin ||
      bullet.y > worldSize.height + margin

    const bulletHitbox = getBulletHitbox(bullet)
    // bullets can hit the player (enemy-fired)
    if (bullet.owner === 'enemy') {
      const ph = getPlayerHitbox()
      const pOverlap = circlesOverlap(bulletHitbox, ph)
      if (pOverlap.overlapping) {
        if (bullet.blastRadius) {
          const blastRadius = bullet.blastRadius ?? EXPLOSION_MAX_RADIUS
          spawnExplosion(bullet.x, bullet.y, blastRadius)
          applyAreaDamageToPlayer(
            bullet.x,
            bullet.y,
            blastRadius,
            bullet.blastDamage ?? bullet.damage,
          )
        } else if (bullet.damage && bullet.damage > 0) {
          gameStore.takeDamage(bullet.damage)
          playerDamageFlash.value = true
          playerDamageFlashTimer.value = 0.2
        }
        if (bullet.stun) {
          isStunned.value = true
          stunTimeLeft.value = bullet.stunDuration ?? DEFAULT_STUN_DURATION
        }
        bullets.splice(i, 1)
        continue
      }
    }
    let hitEnemy = false
    // Balas enemigas solo deben dañar al jugador, no a otros enemigos
    if (bullet.owner !== 'enemy') {
      for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
        const enemy = enemies[enemyIndex]
        if (!enemy || enemy.hp <= 0) continue
        const overlap = circlesOverlap(bulletHitbox, getEnemyHitbox(enemy))
        if (!overlap.overlapping) continue

        if (enemy.type === 'windows-defender') {
          destroyBullet = true
          hitEnemy = true
          break
        }

        if (bullet.piercing) {
          // Only damage each enemy once — skip if already hit this enemy
          if (!bullet.hitEnemyIds) bullet.hitEnemyIds = new Set()
          if (bullet.hitEnemyIds.has(enemy.id)) continue

          enemy.hp -= bullet.damage
          bullet.hitEnemyIds.add(enemy.id)
          hitEnemy = true
          spawnDamageNumber(enemy.x, enemy.y, bullet.damage)

          // Once bullet leaves the enemy's hitbox, clear it so it can hit again on re-entry
          // (handled naturally since we only add on overlap)
        } else {
          enemy.hp -= bullet.damage
          hitEnemy = true
          spawnDamageNumber(enemy.x, enemy.y, bullet.damage)
          if (bullet.type === 'explosive') {
            spawnExplosion(bullet.x, bullet.y, EXPLOSION_MAX_RADIUS)
          }
          break
        }
      }
    }

    if (bullet.piercing && bullet.hitEnemyIds && bullet.hitEnemyIds.size > 0) {
      for (const id of bullet.hitEnemyIds) {
        const stillOverlapping = enemies.some(
          (e) => e.id === id && circlesOverlap(bulletHitbox, getEnemyHitbox(e)).overlapping,
        )
        if (!stillOverlapping) bullet.hitEnemyIds.delete(id)
      }
    }

    // bullets collide with buildings -> bounce or explode
    for (let bi = 0; bi < buildings.length; bi++) {
      const b = buildings[bi]
      const overlapB = circlesOverlap(bulletHitbox, getBuildingHitbox(b!))
      if (!overlapB.overlapping) continue

      // skip orbiting bullets while held
      if (bullet.type === 'orbiting') continue

      const safeDist = overlapB.dist < 0.0001 ? 0.0001 : overlapB.dist

      if (consumeBulletBounce(bullet)) {
        // normal from building -> bullet
        const nx = (bullet.x - b!.x) / safeDist
        const ny = (bullet.y - b!.y) / safeDist

        // reflect velocity: v' = v - 2*(v·n)*n
        const dot = bullet.vx * nx + bullet.vy * ny
        bullet.vx = bullet.vx - 2 * dot * nx
        bullet.vy = bullet.vy - 2 * dot * ny

        // push bullet out of penetration a bit
        const penetration = overlapB.minDist - safeDist
        bullet.x += nx * (penetration + 0.5)
        bullet.y += ny * (penetration + 0.5)

        // dampen speed and consume a bounce
        bullet.vx *= 0.75
        bullet.vy *= 0.75
        bullet.bouncesLeft!--

        // small ttl penalty to avoid infinite bouncing
        bullet.ttl -= 0.04

        // continue scanning (but break to avoid multi-resolve in same frame)
        break
      } else {
        // no bounces left: behave like hitting a solid
        hitEnemy = true
        if (bullet.type === 'explosive' && bullet.owner === 'enemy') destroyBullet = true
        if (bullet.type === 'explosive' && bullet.owner !== 'enemy') {
          spawnExplosion(bullet.x, bullet.y, EXPLOSION_MAX_RADIUS)
        }
        break
      }
    }

    if (
      bullet.type === 'explosive' &&
      bullet.owner === 'enemy' &&
      (destroyBullet || outOfWorld || (hitEnemy && !bullet.piercing))
    ) {
      const blastRadius = bullet.blastRadius ?? EXPLOSION_MAX_RADIUS
      spawnExplosion(bullet.x, bullet.y, blastRadius)
      applyAreaDamageToPlayer(bullet.x, bullet.y, blastRadius, bullet.blastDamage ?? bullet.damage)
    }

    if (bullet.ttl <= 0 || outOfWorld || destroyBullet || (hitEnemy && !bullet.piercing)) {
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

function updateDamageNumbers(dt: number) {
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const dn = damageNumbers[i]
    if (!dn) continue
    dn.ttl -= dt
    dn.y += dn.velocityY * dt
    dn.velocityY += 40 * dt
    if (dn.ttl <= 0) {
      damageNumbers.splice(i, 1)
    }
  }
}

function updateAutoShoot(dt: number) {
  if (!mouse.down || !mouseScreen.active || isInputLocked.value) return
  const shotsPerSecond = Math.max(0.2, selectedWeapon.value.fireRate)
  const shotInterval = 1 / shotsPerSecond
  shootAccumulator += dt
  while (shootAccumulator >= shotInterval) {
    shootAccumulator -= shotInterval
    shootFromPlayer()
  }
}

function preventDefaultMenu(e: Event) {
  e.preventDefault()
}

function tryCapture() {
  if (isInputLocked.value) return

  const px = player.x + playerSize.value / 2
  const py = player.y + playerSize.value / 2
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

  upgradeMenu.visible = true
  upgradeMenu.buildingId = nearest.id
}

function selectUpgrade(type: 'dash' | 'akimbo' | 'health_up') {
  const b = buildings.find((b) => b.id === upgradeMenu.buildingId)
  if (b) b.captured = true
  gameStore.applyUpgrade(type)
  if (type === 'akimbo') akimboTimeLeft.value = AKIMBO_DURATION
  upgradeMenu.visible = false
  upgradeMenu.buildingId = null
}

function updateDash(dt: number) {
  if (isDashing.value) {
    dashTimeLeft -= dt
    player.x += dashDirection.x * dashForce * dt
    player.y += dashDirection.y * dashForce * dt
    clampPlayer()
    resolvePlayerBuildingCollisions()
    resolvePlayerObstacleCollisions()

    if (dashTimeLeft <= 0) {
      isDashing.value = false
    }
  }
  const stats = gameStore.playerStats
  if (stats.currentdashes < stats.maxdashes) {
    dashRechargeTimer.value += dt
    if (dashRechargeTimer.value >= dashCooldown) {
      dashRechargeTimer.value = 0
      stats.currentdashes = Math.min(stats.currentdashes + 1, stats.maxdashes)
    }
  } else {
    dashRechargeTimer.value = 0
  }
}

function loop(ts: number) {
  if (!lastTime) lastTime = ts
  const dt = (ts - lastTime) / 1000
  lastTime = ts

  if (isPaused.value || isGameOver.value || isMenuOpen.value) {
    rafId = requestAnimationFrame(loop)
    return
  }

  gameStore.updateBuffs(dt)
  if (akimboTimeLeft.value > 0) akimboTimeLeft.value = Math.max(0, akimboTimeLeft.value - dt)
  updateDash(dt)

  // Update stun timer
  if (isStunned.value) {
    stunTimeLeft.value = Math.max(0, stunTimeLeft.value - dt)
    if (stunTimeLeft.value <= 0) {
      isStunned.value = false
    }
  }

  // Actualizar cooldown de daño
  if (lastDamageTime > 0) {
    lastDamageTime -= dt
  }

  if (screenShake.timeLeft > 0) {
    screenShake.timeLeft = Math.max(0, screenShake.timeLeft - dt)
    const shakeScale = screenShake.timeLeft / Math.max(0.001, screenShake.duration || 1)
    const currentIntensity = screenShake.intensity * shakeScale
    screenShake.x = (Math.random() * 2 - 1) * currentIntensity
    screenShake.y = (Math.random() * 2 - 1) * currentIntensity
  } else {
    screenShake.x = 0
    screenShake.y = 0
  }

  const speed = baseSpeed * gameStore.playerStats.speedMultiplier
  let vx = 0
  let vy = 0
  if (keys.up) vy -= 1
  if (keys.down) vy += 1
  if (keys.left) vx -= 1
  if (keys.right) vx += 1

  if (isStunned.value) {
    vx = 0
    vy = 0
    mouse.down = false
    shootAccumulator = 0
  }

  const moving = vx !== 0 || vy !== 0
  isMoving = moving

  if (moving) {
    const len = Math.hypot(vx, vy) || 1
    vx = (vx / len) * speed
    vy = (vy / len) * speed
    player.x += vx * dt
    player.y += vy * dt
    clampPlayer()
    resolvePlayerBuildingCollisions()
    resolvePlayerObstacleCollisions()

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
  updateDamageNumbers(dt)
  updateEnemies(dt)
  updateCamera()

  // Update player damage flash
  if (playerDamageFlashTimer.value > 0) {
    playerDamageFlashTimer.value -= dt
    if (playerDamageFlashTimer.value <= 0) {
      playerDamageFlash.value = false
    }
  }

  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  gameStore.resetPlayerStats()
  selectedWeaponId.value = DEFAULT_WEAPON_ID
  weaponUnlockMenu.visible = false
  bossActive.value = false
  // Safety: prevent starting in "game over" state (which stops enemy spawning).
  if (gameStore.playerStats.health <= 0) gameStore.playerStats.health = 1
  try {
    storedHighScore.value = Number(localStorage.getItem(HIGH_SCORE_KEY) || '0')
  } catch {
    storedHighScore.value = 0
  }
  window.removeEventListener('contextmenu', preventDefaultMenu)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('wheel', onWheel, { passive: false })
  spawnBuildings(10)
  spawnBuildings(10)
  spawnObstacles(8)
  spawnEnemies(MIN_ACTIVE_ENEMIES)
  enemySpawnInterval = window.setInterval(spawnEnemyTick, ENEMY_SPAWN_INTERVAL_MS)

  showObjective.value = true
  setTimeout(() => {
    showObjective.value = false
  }, 5000)
  window.addEventListener('contextmenu', preventDefaultMenu)

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
  -webkit-user-select: none;
  /* Para Safari/Chrome antiguo */
  -moz-user-select: none;
  /* Para Firefox */
  -ms-user-select: none;
}

.game-scene {
  width: 100%;
  height: 100vh;
  position: relative;
  display: block;
  user-select: none;
}

.world {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 0;
}

.hud-actions {
  position: absolute;
  right: 12px;
  z-index: 20;
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
  cursor: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 0 18px rgba(189, 77, 255, 0.18);
}

.menu-toggle-button:hover {
  border-color: rgba(255, 155, 235, 0.85);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 0 18px rgba(189, 77, 255, 0.28);
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

.pause-title {
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.pause-text {
  margin: 0 0 14px;
  color: rgba(255, 255, 255, 0.82);
}

.pause-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pause-action-button {
  min-width: 240px;
  padding: 12px 16px;
  border: 1px solid rgba(207, 84, 255, 0.55);
  background: linear-gradient(90deg, rgba(122, 56, 172, 0.96), rgba(56, 18, 108, 0.96));
  color: #fff;
  font: inherit;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(206, 89, 255, 0.18);
}

.pause-action-button:hover {
  border-color: rgba(255, 165, 245, 0.8);
  box-shadow: 0 0 20px rgba(206, 89, 255, 0.28);
}

.pause-action-button-secondary {
  background: rgba(32, 12, 56, 0.94);
}

.lose-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 35%, rgba(35, 255, 150, 0.14), rgba(0, 0, 0, 0.72) 62%),
    repeating-linear-gradient(
      to bottom,
      rgba(35, 255, 150, 0.03) 0,
      rgba(35, 255, 150, 0.03) 1px,
      transparent 1px,
      transparent 4px
    );
  backdrop-filter: blur(3px);
}

.lose-card {
  min-width: 280px;
  max-width: calc(100vw - 32px);
  padding: 20px;
  border: 1px solid rgba(60, 255, 170, 0.62);
  background:
    linear-gradient(180deg, rgba(8, 34, 22, 0.94), rgba(4, 17, 12, 0.96)), rgba(5, 14, 10, 0.92);
  box-shadow:
    0 0 0 1px rgba(140, 255, 206, 0.12) inset,
    0 0 26px rgba(48, 255, 162, 0.28);
  text-align: center;
  clip-path: polygon(
    0 10px,
    10px 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
}

.lose-title,
.lose-score,
.lose-kills,
.lose-best,
.lose-record {
  margin: 0;
}

.lose-title {
  color: #caffea;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  margin-bottom: 8px;
  text-shadow: 0 0 12px rgba(86, 255, 177, 0.5);
}

.lose-score {
  color: rgba(211, 255, 233, 0.95);
  margin-bottom: 4px;
}

.lose-kills,
.lose-best {
  color: rgba(180, 255, 220, 0.9);
  font-size: 0.92rem;
  margin-bottom: 4px;
}

.lose-record {
  display: inline-block;
  margin-top: 6px;
  margin-bottom: 14px;
  padding: 4px 8px;
  border: 1px solid rgba(108, 255, 195, 0.6);
  background: rgba(14, 64, 42, 0.72);
  color: #adffd9;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  text-transform: uppercase;
}

.lose-best {
  margin-bottom: 14px;
}

.lose-button {
  border: 1px solid rgba(108, 255, 195, 0.72);
  background: rgba(10, 52, 34, 0.95);
  color: #d7ffed;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
}

.lose-button:hover {
  background: rgba(12, 72, 47, 0.95);
  box-shadow: 0 0 14px rgba(80, 255, 180, 0.28);
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

.panel-mark-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  margin-right: 6px;
  image-rendering: pixelated;
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

.hitbox {
  position: absolute;
  left: 0;
  top: 0;
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

.damage-number {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 25;
  font-weight: 800;
  font-size: 1.2rem;
  color: #ff7de9;
  text-shadow:
    0 0 8px rgba(255, 125, 233, 0.9),
    0 0 16px rgba(255, 125, 233, 0.6);
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

.cooldown-bars {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 12;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cooldown-bar {
  width: 54px;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}

.cooldown-bar-fill {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  will-change: transform;
}

.cooldown-bar-dash .cooldown-bar-fill {
  background: linear-gradient(90deg, rgba(120, 220, 255, 0.9), rgba(80, 140, 255, 0.9));
}

.cooldown-bar-akimbo .cooldown-bar-fill {
  background: linear-gradient(90deg, rgba(255, 120, 245, 0.9), rgba(255, 80, 150, 0.9));
}

.obstacle {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  border-radius: 6px;
  image-rendering: pixelated;
}

.upgrade-overlay {
  position: absolute;
  inset: 0;
  z-index: 25;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  cursor: none;
}

.upgrade-card {
  width: 170px;
  padding: 12px 14px 10px;
  text-align: left;
  border: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  animation: slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.upgrade-card:hover {
  border-color: rgba(255, 121, 255, 0.75);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 0 28px rgba(202, 82, 255, 0.45),
    0 0 48px rgba(108, 51, 255, 0.2);
}

.upgrade-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.upgrade-btn {
  display: grid;
  grid-template-columns: 2rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 10px;
  align-items: center;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(194, 120, 255, 0.35);
  border-radius: 10px;
  color: #f2e9ff;
  text-align: left;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.upgrade-btn:hover {
  background: rgba(194, 120, 255, 0.12);
  border-color: rgba(194, 120, 255, 0.7);
}

.upgrade-icon {
  grid-row: 1 / 3;
  font-size: 1.5rem;
  display: grid;
  place-items: center;
}

.upgrade-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.upgrade-label {
  font-weight: 700;
  font-size: 0.92rem;
  color: #fff;
}

.upgrade-desc {
  font-size: 0.74rem;
  color: rgba(210, 190, 255, 0.7);
}

.top-score {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  pointer-events: none;
}

.score-card {
  background: rgba(0, 0, 0, 0.45);
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 96px;
  backdrop-filter: blur(4px);
}

.score-label {
  font-size: 0.7rem;
  color: rgba(200, 200, 200, 0.9);
  letter-spacing: 1px;
}

.score-value {
  font-weight: 800;
  font-size: 1.05rem;
  color: #fff;
}

.boss-hud {
  position: absolute;
  top: 58px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 59;
  width: min(560px, calc(100vw - 32px));
  pointer-events: none;
}

.boss-card {
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(26, 8, 18, 0.92);
  border: 1px solid rgba(255, 119, 154, 0.45);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 0 24px rgba(255, 88, 126, 0.24);
}

.boss-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.boss-title {
  color: #ffd6e1;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.boss-life {
  color: #ffc1d0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}

.boss-track {
  position: relative;
  height: 11px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(45, 10, 24, 0.96);
  border: 1px solid rgba(255, 149, 176, 0.38);
}

.boss-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff89ac, #ff3369);
  box-shadow: 0 0 16px rgba(255, 72, 122, 0.66);
  transform-origin: left center;
  transition: width 0.18s ease;
}

.stun-ring {
  position: absolute;
  z-index: 50;
  border-radius: 999px;
  pointer-events: none;
  box-shadow:
    0 0 0 3px rgba(120, 255, 120, 0.12),
    0 0 24px rgba(120, 255, 120, 0.18);
  border: 1px solid rgba(120, 255, 120, 0.28);
  animation: stunPulse 0.9s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes stunPulse {
  0% {
    transform: scale(0.9);
    opacity: 0.9;
  }

  50% {
    transform: scale(1.06);
    opacity: 0.6;
  }

  100% {
    transform: scale(0.9);
    opacity: 0.9;
  }
}

@keyframes bossPulse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(0, -2px, 0) scale(1.04);
  }
}

.upgrade-menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 90vw;
}

.upgrade-cards-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.upgrade-overlay .objective-panel {
  animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
