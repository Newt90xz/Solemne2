<template>
  <section class="configuracion">
    <h2>Configuración del juego</h2>

    <form @submit.prevent="apply">
      <div class="field">
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

      <div class="field">
        <label for="sound">Sonido</label>
        <input id="sound" type="checkbox" v-model="settings.sound" />
      </div>

      <div class="actions">
        <button type="submit">Guardar</button>
        <button type="button" @click="reset">Restablecer</button>
        <button type="button" @click="goBack">Volver</button>
      </div>
    </form>
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
.configuracion {
  max-width: 520px;
  padding: 16px;
}
.field {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.field label {
  font-weight: 600;
  margin-bottom: 6px;
}
.field input[type='text'],
.field input[type='number'],
.field select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.actions button {
  padding: 8px 12px;
}
</style>
