<template>
  <template v-if="bossEnemy">
    <div class="boss-hud">
      <div class="boss-card">
        <div class="boss-topline">
          <span class="boss-title">{{ bossLabel }}</span>
          <span class="boss-life">{{ bossHealthText }}</span>
        </div>
        <div class="boss-track">
          <div class="boss-fill" :style="bossHealthBarStyle"></div>
        </div>
      </div>
    </div>

    <div class="boss-enemy" :style="bossStyle"></div>
    <div v-if="escapeIndicatorStyle" class="escape-indicator" :style="escapeIndicatorStyle">
      <span class="escape-indicator-text">{{ escapeIndicatorText }}</span>
    </div>
    <div v-if="escapePointStyle" class="escape-point" :style="escapePointStyle">
      <span class="escape-point-core"></span>
      <span class="escape-point-label">SALIDA</span>
    </div>
  </template>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, reactive, type CSSProperties, type PropType } from 'vue'
import { useGameStore } from '../stores/game'
import mcaffeImg from '../assets/bossesimage/mcaffe.png'
import nortonImg from '../assets/bossesimage/Norton.png'
import windowsDefenderImg from '../assets/bossesimage/MicrosoftDefender.png'

let mcaffeTornadoAngle = 0

type Vector2 = { x: number; y: number }

interface BossEnemy {
  id: number
  x: number
  y: number
  size: number
  speed: number
  hp: number
  maxHp: number
  color: string
  type: 'mcaffe' | 'norton' | 'windows-defender' | 'grunt' | 'runner' | 'tank' | 'shooter'
  tornadoTimer?: number
  tornadoCooldown?: number
  explosiveTimer?: number
  explosiveCooldown?: number
  introTimeLeft?: number
  introDuration?: number
  introStartX?: number
  introStartY?: number
  introTargetX?: number
  introTargetY?: number
  dashTimer?: number
  dashCooldown?: number
  dashTimeLeft?: number
  dashVx?: number
  dashVy?: number
}

interface BossBullet {
  id: number
  weaponId: string
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
  flashTimeElapsed?: number
  piercing?: boolean
  bouncesLeft?: number
  owner?: 'player' | 'enemy'
  ownerId?: number
  stun?: boolean
  stunDuration?: number
  blastRadius?: number
  blastDamage?: number
}

export default defineComponent({
  name: 'BossesPanel',
  props: {
    enemies: {
      type: Array as PropType<BossEnemy[]>,
      required: true,
    },
    bullets: {
      type: Array as PropType<BossBullet[]>,
      required: true,
    },
    player: {
      type: Object as PropType<Vector2>,
      required: true,
    },
    playerSize: {
      type: Number,
      required: true,
    },
    camera: {
      type: Object as PropType<Vector2>,
      required: true,
    },
    worldSize: {
      type: Object as PropType<{ width: number; height: number }>,
      required: true,
    },
    isPaused: {
      type: Boolean,
      required: true,
    },
    isGameOver: {
      type: Boolean,
      required: true,
    },
    isMenuOpen: {
      type: Boolean,
      required: true,
    },
    coopGuest: {
      type: Boolean,
      default: false,
    },
    remoteTargets: {
      type: Array as PropType<{ x: number; y: number }[]>,
      default: () => [],
    },
  },
  emits: {
    'state-change': (active: boolean) => typeof active === 'boolean',
    shake: (payload: { duration: number; intensity: number }) =>
      typeof payload.duration === 'number' && typeof payload.intensity === 'number',
    escape: () => true,
    'escape-point': (p: { x: number; y: number; active: boolean; radius: number }) => typeof p === 'object' && typeof p.x === 'number' && typeof p.y === 'number',
    'damage-remote': (p: { amount: number }) => typeof p.amount === 'number',
  },
  setup(props, { emit }) {
    const gameStore = useGameStore()

    const MCAFFE_TRIGGER_KILLS = 100
    const NORTON_TRIGGER_KILLS = 200
    const WINDOWS_DEFENDER_TRIGGER_KILLS = 300
    const BOSS_MCAFFE_SIZE = 300
    const BOSS_MCAFFE_HP = 520
    const BOSS_MCAFFE_SPEED = 112
    const BOSS_INTRO_DURATION = 1.9
    const BOSS_TORNADO_COOLDOWN = 1.5
    const BOSS_EXPLOSIVE_COOLDOWN = 1.0
    const BOSS_EXPLOSIVE_SPEED = 250
    const BOSS_EXPLOSIVE_RADIUS = 150
    const BOSS_EXPLOSIVE_DAMAGE = 28
    const BOSS_EXPERIENCE = 250
    const NORTON_SIZE = 170
    const NORTON_HP = 420
    const NORTON_SPEED = 132
    const NORTON_INTRO_DURATION = 1.5
    const NORTON_SHOTGUN_COOLDOWN = 1.15
    const NORTON_SHOTGUN_PELLETS = 7
    const NORTON_SHOTGUN_SPREAD_DEG = 55
    const NORTON_SHOTGUN_SPEED = 820
    const NORTON_SHOTGUN_DAMAGE = 9
    const NORTON_DASH_COOLDOWN = 2.35
    const NORTON_DASH_DURATION = 0.22
    const NORTON_DASH_SPEED = 1700
    const NORTON_EXPERIENCE = 340
    const WINDOWS_DEFENDER_SIZE = 260
    const WINDOWS_DEFENDER_SPEED = 200
    const WINDOWS_DEFENDER_INTRO_DURATION = 1.7
    const WINDOWS_DEFENDER_ORBIT_BULLETS = 8
    const WINDOWS_DEFENDER_ORBIT_RADIUS = 128
    const WINDOWS_DEFENDER_ORBIT_SPEED = Math.PI * 2.1
    const WINDOWS_DEFENDER_ORBIT_COOLDOWN = 1.35
    const WINDOWS_DEFENDER_ORBIT_LIFETIME = 6.2
    const WINDOWS_DEFENDER_ORBIT_DAMAGE = 12
    // Un poco más grande para que "escapar" sea consistente y no se sienta bug.
    const WINDOWS_DEFENDER_ESCAPE_RADIUS = 72
    const WINDOWS_DEFENDER_ESCAPE_INDICATOR_DURATION = 2.8
    const BOSS_SHAKE_DURATION = 2.2
    const BOSS_SHAKE_INTENSITY = 26
    const BOSS_CONTACT_DAMAGE = 28
    const BOSS_CONTACT_COOLDOWN = 0.55

    let nextBossBulletId = 1_000_000
    let nextBossEnemyId = 1_000_000
    let mcaffeSpawned = false
    let nortonSpawned = false
    let windowsDefenderSpawned = false
    let rafId: number | null = null
    let lastTime = 0
    let contactDamageCooldown = 0
    const escapePoint = reactive({ x: 0, y: 0, active: false })
    const escapeIndicator = reactive({
      active: false,
      timeLeft: 0,
      duration: WINDOWS_DEFENDER_ESCAPE_INDICATOR_DURATION,
    })

    const activeBoss = computed(
      () =>
        props.enemies.find(
          (enemy) =>
            enemy.type === 'mcaffe' || enemy.type === 'norton' || enemy.type === 'windows-defender',
        ) ?? null,
    )
    const bossEnemy = computed(() => activeBoss.value)

    const bossLabel = computed(() => {
      if (!activeBoss.value) return 'BOSS'
      if (activeBoss.value.type === 'windows-defender') return 'WINDOWS DEFENDER'
      return activeBoss.value.type === 'norton' ? 'NORTON' : 'MCAFFE'
    })

    const bossHealthText = computed(() => {
      if (!activeBoss.value) return '0 / 0'
      if (activeBoss.value.type === 'windows-defender') return 'INMORTAL'
      return `${activeBoss.value.hp} / ${activeBoss.value.maxHp}`
    })

    const bossHealthBarStyle = computed(() => {
      if (!activeBoss.value) return { width: '0%' }
      if (activeBoss.value.type === 'windows-defender') {
        return {
          width: '100%',
          background: 'linear-gradient(90deg, #8bf5c3, #55d1ff, #b7ff84)',
        }
      }
      const pct = Math.max(0, (activeBoss.value.hp / activeBoss.value.maxHp) * 100)
      return { width: `${Math.min(pct, 100)}%` }
    })

    const escapePointStyle = computed(() => {
      if (!escapePoint.active) return null
      const screenX = Math.round(escapePoint.x - props.camera.x)
      const screenY = Math.round(escapePoint.y - props.camera.y)
      return {
        width: '140px',
        height: '140px',
        transform: `translate(${screenX - 70}px, ${screenY - 70}px)`,
      }
    })

    const escapeIndicatorText = computed(() => {
      if (!escapeIndicator.active) return ''
      const progress = 1 - escapeIndicator.timeLeft / Math.max(0.001, escapeIndicator.duration)
      return progress < 0.72 ? 'ESCAPA' : '➤'
    })

    const escapeIndicatorStyle = computed(() => {
      if (
        !escapeIndicator.active ||
        !escapePoint.active ||
        activeBoss.value?.type !== 'windows-defender'
      ) {
        return null
      }

      const progress = 1 - escapeIndicator.timeLeft / Math.max(0.001, escapeIndicator.duration)
      const clampedProgress = Math.min(1, Math.max(0, progress))
      const playerCenterX = props.player.x + props.playerSize / 2
      const playerCenterY = props.player.y + props.playerSize / 2
      const playerScreenX = Math.round(playerCenterX - props.camera.x)
      const playerScreenY = Math.round(playerCenterY - props.camera.y)
      const arrowAngle =
        (Math.atan2(escapePoint.y - playerCenterY, escapePoint.x - playerCenterX) * 180) / Math.PI
      const scale = 2.9 - clampedProgress * 2.2
      const opacity = 1 - clampedProgress * 0.12
      const arrowMode = clampedProgress >= 0.72
      const spin = arrowMode ? arrowAngle : 0

      return {
        left: `${playerScreenX}px`,
        top: `${playerScreenY - 132}px`,
        transform: `translate(-50%, -50%) scale(${Math.max(0.7, scale)}) rotate(${spin}deg)`,
        opacity: `${Math.max(0.68, opacity)}`,
      }
    })

const bossStyle = computed(() => {
  const boss = activeBoss.value
  if (!boss) return {}

  const screenX = Math.round(boss.x - props.camera.x - boss.size / 2)
  const screenY = Math.round(boss.y - props.camera.y - boss.size / 2)
  const introActive = (boss.introTimeLeft ?? 0) > 0

  const imgMap = {
    mcaffe: mcaffeImg,
    norton: nortonImg,
    'windows-defender': windowsDefenderImg,
  } as Record<string, string>

  const img = imgMap[boss.type]


  return {
    width: `${boss.size}px`,
    height: `${boss.size}px`,
    transform: `translate(${screenX}px, ${screenY}px)`,
    backgroundImage: `url(${img})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    imageRendering: 'pixelated',
    borderRadius: '0px',
    border: 'none',
    zIndex: 12,
    opacity: introActive ? '0.98' : '1',
  }as CSSProperties
})

    const enemies = props.enemies as BossEnemy[]
    const bullets = props.bullets as BossBullet[]

    function requestShake(duration = BOSS_SHAKE_DURATION, intensity = BOSS_SHAKE_INTENSITY) {
      emit('shake', { duration, intensity })
    }

    function setBossPresence(active: boolean) {
      emit('state-change', active)
    }

    function setEscapePointForPlayer() {
      const playerCenterX = props.player.x + props.playerSize / 2
      const playerCenterY = props.player.y + props.playerSize / 2
      const margin = 170
      const candidates = [
        { x: margin, y: margin },
        { x: props.worldSize.width - margin, y: margin },
        { x: margin, y: props.worldSize.height - margin },
        { x: props.worldSize.width - margin, y: props.worldSize.height - margin },
      ]

      let chosen = candidates[0]!
      let bestDist = -1
      for (const candidate of candidates) {
        const dist = Math.hypot(candidate.x - playerCenterX, candidate.y - playerCenterY)
        if (dist > bestDist) {
          bestDist = dist
          chosen = candidate
        }
      }

      emit('escape-point', { x: chosen.x, y: chosen.y, active: true, radius: WINDOWS_DEFENDER_ESCAPE_RADIUS })
      
      escapePoint.x = chosen.x
      escapePoint.y = chosen.y
      escapePoint.active = true
      escapeIndicator.active = true
      escapeIndicator.duration = WINDOWS_DEFENDER_ESCAPE_INDICATOR_DURATION
      escapeIndicator.timeLeft = WINDOWS_DEFENDER_ESCAPE_INDICATOR_DURATION
    }

    function clearEscapePoint() {
      escapePoint.active = false
      escapeIndicator.active = false
      escapeIndicator.timeLeft = 0
      emit('escape-point', { x: 0, y: 0, active: false, radius: 0 })
    }

    function spawnMcAffeBoss() {
      const centerX = props.player.x + props.playerSize / 2
      const bossX = Math.max(
        BOSS_MCAFFE_SIZE / 2,
        Math.min(centerX, props.worldSize.width - BOSS_MCAFFE_SIZE / 2),
      )
      const targetY = Math.max(0, props.player.y - BOSS_MCAFFE_SIZE - 160)
      const startY = Math.max(-BOSS_MCAFFE_SIZE * 1.5, targetY - 520)

      enemies.push({
        id: nextBossEnemyId++,
        x: bossX,
        y: startY,
        size: BOSS_MCAFFE_SIZE,
        speed: BOSS_MCAFFE_SPEED,
        hp: BOSS_MCAFFE_HP,
        maxHp: BOSS_MCAFFE_HP,
        color: '#ff5d7d',
        type: 'mcaffe',
        tornadoTimer: 1.2,
        tornadoCooldown: BOSS_TORNADO_COOLDOWN,
        explosiveTimer: 2.1,
        explosiveCooldown: BOSS_EXPLOSIVE_COOLDOWN,
        introTimeLeft: BOSS_INTRO_DURATION,
        introDuration: BOSS_INTRO_DURATION,
        introStartX: bossX,
        introStartY: startY,
        introTargetX: bossX,
        introTargetY: targetY,
      })

      mcaffeSpawned = true
      requestShake()
      setBossPresence(true)
    }

    function spawnNortonBoss() {
      const centerX = props.player.x + props.playerSize / 2
      const bossX = Math.max(
        NORTON_SIZE / 2,
        Math.min(centerX, props.worldSize.width - NORTON_SIZE / 2),
      )
      const targetY = Math.max(0, props.player.y - NORTON_SIZE - 180)
      const startY = Math.max(-NORTON_SIZE * 1.8, targetY - 560)

      enemies.push({
        id: nextBossEnemyId++,
        x: bossX,
        y: startY,
        size: NORTON_SIZE,
        speed: NORTON_SPEED,
        hp: NORTON_HP,
        maxHp: NORTON_HP,
        color: '#6ed8ff',
        type: 'norton',
        tornadoTimer: 1.0,
        tornadoCooldown: NORTON_SHOTGUN_COOLDOWN,
        introTimeLeft: NORTON_INTRO_DURATION,
        introDuration: NORTON_INTRO_DURATION,
        introStartX: bossX,
        introStartY: startY,
        introTargetX: bossX,
        introTargetY: targetY,
        dashTimer: 2,
        dashCooldown: NORTON_DASH_COOLDOWN,
        dashTimeLeft: 0,
      })

      nortonSpawned = true
      requestShake(1.7, 24)
      setBossPresence(true)
    }

    function spawnWindowsDefenderBoss() {
      const centerX = props.player.x + props.playerSize / 2
      const bossX = Math.max(
        WINDOWS_DEFENDER_SIZE / 2,
        Math.min(centerX, props.worldSize.width - WINDOWS_DEFENDER_SIZE / 2),
      )
      const targetY = Math.max(0, props.player.y - WINDOWS_DEFENDER_SIZE - 180)
      const startY = Math.max(-WINDOWS_DEFENDER_SIZE * 1.7, targetY - 560)

      enemies.push({
        id: nextBossEnemyId++,
        x: bossX,
        y: startY,
        size: WINDOWS_DEFENDER_SIZE,
        speed: WINDOWS_DEFENDER_SPEED,
        hp: Number.POSITIVE_INFINITY,
        maxHp: Number.POSITIVE_INFINITY,
        color: '#68e7b6',
        type: 'windows-defender',
        tornadoTimer: 1.0,
        tornadoCooldown: WINDOWS_DEFENDER_ORBIT_COOLDOWN,
        introTimeLeft: WINDOWS_DEFENDER_INTRO_DURATION,
        introDuration: WINDOWS_DEFENDER_INTRO_DURATION,
        introStartX: bossX,
        introStartY: startY,
        introTargetX: bossX,
        introTargetY: targetY,
      })

      windowsDefenderSpawned = true
      setEscapePointForPlayer()
      requestShake(2.1, 28)
      setBossPresence(true)
    }

function spawnBossTornado(boss: BossEnemy) {
  const SPIRAL_ARMS = 20      
  const SPIRAL_SPREAD = (Math.PI * 2) / SPIRAL_ARMS  
  const BULLET_SPEED = 480

  for (let i = 0; i < SPIRAL_ARMS; i++) {
    const angle = mcaffeTornadoAngle + SPIRAL_SPREAD * i
    bullets.push({
      id: nextBossBulletId++,
      weaponId: 'mcaffe',
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * BULLET_SPEED,
      vy: Math.sin(angle) * BULLET_SPEED,
      angleDeg: (angle * 180) / Math.PI + 90,
      size: 40,
      ttl: 3.5,
      maxTtl: 3.5,
      damage: 16,
      color: '#ffbfd0',
      type: 'normal',
      piercing: false,
      bouncesLeft: 0,
      owner: 'enemy',
      ownerId: boss.id,
      stun: false,
      stunDuration: 0,
    })
  }

  // Rotar el ángulo base para la próxima salva — esto crea la espiral
  mcaffeTornadoAngle += Math.PI / 5
}

    function spawnBossExplosion(boss: BossEnemy, targetX: number, targetY: number) {
      const dx = targetX - boss.x
      const dy = targetY - boss.y
      const angle = Math.atan2(dy, dx)

      bullets.push({
        id: nextBossBulletId++,
        weaponId: 'mcaffe-explosive',
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * BOSS_EXPLOSIVE_SPEED,
        vy: Math.sin(angle) * BOSS_EXPLOSIVE_SPEED,
        size: 80,   
        ttl: 4.0,    
        damage: 16,
        maxTtl: 4.2,
        color: '#ffd0d8',
        type: 'explosive',
        explosiveDeceleration: 50,
        flashTimeElapsed: 0,
        piercing: false,
        bouncesLeft: 0,
        owner: 'enemy',
        ownerId: boss.id,
        stun: false,
        stunDuration: 0,
        blastRadius: BOSS_EXPLOSIVE_RADIUS,
        blastDamage: BOSS_EXPLOSIVE_DAMAGE,
      })
    }

    function spawnNortonShotgun(boss: BossEnemy, targetX: number, targetY: number) {
      const dx = targetX - boss.x
      const dy = targetY - boss.y
      const baseAngle = Math.atan2(dy, dx)
      const spreadRad = (NORTON_SHOTGUN_SPREAD_DEG * Math.PI) / 180

      for (let i = 0; i < NORTON_SHOTGUN_PELLETS; i += 1) {
        const factor = i / (NORTON_SHOTGUN_PELLETS - 1) - 0.5
        const angle = baseAngle + factor * spreadRad
        bullets.push({
          id: nextBossBulletId++,
          weaponId: 'norton-lightning',
          x: boss.x,
          y: boss.y,
          vx: Math.cos(angle) * NORTON_SHOTGUN_SPEED,
          vy: Math.sin(angle) * NORTON_SHOTGUN_SPEED,
          angleDeg: (angle * 180) / Math.PI + 90,
          size: 8,
          ttl: 1.7,
          maxTtl: 1.7,
          damage: NORTON_SHOTGUN_DAMAGE,
          color: '#d7f6ff',
          type: 'normal',
          piercing: false,
          bouncesLeft: 0,
          owner: 'enemy',
          ownerId: boss.id,
          stun: true,
          stunDuration: 0.2,
        })
      }
    }

    function spawnWindowsOrbitBullets(boss: BossEnemy) {
      const orbitTargetX = boss.x
      const orbitTargetY = boss.y

      for (let i = 0; i < WINDOWS_DEFENDER_ORBIT_BULLETS; i += 1) {
        const phase = (Math.PI * 2 * i) / WINDOWS_DEFENDER_ORBIT_BULLETS
        bullets.push({
          id: nextBossBulletId++,
          weaponId: 'windows-orbit',
          x: orbitTargetX + Math.cos(phase) * WINDOWS_DEFENDER_ORBIT_RADIUS,
          y: orbitTargetY + Math.sin(phase) * WINDOWS_DEFENDER_ORBIT_RADIUS,
          vx: 0,
          vy: 0,
          angleDeg: undefined,
          size: 10,
          ttl: WINDOWS_DEFENDER_ORBIT_LIFETIME,
          maxTtl: WINDOWS_DEFENDER_ORBIT_LIFETIME,
          damage: WINDOWS_DEFENDER_ORBIT_DAMAGE,
          color: '#aaf8d3',
          type: 'orbiting',
          orbitPhase: phase,
          orbitRadius: WINDOWS_DEFENDER_ORBIT_RADIUS,
          orbitTimeElapsed: 1.05,
          orbitSpeed: WINDOWS_DEFENDER_ORBIT_SPEED,
          initialVx: 0,
          initialVy: 0,
          orbitTargetX,
          orbitTargetY,
          piercing: false,
          bouncesLeft: 0,
          owner: 'enemy',
          ownerId: boss.id,
          stun: false,
          stunDuration: 0,
        })
      }
    }

    function startNortonDash(boss: BossEnemy) {
      const minDist = 240
      const maxDist = 480
      const angle = Math.random() * Math.PI * 2
      const dist = minDist + Math.random() * (maxDist - minDist)

      const playerCx = props.player.x + props.playerSize / 2
      const playerCy = props.player.y + props.playerSize / 2
      const targetX = playerCx + Math.cos(angle) * dist
      const targetY = playerCy + Math.sin(angle) * dist

      const dx = targetX - boss.x
      const dy = targetY - boss.y
      const len = Math.hypot(dx, dy) || 1

      boss.dashVx = (dx / len) * NORTON_DASH_SPEED
      boss.dashVy = (dy / len) * NORTON_DASH_SPEED
      boss.dashTimeLeft = NORTON_DASH_DURATION

      // Keep him slippery: small recover on each dash, like the old blink.
      boss.hp = Math.min(boss.maxHp, boss.hp + 8)
      requestShake(0.3, 8)
    }

    function removeBoss(index: number) {
      enemies.splice(index, 1)
      setBossPresence(false)
    }

    function circlesOverlap(
      a: { x: number; y: number; radius: number },
      b: { x: number; y: number; radius: number },
    ) {
      const dx = b.x - a.x
      const dy = b.y - a.y
      const minDist = a.radius + b.radius
      return dx * dx + dy * dy < minDist * minDist
    }

function updateBosses(dt: number) {
  if (props.isPaused || props.isGameOver || props.isMenuOpen) return

  if (escapeIndicator.active && escapeIndicator.timeLeft > 0) {
    escapeIndicator.timeLeft = Math.max(0, escapeIndicator.timeLeft - dt)
  }

  if (gameStore.playerStats.kills === 0 && !activeBoss.value) {
    mcaffeSpawned = false
    nortonSpawned = false
    windowsDefenderSpawned = false
    clearEscapePoint()
    setBossPresence(false)
  }

  if (
    !activeBoss.value &&
    !mcaffeSpawned &&
    gameStore.playerStats.kills >= MCAFFE_TRIGGER_KILLS
  ) {
    spawnMcAffeBoss()
  }

  if (
    !activeBoss.value &&
    mcaffeSpawned &&
    !nortonSpawned &&
    gameStore.playerStats.kills >= NORTON_TRIGGER_KILLS
  ) {
    spawnNortonBoss()
  }

  if (
    !activeBoss.value &&
    nortonSpawned &&
    !windowsDefenderSpawned &&
    gameStore.playerStats.kills >= WINDOWS_DEFENDER_TRIGGER_KILLS
  ) {
    spawnWindowsDefenderBoss()
  }

  const bossIndex = enemies.findIndex(
    (enemy) =>
      enemy.type === 'mcaffe' || enemy.type === 'norton' || enemy.type === 'windows-defender',
  )
  const boss = bossIndex >= 0 ? enemies[bossIndex] : null
  if (!boss) return

  setBossPresence(true)

  const targetX = props.player.x + props.playerSize / 2
  const targetY = props.player.y + props.playerSize / 2

  contactDamageCooldown = Math.max(0, contactDamageCooldown - dt)

  if (boss.type === 'windows-defender' && escapePoint.active) {
    const playerCenter = {
      x: props.player.x + props.playerSize / 2,
      y: props.player.y + props.playerSize / 2,
      radius: props.playerSize * 0.28,
    }
    const escapeZone = {
      x: escapePoint.x,
      y: escapePoint.y,
      radius: WINDOWS_DEFENDER_ESCAPE_RADIUS,
    }
    if (circlesOverlap(playerCenter, escapeZone)) {
      enemies.splice(bossIndex, 1)
      clearEscapePoint()
      setBossPresence(false)
      emit('escape')
      return
    }
  }

  if ((boss.introTimeLeft ?? 0) > 0) {
    boss.introTimeLeft = Math.max(0, (boss.introTimeLeft ?? 0) - dt)
    const introDuration = boss.introDuration ?? BOSS_INTRO_DURATION
    const progress = 1 - boss.introTimeLeft / Math.max(0.001, introDuration)
    const eased = 1 - Math.pow(1 - progress, 3)
    const startX = boss.introStartX ?? boss.x
    const startY = boss.introStartY ?? boss.y
    const finalX = boss.introTargetX ?? boss.x
    const finalY = boss.introTargetY ?? boss.y
    boss.x = startX + (finalX - startX) * eased
    boss.y = startY + (finalY - startY) * eased
  } else {
    if (boss.type === 'windows-defender') {
  const desiredX = targetX
  const desiredY = Math.max(boss.size / 2, targetY - 280)
  const dx = desiredX - boss.x
  const dy = desiredY - boss.y
  const dist = Math.hypot(dx, dy) || 1
  const moveSpeed = boss.speed ?? WINDOWS_DEFENDER_SPEED
  // Only move if far enough — avoids jitter when close
  if (dist > 12) {
    boss.x += (dx / dist) * moveSpeed * dt
    boss.y += (dy / dist) * moveSpeed * dt
  }
    } else if (boss.type === 'norton') {
      // Norton persigue al player, y el dash es lo que le da personalidad:
      // se lanza rápido para reposicionarse en vez de quedarse fijo.
      if ((boss.dashTimeLeft ?? 0) > 0) {
        boss.x += (boss.dashVx ?? 0) * dt
        boss.y += (boss.dashVy ?? 0) * dt
      } else {
        const dx = targetX - boss.x
        const dy = targetY - boss.y
        const dist = Math.hypot(dx, dy) || 1
        const moveSpeed = boss.speed ?? NORTON_SPEED
        boss.x += (dx / dist) * moveSpeed * dt
        boss.y += (dy / dist) * moveSpeed * dt
      }
    } else {
      const desiredX = targetX
      const desiredY = Math.max(boss.size / 2, targetY - 360)
      boss.x += (desiredX - boss.x) * Math.min(1, dt * 2.8)
      boss.y += (desiredY - boss.y) * Math.min(1, dt * 2.2)
    }
  }

  boss.x = Math.max(boss.size / 2, Math.min(boss.x, props.worldSize.width - boss.size / 2))
  boss.y = Math.max(boss.size / 2, Math.min(boss.y, props.worldSize.height - boss.size / 2))

  const playerHitbox = {
    x: props.player.x + props.playerSize / 2.5,
    y: props.player.y + props.playerSize / 2,
    radius: props.playerSize * 0.25,
  }
  const bossHitbox = {
    x: boss.x,
    y: boss.y,
    radius:
      boss.size *
      (boss.type === 'norton' ? 0.2 : boss.type === 'windows-defender' ? 0.28 : 0.34),
  }
  if (circlesOverlap(bossHitbox, playerHitbox) && contactDamageCooldown <= 0) {
    if (boss.type === 'windows-defender') {
      gameStore.takeDamage(gameStore.playerStats.health)
    } else {
      gameStore.takeDamage(BOSS_CONTACT_DAMAGE)
    }
    contactDamageCooldown = BOSS_CONTACT_COOLDOWN

    for (const rt of props.remoteTargets) {
    const remoteHitbox = { x: rt.x, y: rt.y, radius: props.playerSize * 0.25 }
    if (circlesOverlap(bossHitbox, remoteHitbox) && contactDamageCooldown <= 0) {
      const amount = boss.type === 'windows-defender' ? 9999 : BOSS_CONTACT_DAMAGE //Daño recibido si toca WDefender
      emit('damage-remote', { amount })
      contactDamageCooldown = BOSS_CONTACT_COOLDOWN
    }
  }
  }

  boss.tornadoTimer = (boss.tornadoTimer ?? 1.2) - dt
  if (boss.tornadoTimer <= 0) {
    if (boss.type === 'norton') {
      spawnNortonShotgun(boss, targetX, targetY)
      boss.tornadoTimer = boss.tornadoCooldown ?? NORTON_SHOTGUN_COOLDOWN
    } else if (boss.type === 'windows-defender') {
      spawnWindowsOrbitBullets(boss)
      boss.tornadoTimer = boss.tornadoCooldown ?? WINDOWS_DEFENDER_ORBIT_COOLDOWN
    } else {
      spawnBossTornado(boss)
      boss.tornadoTimer = boss.tornadoCooldown ?? BOSS_TORNADO_COOLDOWN
    }
  }

  if (boss.type === 'mcaffe') {
    boss.explosiveTimer = (boss.explosiveTimer ?? 2.1) - dt
    if (boss.explosiveTimer <= 0) {
      spawnBossExplosion(boss, targetX, targetY)
      boss.explosiveTimer = boss.explosiveCooldown ?? BOSS_EXPLOSIVE_COOLDOWN
    }
  } else if (boss.type === 'norton') {
    if ((boss.dashTimeLeft ?? 0) > 0) {
      // Wind down the active dash.
      boss.dashTimeLeft = Math.max(0, (boss.dashTimeLeft ?? 0) - dt)
    } else {
      boss.dashTimer = (boss.dashTimer ?? 1.6) - dt
      if (boss.dashTimer <= 0) {
        startNortonDash(boss)
        boss.dashTimer = boss.dashCooldown ?? NORTON_DASH_COOLDOWN
      }
    }
  } else if (boss.type === 'windows-defender') {
    boss.hp = boss.maxHp
    const bossBullets = bullets.filter(
      (bullet) => bullet.ownerId === boss.id && bullet.type === 'orbiting',
    )
    for (const bullet of bossBullets) {
      bullet.orbitTargetX = boss.x
      bullet.orbitTargetY = boss.y
    }
  }
  // ↑ FIN BLOQUE CAMBIADO ↑

  if (boss.type !== 'windows-defender' && boss.hp <= 0) {
    gameStore.incrementKills()
    gameStore.addExperience(boss.type === 'norton' ? NORTON_EXPERIENCE : BOSS_EXPERIENCE)
    removeBoss(bossIndex)
  }
}

    function loop(ts: number) {
      if (!lastTime) lastTime = ts
      const dt = (ts - lastTime) / 1000
      lastTime = ts

      if (!props.coopGuest) updateBosses(dt)
      rafId = requestAnimationFrame(loop)
    }

    onMounted(() => {
      rafId = requestAnimationFrame(loop)
    })

    onUnmounted(() => {
      if (rafId) cancelAnimationFrame(rafId)
    })

    return {
      bossEnemy,
      bossLabel,
      bossHealthText,
      bossHealthBarStyle,
      bossStyle,
      escapeIndicatorStyle,
      escapeIndicatorText,
      escapePointStyle,
    }
  },
})
</script>

<style scoped>
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
  transform-origin: left center;
  transition: width 0.18s ease;
}

.boss-enemy {
  position: absolute;
  image-rendering: pixelated;
}

.escape-indicator {
  position: absolute;
  z-index: 72;
  pointer-events: none;
  transform-origin: center;
  transition: transform 0.08s linear;
}

.escape-indicator-text {
  display: inline-block;
  color: #ecfff4;
  font-size: 2.6rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-shadow:
    0 0 16px rgba(97, 255, 182, 0.9),
    0 0 32px rgba(59, 197, 131, 0.62);
  white-space: nowrap;
}

.escape-point {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 50%;
  z-index: 80;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(108, 255, 188, 0.98) 16%,
    rgba(54, 211, 139, 0.82) 36%,
    rgba(54, 211, 139, 0.18) 60%,
    rgba(54, 211, 139, 0) 78%
  );
  box-shadow:
    0 0 30px rgba(96, 255, 183, 0.95),
    0 0 58px rgba(96, 255, 183, 0.5),
    0 0 0 6px rgba(203, 255, 232, 0.26) inset;
  animation: escapePulse 1.1s ease-in-out infinite;
}

.escape-point-core {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(247, 255, 250, 1) 0%, rgba(124, 255, 195, 1) 100%);
  box-shadow:
    0 0 18px rgba(121, 255, 188, 0.95),
    0 0 0 4px rgba(255, 255, 255, 0.5) inset;
  margin-top: -6px;
}

.escape-point-label {
  margin-top: -6px;
  color: #effff6;
  font-size: 0.88rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-shadow: 0 0 8px rgba(48, 169, 113, 0.9);
}

@keyframes escapePulse {
  0%,
  100% {
    opacity: 0.84;
    box-shadow:
      0 0 24px rgba(96, 255, 183, 0.86),
      0 0 46px rgba(96, 255, 183, 0.42),
      0 0 0 5px rgba(203, 255, 232, 0.22) inset;
  }
  50% {
    opacity: 1;
    box-shadow:
      0 0 36px rgba(96, 255, 183, 1),
      0 0 70px rgba(96, 255, 183, 0.56),
      0 0 0 7px rgba(203, 255, 232, 0.3) inset;
  }
}
</style>