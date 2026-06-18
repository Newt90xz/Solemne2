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

        <div class="stat-row infection-row">
          <span class="label">PROGRESO INFECCIÓN</span>
          <div class="track track-infection">
            <span class="infection-marker infection-marker-100"></span>
            <span class="infection-marker infection-marker-200"></span>
            <div class="fill fill-infection" :style="infectionBarStyle"></div>
          </div>
          <span class="bar-text">{{ infectionText }}</span>
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

const INFECTION_TARGET = 300

const infectionText = computed(() => `${playerStats.value.kills} / ${INFECTION_TARGET}`)

const expBarStyle = computed(() => {
  const percentage = (playerStats.value.experience / playerStats.value.experienceToLevel) * 100
  return {
    width: `${Math.min(percentage, 100)}%`,
  }
})

const infectionBarStyle = computed(() => {
  const percentage = (playerStats.value.kills / INFECTION_TARGET) * 100
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

.track-infection {
  min-width: 128px;
}

.track-infection::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    transparent 0,
    transparent calc(33.333% - 1px),
    rgba(255, 255, 255, 0.22) calc(33.333% - 1px),
    rgba(255, 255, 255, 0.22) calc(33.333% + 1px),
    transparent calc(33.333% + 1px),
    transparent calc(66.666% - 1px),
    rgba(255, 255, 255, 0.22) calc(66.666% - 1px),
    rgba(255, 255, 255, 0.22) calc(66.666% + 1px),
    transparent calc(66.666% + 1px)
  );
  opacity: 0.85;
  pointer-events: none;
  z-index: 2;
}

.infection-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(210, 255, 210, 0.55);
  box-shadow: 0 0 6px rgba(144, 238, 144, 0.8);
  pointer-events: none;
  z-index: 3;
}

.infection-marker-100 {
  left: 33.333%;
}

.infection-marker-200 {
  left: 66.666%;
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

.fill-infection {
  background: repeating-linear-gradient(
    90deg,
    #90ee90 0,
    #90ee90 6px,
    rgba(50, 205, 50, 0.92) 6px,
    rgba(50, 205, 50, 0.92) 10px
  );
  background-size: 20px 100%;
  box-shadow: 0 0 12px rgba(50, 205, 50, 0.6);
  animation:
    infectionPulse 2.2s ease-in-out infinite,
    infectionShift 1s linear infinite;
}

.bar-text {
  color: rgba(221, 239, 255, 0.9);
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  min-width: 52px;
  text-align: right;
}

@keyframes infectionShift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 20px 0;
  }
}

@keyframes infectionPulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}
</style>
