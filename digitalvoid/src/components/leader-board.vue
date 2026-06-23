<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(true)
const error = ref<string | null>(null)
const entries = ref<Array<{ username: string; maxscore: number; loops: number; _id: string }>>([])

async function loadLeaderboard() {
  loading.value = true
  error.value = null

  try {
    // Devuelve array de objetos { username, maxscore }
    const response = await axios.get('http://localhost:6139/api/leaderboard')
    entries.value = response.data || []
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo cargar el leaderboard.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadLeaderboard()
})

const emit = defineEmits<{
  (e: 'go-back'): void
}>()

function handleBack() {
  emit('go-back')
}
</script>

<template>
  <div class="leaderboard-screen">
    <div class="hud-top">
      <h1>LEADERBOARD</h1>
      <p>Las mejores puntuaciones del sistema</p>
    </div>

    <div class="leaderboard-panel">
      <div v-if="loading" class="leaderboard-state">Cargando puntuaciones...</div>
      <div v-else-if="error" class="leaderboard-state error">{{ error }}</div>
      <table v-else class="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>USUARIO</th>
            <th>PUNTUACIÓN</th>
            <th>BUCLES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in entries" :key="entry.username + '-' + index">
            <td>{{ index + 1 }}</td>
            <td>{{ entry.username }}</td>
            <td>{{ entry.maxscore }}</td>
            <td>{{entry.loops}}</td>
          </tr>
          <tr v-if="entries.length === 0 && !error">
            <td colspan="3">No hay datos disponibles.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="leaderboard-actions">
      <button type="button" @click="handleBack">Regresar</button>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-screen {
  min-height: 100vh;
  padding: 3rem 2rem;
  color: #33ff99;
  background: radial-gradient(circle at top, rgba(0, 255, 156, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.96), #000000 90%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hud-top {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hud-top h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 4rem);
  letter-spacing: 0.35rem;
}

.hud-top p {
  margin: 0;
  color: #a8ffcc;
}

.leaderboard-panel {
  flex: 1;
  overflow: auto;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(51, 255, 153, 0.25);
  border-radius: 1rem;
  padding: 1rem;
}

.leaderboard-state {
  font-size: 1rem;
  color: #ffffff;
  padding: 2rem;
  text-align: center;
}

.leaderboard-state.error {
  color: #ff6b6b;
}

.leaderboard-table {
  width: 100%;
  min-width: 320px;
  border-collapse: collapse;
}

.leaderboard-table th,
.leaderboard-table td {
  padding: 0.95rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(51, 255, 153, 0.12);
}

.leaderboard-table th {
  text-transform: uppercase;
  color: #c8ffe6;
  font-size: 0.95rem;
}

.leaderboard-table tr:nth-child(odd) {
  background: rgba(51, 255, 153, 0.04);
}

.leaderboard-table td {
  font-size: 0.95rem;
}

.leaderboard-actions {
  display: flex;
  justify-content: center;
}

.leaderboard-actions button {
  border: 1px solid #33ff99;
  background: transparent;
  color: #33ff99;
  padding: 0.9rem 1.4rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

.leaderboard-actions button:hover {
  background: rgba(51, 255, 153, 0.12);
}

.leaderboard-note {
  color: #9df3c4;
  font-size: 0.92rem;
  text-align: center;
}
</style>
