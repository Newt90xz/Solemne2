<template>
  <div class="player-hub">
    <div class="hub-panel">
      <!-- Icono Jugador -->
      <div class="player-icon">🔴</div>

      <div class="hub-content">
        <!-- Nivel -->
        <div class="level-row">
          <span class="label">NIVEL</span>
          <span class="value">{{ playerStats ? playerStats.level : 1 }}</span>
        </div>

        <!-- Experiencia -->
        <div class="exp-row">
          <span class="label">EXP</span>
          <div class="bar-wrapper">
            <div class="bar">
              <div class="bar-fill" :style="expBarStyle"></div>
            </div>
            <span class="bar-text"
              >{{ playerStats ? playerStats.experience : 0 }}/{{
                playerStats ? playerStats.experienceToLevel : 100
              }}</span
            >
          </div>
        </div>

        <!-- Salud -->
        <div class="health-row">
          <span class="label">SALUD</span>
          <div class="bar-wrapper">
            <div class="bar">
              <div class="bar-fill health" :style="healthBarStyle"></div>
            </div>
            <span class="bar-text"
              >{{ playerStats ? playerStats.health : 0 }}/{{
                playerStats ? playerStats.maxHealth : 100
              }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue'
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()

const playerStats = computed(() => gameStore.playerStats)
const activeBuffs = computed(() => gameStore.activeBuffs)

const expBarStyle = computed(() => {
  const ps = unref(playerStats)
  if (!ps) return { width: '0%' }
  const percentage = (ps.experience / ps.experienceToLevel) * 100
  return {
    width: `${Math.min(percentage, 100)}%`,
  }
})

const healthBarStyle = computed(() => {
  const ps = unref(playerStats)
  if (!ps) return { width: '100%', backgroundColor: '#4ade80' }
  const percentage = (ps.health / ps.maxHealth) * 100
  const color = percentage > 50 ? '#4ade80' : percentage > 25 ? '#facc15' : '#ef4444'
  return {
    width: `${Math.max(percentage, 0)}%`,
    backgroundColor: color,
  }
})

function buffProgress(buff: any): number {
  // Assuming initial duration is stored or calculated
  const totalDuration = buff.type === 'speed' ? 12 : 10
  return (buff.remainingTime / totalDuration) * 100
}
</script>

<style scoped>
.player-hub {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 15;
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Courier New', monospace;
}

.hub-panel {
  background: rgba(10, 15, 30, 0.85);
  border: 2px solid rgba(99, 102, 241, 0.4);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #ffffff;
}

.player-icon {
  font-size: 28px;
  flex-shrink: 0;
  min-width: 32px;
  text-align: center;
}

.hub-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.label {
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.value {
  color: #60a5fa;
  font-weight: 700;
  font-size: 12px;
}

.exp-row,
.health-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.bar {
  height: 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.3s ease;
}

.bar-fill.health {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.bar-text {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
}
</style>
