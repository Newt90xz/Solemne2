<template>
  <section class="player-hub">
    <div class="panel-heading hub-heading">
      <p class="panel-title">-----</p>
    </div>

    <div class="hub-grid">
      <div class="level-block">
        <span class="label">NIVEL</span>
        <strong class="level-value">{{ formattedLevel }}</strong>
      </div>

      <div class="bars-block">
        <div class="stat-row health-row">
          <span class="label">SALUD</span>
          <div class="track track-health">
            <div class="fill fill-health" :style="healthBarStyle"></div>
          </div>
          <span class="bar-text">{{ healthText }}</span>
        </div>

        <div class="stat-row exp-row">
          <span class="label">EXP</span>
          <div class="track track-exp">
            <div class="fill fill-exp" :style="expBarStyle"></div>
          </div>
          <span class="bar-text">{{ expText }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()

const playerStats = computed(() => gameStore.playerStats)
const formattedLevel = computed(() => String(playerStats.value.level).padStart(2, '0'))
const healthText = computed(() => `${playerStats.value.health} / ${playerStats.value.maxHealth}`)
const expText = computed(
  () => `${playerStats.value.experience} / ${playerStats.value.experienceToLevel}`,
)

const expBarStyle = computed(() => {
  const percentage = (playerStats.value.experience / playerStats.value.experienceToLevel) * 100
  return {
    width: `${Math.min(percentage, 100)}%`,
  }
})

const healthBarStyle = computed(() => {
  const percentage = (playerStats.value.health / playerStats.value.maxHealth) * 100
  return {
    width: `${Math.max(percentage, 0)}%`,
  }
})
</script>

<style scoped>
.player-hub {
  width: 100%;
  padding: 12px 14px 14px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  clip-path: none !important;
  position: relative;
}

.player-hub::before,
.player-hub::after {
  display: none !important;
}

.hub-heading {
  margin-bottom: 8px;
}

.hub-grid {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 8px;
  align-items: start;
}

.level-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-value {
  color: #9fe3ff;
  font-size: 2.4rem;
  line-height: 1;
  letter-spacing: 0.03em;
  text-shadow: 0 0 14px rgba(111, 199, 255, 0.38);
}

.label {
  font-size: 0.56rem;
  letter-spacing: 0.18em;
  color: #7dc8ff;
  text-transform: uppercase;
}

.bars-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 7px;
  align-items: center;
}

.track {
  position: relative;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(8, 14, 30, 0.95);
  border: 1px solid rgba(97, 182, 255, 0.3);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 14px rgba(79, 164, 255, 0.08);
}

.track-health {
  min-width: 128px;
}

.track-exp {
  min-width: 128px;
}

.fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.25s ease;
}

.fill-health {
  background: linear-gradient(90deg, #ff76b3, #ff3f8a);
  box-shadow: 0 0 12px rgba(255, 95, 154, 0.6);
}

.fill-exp {
  background: linear-gradient(90deg, #57c8ff, #8d7bff);
  box-shadow: 0 0 12px rgba(95, 163, 255, 0.5);
}

.bar-text {
  color: rgba(221, 239, 255, 0.9);
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  min-width: 52px;
  text-align: right;
}
</style>
