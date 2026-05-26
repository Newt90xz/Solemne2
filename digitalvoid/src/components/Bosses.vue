<template>
  <template v-if="bossEnemy">
    <div class="boss-hud">
      <div class="boss-card">
        <div class="boss-topline">
          <span class="boss-title">MCAFFE</span>
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
  type: 'mcaffe' | 'grunt' | 'runner' | 'tank' | 'shooter'
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

    const BOSS_TRIGGER_KILLS = 100
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
    const BOSS_SHAKE_DURATION = 2.2
    const BOSS_SHAKE_INTENSITY = 26
    const BOSS_CONTACT_DAMAGE = 28
    const BOSS_CONTACT_COOLDOWN = 0.55

    let nextBossBulletId = 1_000_000
    let nextBossEnemyId = 1_000_000
    let bossTriggerArmed = true
    let rafId: number | null = null
    let lastTime = 0
    let contactDamageCooldown = 0

    const bossEnemy = computed(() => props.enemies.find((enemy) => enemy.type === 'mcaffe') ?? null)

    const bossHealthText = computed(() => {
      if (!bossEnemy.value) return '0 / 0'
      return `${bossEnemy.value.hp} / ${bossEnemy.value.maxHp}`
    })

    const bossHealthBarStyle = computed(() => {
      if (!bossEnemy.value) return { width: '0%' }
      const pct = Math.max(0, (bossEnemy.value.hp / bossEnemy.value.maxHp) * 100)
      return { width: `${Math.min(pct, 100)}%` }
    })

    const bossStyle = computed(() => {
      const boss = bossEnemy.value
      if (!boss) return {}

      const screenX = Math.round(boss.x - props.camera.x - boss.size / 2)
      const screenY = Math.round(boss.y - props.camera.y - boss.size / 2)
      const introActive = (boss.introTimeLeft ?? 0) > 0

      return {
        width: `${boss.size}px`,
        height: `${boss.size}px`,
        transform: `translate(${screenX}px, ${screenY}px)`,
        background:
          'radial-gradient(circle at 35% 30%, rgba(255, 238, 245, 0.96) 0%, rgba(255, 109, 142, 0.86) 28%, rgba(175, 28, 76, 0.95) 66%, rgba(33, 7, 18, 1) 100%)',
        border: '6px solid rgba(255, 220, 230, 0.88)',
        borderRadius: '50%',
        boxShadow: introActive
          ? '0 0 38px rgba(255, 81, 130, 0.8), inset 0 0 24px rgba(255, 255, 255, 0.28)'
          : '0 0 28px rgba(255, 81, 130, 0.55), inset 0 0 16px rgba(255, 255, 255, 0.22)',
        zIndex: 12,
        opacity: introActive ? '0.98' : '1',
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

    function spawnBoss() {
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

      bossTriggerArmed = false
      requestShake()
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

    function removeBoss(index: number) {
      enemies.splice(index, 1)
      bossTriggerArmed = false
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

      if (gameStore.playerStats.kills === 0 && !bossEnemy.value) {
        bossTriggerArmed = true
        setBossPresence(false)
      }

      if (
        bossTriggerArmed &&
        !bossEnemy.value &&
        gameStore.playerStats.kills >= BOSS_TRIGGER_KILLS
      ) {
        spawnBoss()
      }

      const bossIndex = enemies.findIndex((enemy) => enemy.type === 'mcaffe')
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
        const desiredY = Math.max(boss.size / 2, targetY - 360)
        boss.x += (desiredX - boss.x) * Math.min(1, dt * 2.8)
        boss.y += (desiredY - boss.y) * Math.min(1, dt * 2.2)
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
        radius: boss.size * 0.34,
      }
      if (circlesOverlap(bossHitbox, playerHitbox) && contactDamageCooldown <= 0) {
        gameStore.takeDamage(BOSS_CONTACT_DAMAGE)
        contactDamageCooldown = BOSS_CONTACT_COOLDOWN
      }

      boss.tornadoTimer = (boss.tornadoTimer ?? 1.2) - dt
      if (boss.tornadoTimer <= 0) {
        spawnBossTornado(boss, targetX, targetY)
        boss.tornadoTimer = boss.tornadoCooldown ?? BOSS_TORNADO_COOLDOWN
      }

      boss.explosiveTimer = (boss.explosiveTimer ?? 2.1) - dt
      if (boss.explosiveTimer <= 0) {
        spawnBossExplosion(boss, targetX, targetY)
        boss.explosiveTimer = boss.explosiveCooldown ?? BOSS_EXPLOSIVE_COOLDOWN
      }

      if (boss.hp <= 0) {
        gameStore.incrementKills()
        gameStore.addExperience(BOSS_EXPERIENCE)
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
