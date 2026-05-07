<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="config-shell">
    <canvas ref="canvasRef" class="matrix-canvas" />
    <div class="scanlines" />
    <div class="vignette" />

    <div class="config-card">
      <header class="config-header">
        <p class="eyebrow">SISTEMA DIGITAL VOID</p>
        <h2>Configuración del juego</h2>
        <p class="subtitle">Ajusta tu partida antes de entrar al vacío digital.</p>
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

    <div class="corner tl" />
    <div class="corner tr" />
    <div class="corner bl" />
    <div class="corner br" />
  </section>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, ref } from 'vue'
import { useGameStore } from '../stores/game'

type Difficulty = 'facil' | 'medio' | 'dificil'
type Mode = 'solitario' | 'multijugador'

interface GameSettings {
  playerName: string
  difficulty: Difficulty
  mode: Mode
  timeLimit: number
  sound: boolean
  musicVolume: number
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
  musicVolume: 0.7,
}

const settings = reactive<GameSettings>({ ...defaultSettings })

const gameStore = useGameStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const fontSize = 16
let columns = 0
let drops: number[] = []
let animationInterval: number | null = null

function updateColumns() {
  const canvas = canvasRef.value
  if (!canvas) return
  columns = canvas.width / fontSize
  drops = Array.from({ length: Math.ceil(columns) }).fill(1) as number[]
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#00FF9C'
  ctx.font = `${fontSize}px monospace`

  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length))
    ctx.fillText(text, i * fontSize, drops[i]! * fontSize)

    if (drops[i]! * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0
    }

    drops[i] = drops[i]! + 1
  }
}

onMounted(() => {
  gameStore.loadFromLocal()
  Object.assign(settings, gameStore.settings)

  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resizeCanvas()
  updateColumns()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('resize', updateColumns)
  animationInterval = window.setInterval(draw, 33)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('resize', updateColumns)
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
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
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.config-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  position: relative;
  overflow: hidden;
  font-family: 'Share Tech Mono', monospace;
  color: #7bffb5;
}

.matrix-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: black;
}

.scanlines,
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scanlines {
  z-index: 1;
  background: repeating-linear-gradient(
    to bottom,
    rgba(40, 255, 145, 0.04) 0,
    rgba(40, 255, 145, 0.04) 1px,
    transparent 1px,
    transparent 4px
  );
}

.vignette {
  z-index: 1;
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.7) 100%);
}

.config-card {
  width: min(100%, 760px);
  position: relative;
  z-index: 2;
  padding: 28px;
  border-radius: 0;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(0, 18, 8, 0.46);
  box-shadow:
    0 0 20px rgba(0, 255, 136, 0.14),
    inset 0 0 18px rgba(0, 255, 136, 0.1);
  color: #7bffb5;
}

.config-header {
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  color: #9affc5;
}

.config-header h2 {
  margin: 0;
  font-size: clamp(1.8rem, 2.4vw, 2.6rem);
  line-height: 1.05;
}

.subtitle {
  margin: 10px 0 0;
  max-width: 54ch;
  color: rgba(188, 255, 217, 0.85);
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
  color: #9affc5;
}

.field-hint {
  margin: -2px 0 0;
  font-size: 0.88rem;
  color: rgba(188, 255, 217, 0.75);
}

.field input[type='text'],
.field input[type='number'],
.field select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid rgba(63, 255, 155, 0.35);
  border-radius: 0;
  background: rgba(2, 26, 12, 0.55);
  color: #d0ffe9;
  outline: none;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.field input::placeholder {
  color: rgba(188, 255, 217, 0.45);
}

.field input:focus,
.field select:focus {
  border-color: rgba(112, 255, 178, 0.9);
  background: rgba(5, 34, 18, 0.75);
}

.toggle-field {
  margin-top: 4px;
  padding: 16px 18px;
  border-radius: 0;
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(0, 18, 8, 0.4);
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
  background: rgba(2, 26, 12, 0.8);
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
  background: #d0ffe9;
  transition: transform 0.18s ease;
}

.toggle input:checked + .toggle-track {
  background: linear-gradient(135deg, #2de2b6, #5fff9d);
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
  border: 1px solid rgba(63, 255, 155, 0.35);
  border-radius: 0;
  background: rgba(0, 18, 8, 0.65);
  color: #7bffb5;
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
  border-color: rgba(112, 255, 178, 0.9);
  background: rgba(5, 34, 18, 0.85);
  box-shadow: 0 0 16px rgba(83, 255, 165, 0.4);
}

.actions .primary {
  background: linear-gradient(90deg, rgba(115, 255, 176, 0.95), rgba(62, 224, 135, 0.9));
  color: #031e0f;
  border-color: rgba(112, 255, 178, 0.9);
}

.actions .primary:hover,
.actions .primary:focus-visible {
  background: linear-gradient(90deg, rgba(145, 255, 194, 0.95), rgba(84, 235, 153, 0.92));
}

.actions .ghost {
  background: rgba(0, 18, 8, 0.35);
}

.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #46ff9f;
  border-style: solid;
  opacity: 0.8;
  z-index: 2;
}

.tl {
  top: 1rem;
  left: 1rem;
  border-width: 2px 0 0 2px;
}

.tr {
  top: 1rem;
  right: 1rem;
  border-width: 2px 2px 0 0;
}

.bl {
  bottom: 1rem;
  left: 1rem;
  border-width: 0 0 2px 2px;
}

.br {
  right: 1rem;
  bottom: 1rem;
  border-width: 0 2px 2px 0;
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
