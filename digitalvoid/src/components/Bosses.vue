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
  </template>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, type PropType } from 'vue'
import { useGameStore } from '../stores/game'

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
  type: 'mcaffe' | 'norton' | 'grunt' | 'runner' | 'tank' | 'shooter'
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
  teleportTimer?: number
  teleportCooldown?: number
  teleportFxTimeLeft?: number
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
  },
  emits: {
    'state-change': (active: boolean) => typeof active === 'boolean',
    shake: (payload: { duration: number; intensity: number }) =>
      typeof payload.duration === 'number' && typeof payload.intensity === 'number',
  },
  setup(props, { emit }) {
    const gameStore = useGameStore()

    const MCAFFE_TRIGGER_KILLS = 100
    const NORTON_TRIGGER_KILLS = 200
    const BOSS_MCAFFE_SIZE = 300
    const BOSS_MCAFFE_HP = 520
    const BOSS_MCAFFE_SPEED = 112
    const BOSS_INTRO_DURATION = 1.9
    const BOSS_TORNADO_COOLDOWN = 2.8
    const BOSS_EXPLOSIVE_COOLDOWN = 4.4
    const BOSS_TORNADO_ORBIT_RADIUS = 96
    const BOSS_TORNADO_SPEED = Math.PI * 2.2 * 1.2
    const BOSS_TORNADO_SPEED_BULLET = 420
    const BOSS_EXPLOSIVE_SPEED = 280
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
    const NORTON_TELEPORT_COOLDOWN = 2.35
    const NORTON_TELEPORT_FX = 0.16
    const NORTON_EXPERIENCE = 340
    const BOSS_SHAKE_DURATION = 2.2
    const BOSS_SHAKE_INTENSITY = 26
    const BOSS_CONTACT_DAMAGE = 28
    const BOSS_CONTACT_COOLDOWN = 0.55

    let nextBossBulletId = 1_000_000
    let nextBossEnemyId = 1_000_000
    let mcaffeSpawned = false
    let nortonSpawned = false
    let rafId: number | null = null
    let lastTime = 0
    let contactDamageCooldown = 0

    const activeBoss = computed(
      () =>
        props.enemies.find((enemy) => enemy.type === 'mcaffe' || enemy.type === 'norton') ?? null,
    )
    const bossEnemy = computed(() => activeBoss.value)

    const bossLabel = computed(() => {
      if (!activeBoss.value) return 'BOSS'
      return activeBoss.value.type === 'norton' ? 'NORTON' : 'MCAFFE'
    })

    const bossHealthText = computed(() => {
      if (!activeBoss.value) return '0 / 0'
      return `${activeBoss.value.hp} / ${activeBoss.value.maxHp}`
    })

    const bossHealthBarStyle = computed(() => {
      if (!activeBoss.value) return { width: '0%' }
      const pct = Math.max(0, (activeBoss.value.hp / activeBoss.value.maxHp) * 100)
      return { width: `${Math.min(pct, 100)}%` }
    })

    const bossStyle = computed(() => {
      const boss = activeBoss.value
      if (!boss) return {}

      const screenX = Math.round(boss.x - props.camera.x - boss.size / 2)
      const screenY = Math.round(boss.y - props.camera.y - boss.size / 2)
      const introActive = (boss.introTimeLeft ?? 0) > 0

      const isNorton = boss.type === 'norton'

      return {
        width: `${boss.size}px`,
        height: `${boss.size}px`,
        transform: `translate(${screenX}px, ${screenY}px)`,
        background: isNorton
          ? 'radial-gradient(circle at 35% 28%, rgba(223, 248, 255, 0.96) 0%, rgba(126, 226, 255, 0.9) 28%, rgba(41, 143, 212, 0.92) 66%, rgba(9, 28, 48, 1) 100%)'
          : 'radial-gradient(circle at 35% 30%, rgba(255, 238, 245, 0.96) 0%, rgba(255, 109, 142, 0.86) 28%, rgba(175, 28, 76, 0.95) 66%, rgba(33, 7, 18, 1) 100%)',
        border: isNorton
          ? '5px solid rgba(212, 247, 255, 0.9)'
          : '6px solid rgba(255, 220, 230, 0.88)',
        borderRadius: '50%',
        boxShadow: introActive
          ? isNorton
            ? '0 0 42px rgba(84, 213, 255, 0.84), inset 0 0 22px rgba(255, 255, 255, 0.24)'
            : '0 0 38px rgba(255, 81, 130, 0.8), inset 0 0 24px rgba(255, 255, 255, 0.28)'
          : isNorton
            ? '0 0 30px rgba(64, 196, 255, 0.62), inset 0 0 14px rgba(255, 255, 255, 0.2)'
            : '0 0 28px rgba(255, 81, 130, 0.55), inset 0 0 16px rgba(255, 255, 255, 0.22)',
        zIndex: 12,
        opacity:
          boss.teleportFxTimeLeft && boss.teleportFxTimeLeft > 0
            ? '0.55'
            : introActive
              ? '0.98'
              : '1',
      }
    })

    const enemies = props.enemies as BossEnemy[]
    const bullets = props.bullets as BossBullet[]

    function requestShake(duration = BOSS_SHAKE_DURATION, intensity = BOSS_SHAKE_INTENSITY) {
      emit('shake', { duration, intensity })
    }

    function setBossPresence(active: boolean) {
      emit('state-change', active)
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
        teleportTimer: 2,
        teleportCooldown: NORTON_TELEPORT_COOLDOWN,
        teleportFxTimeLeft: 0,
      })

      nortonSpawned = true
      requestShake(1.7, 24)
      setBossPresence(true)
    }

    function spawnBossTornado(boss: BossEnemy, targetX: number, targetY: number) {
      const dx = targetX - boss.x
      const dy = targetY - boss.y
      const angle = Math.atan2(dy, dx)

      bullets.push({
        id: nextBossBulletId++,
        weaponId: 'mcaffe',
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * BOSS_TORNADO_SPEED_BULLET,
        vy: Math.sin(angle) * BOSS_TORNADO_SPEED_BULLET,
        angleDeg: (angle * 180) / Math.PI + 90,
        size: 20,
        ttl: 4.2,
        maxTtl: 4.2,
        damage: 16,
        color: '#ffbfd0',
        type: 'orbiting',
        orbitPhase: Math.random() * Math.PI * 2,
        orbitRadius: BOSS_TORNADO_ORBIT_RADIUS,
        orbitTimeElapsed: 0,
        orbitSpeed: BOSS_TORNADO_SPEED,
        initialVx: Math.cos(angle) * BOSS_TORNADO_SPEED_BULLET,
        initialVy: Math.sin(angle) * BOSS_TORNADO_SPEED_BULLET,
        orbitTargetX: targetX,
        orbitTargetY: targetY,
        piercing: false,
        bouncesLeft: 0,
        owner: 'enemy',
        ownerId: boss.id,
        stun: false,
        stunDuration: 0,
      })
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
        size: 18,
        ttl: 4.2,
        maxTtl: 4.2,
        damage: 14,
        color: '#ffd0d8',
        type: 'explosive',
        explosiveDeceleration: 220,
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
          stunDuration: 0.35,
        })
      }
    }

    function teleportNorton(boss: BossEnemy) {
      const minDist = 260
      const maxDist = 560
      const angle = Math.random() * Math.PI * 2
      const dist = minDist + Math.random() * (maxDist - minDist)

      const targetX = props.player.x + props.playerSize / 2 + Math.cos(angle) * dist
      const targetY = props.player.y + props.playerSize / 2 + Math.sin(angle) * dist

      boss.x = Math.max(boss.size / 2, Math.min(targetX, props.worldSize.width - boss.size / 2))
      boss.y = Math.max(boss.size / 2, Math.min(targetY, props.worldSize.height - boss.size / 2))
      boss.teleportFxTimeLeft = NORTON_TELEPORT_FX

      // Make Norton harder to kill by evading and recovering a bit on each blink.
      boss.hp = Math.min(boss.maxHp, boss.hp + 8)
      requestShake(0.35, 10)
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

      if (gameStore.playerStats.kills === 0 && !activeBoss.value) {
        mcaffeSpawned = false
        nortonSpawned = false
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

      const bossIndex = enemies.findIndex(
        (enemy) => enemy.type === 'mcaffe' || enemy.type === 'norton',
      )
      const boss = bossIndex >= 0 ? enemies[bossIndex] : null
      if (!boss) return

      setBossPresence(true)

      const targetX = props.player.x + props.playerSize / 2
      const targetY = props.player.y + props.playerSize / 2

      contactDamageCooldown = Math.max(0, contactDamageCooldown - dt)

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
        const desiredX = targetX
        const desiredY = Math.max(boss.size / 2, targetY - (boss.type === 'norton' ? 300 : 360))
        boss.x += (desiredX - boss.x) * Math.min(1, dt * (boss.type === 'norton' ? 4.4 : 2.8))
        boss.y += (desiredY - boss.y) * Math.min(1, dt * (boss.type === 'norton' ? 3.2 : 2.2))
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
        radius: boss.size * (boss.type === 'norton' ? 0.2 : 0.34),
      }
      if (circlesOverlap(bossHitbox, playerHitbox) && contactDamageCooldown <= 0) {
        gameStore.takeDamage(BOSS_CONTACT_DAMAGE)
        contactDamageCooldown = BOSS_CONTACT_COOLDOWN
      }

      boss.tornadoTimer = (boss.tornadoTimer ?? 1.2) - dt
      if (boss.tornadoTimer <= 0) {
        if (boss.type === 'norton') {
          spawnNortonShotgun(boss, targetX, targetY)
          boss.tornadoTimer = boss.tornadoCooldown ?? NORTON_SHOTGUN_COOLDOWN
        } else {
          spawnBossTornado(boss, targetX, targetY)
          boss.tornadoTimer = boss.tornadoCooldown ?? BOSS_TORNADO_COOLDOWN
        }
      }

      if (boss.type === 'mcaffe') {
        boss.explosiveTimer = (boss.explosiveTimer ?? 2.1) - dt
        if (boss.explosiveTimer <= 0) {
          spawnBossExplosion(boss, targetX, targetY)
          boss.explosiveTimer = boss.explosiveCooldown ?? BOSS_EXPLOSIVE_COOLDOWN
        }
      } else {
        boss.teleportTimer = (boss.teleportTimer ?? 1.6) - dt
        if (boss.teleportTimer <= 0) {
          teleportNorton(boss)
          boss.teleportTimer = boss.teleportCooldown ?? NORTON_TELEPORT_COOLDOWN
        }
        boss.teleportFxTimeLeft = Math.max(0, (boss.teleportFxTimeLeft ?? 0) - dt)
      }

      if (boss.hp <= 0) {
        gameStore.incrementKills()
        gameStore.addExperience(boss.type === 'norton' ? NORTON_EXPERIENCE : BOSS_EXPERIENCE)
        removeBoss(bossIndex)
      }
    }

    function loop(ts: number) {
      if (!lastTime) lastTime = ts
      const dt = (ts - lastTime) / 1000
      lastTime = ts

      updateBosses(dt)
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
  box-shadow: 0 0 16px rgba(255, 72, 122, 0.66);
  transform-origin: left center;
  transition: width 0.18s ease;
}

.boss-enemy {
  position: absolute;
  image-rendering: pixelated;
}
</style>
