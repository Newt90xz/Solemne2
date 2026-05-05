<template>
  <section class="config-shell">
    <div class="config-ornament config-ornament-left"></div>
    <div class="config-ornament config-ornament-right"></div>

    <div class="config-card">
      <header class="config-header">
        <p class="eyebrow">Digital Void</p>
        <h2>Configuración del juego</h2>
        <p class="subtitle">
          Ajusta tu partida antes de entrar al vacío digital.
        </p>
      </header>

      <form class="config-form" @submit.prevent="apply">
        <div class="field field-full">
          <label for="playerName">Nombre del jugador</label>
          <input id="playerName" v-model="settings.playerName" type="text" placeholder="Jugador" />
        </div>

        <div class="field">
          <label for="difficulty">Dificultad</label>
          <select id="difficulty" v-model="settings.difficulty">
            <option value="facil">Fácil</option>
            <option value="medio">Medio</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>

        <div class="field">
          <label for="mode">Modo de juego</label>
          <select id="mode" v-model="settings.mode">
            <option value="solitario">Solitario</option>
            <option value="multijugador">Multijugador</option>
          </select>
        </div>

        <div class="field">
          <label for="timeLimit">Tiempo (segundos)</label>
          <input id="timeLimit" v-model.number="settings.timeLimit" type="number" min="0" />
        </div>

        <div class="field toggle-field field-full">
          <div>
            <label for="sound">Sonido</label>
            <p class="field-hint">Activa o desactiva el audio del juego.</p>
          </div>
          <label class="toggle">
            <input id="sound" type="checkbox" v-model="settings.sound" />
            <span class="toggle-track"></span>
          </label>
        </div>

        <div class="actions field-full">
          <button class="primary" type="submit">Guardar</button>
          <button type="button" @click="reset">Restablecer</button>
          <button class="ghost" type="button" @click="goBack">Volver</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useGameStore } from '../stores/game'

type Difficulty = 'facil' | 'medio' | 'dificil'
type Mode = 'solitario' | 'multijugador'

interface GameSettings {
  playerName: string
  difficulty: Difficulty
  mode: Mode
  timeLimit: number
  sound: boolean
}

const emit = defineEmits<{
  (e: 'save', payload: GameSettings): void
  (e: 'go-back'): void
}>()

const defaultSettings: GameSettings = {
  playerName: '',
  difficulty: 'medio',
  mode: 'solitario',
  timeLimit: 60,
  sound: true,
}

const settings = reactive<GameSettings>({ ...defaultSettings })

const gameStore = useGameStore()

onMounted(() => {
  gameStore.loadFromLocal()
  Object.assign(settings, gameStore.settings)
})

function apply() {
  emit('save', { ...settings })
  gameStore.setSettings({ ...settings })
  gameStore.saveToLocal()
}

function reset() {
  Object.assign(settings, defaultSettings)
}

function goBack() {
  emit('go-back')
}
</script>

<style scoped>
.config-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px 16px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(121, 255, 209, 0.18), transparent 32%),
    radial-gradient(circle at bottom right, rgba(255, 80, 80, 0.18), transparent 28%),
    linear-gradient(160deg, #07111f 0%, #0c1628 48%, #03070f 100%);
}

.config-ornament {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.85;
  pointer-events: none;
}

.config-ornament-left {
  width: 220px;
  height: 220px;
  left: -70px;
  top: 8%;
  background: rgba(31, 196, 176, 0.16);
}

.config-ornament-right {
  width: 280px;
  height: 280px;
  right: -90px;
  bottom: 6%;
  background: rgba(255, 104, 104, 0.14);
}

.config-card {
  width: min(100%, 760px);
  position: relative;
  z-index: 1;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(180deg, rgba(15, 24, 41, 0.94), rgba(7, 12, 20, 0.96));
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  color: #f5f7fa;
}

.config-header {
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  color: #71f5d0;
}

.config-header h2 {
  margin: 0;
  font-size: clamp(1.8rem, 2.4vw, 2.6rem);
  line-height: 1.05;
}

.subtitle {
  margin: 10px 0 0;
  max-width: 54ch;
  color: rgba(232, 238, 246, 0.8);
}

.config-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-full {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 700;
  font-size: 0.95rem;
  color: #ffffff;
}

.field-hint {
  margin: -2px 0 0;
  font-size: 0.88rem;
  color: rgba(232, 238, 246, 0.7);
}

.field input[type='text'],
.field input[type='number'],
.field select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  outline: none;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.field input:focus,
.field select:focus {
  border-color: rgba(113, 245, 208, 0.7);
  background: rgba(255, 255, 255, 0.09);
}

.toggle-field {
  margin-top: 4px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-track {
  width: 54px;
  height: 30px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  position: relative;
  transition: background 0.18s ease;
}

.toggle-track::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.18s ease;
}

.toggle input:checked + .toggle-track {
  background: linear-gradient(135deg, #2de2b6, #6ee7ff);
}

.toggle input:checked + .toggle-track::after {
  transform: translateX(24px);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.actions button {
  padding: 12px 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.actions button:hover,
.actions button:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.12);
}

.actions .primary {
  background: linear-gradient(135deg, #39e6b3, #1ea7ff);
  color: #06111f;
  border-color: transparent;
}

.actions .primary:hover,
.actions .primary:focus-visible {
  background: linear-gradient(135deg, #4ef0be, #3bb3ff);
}

.actions .ghost {
  background: rgba(255, 255, 255, 0.03);
}

@media (max-width: 640px) {
  .config-card {
    padding: 20px;
    border-radius: 20px;
  }

  .config-form {
    grid-template-columns: 1fr;
  }

  .toggle-field {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
