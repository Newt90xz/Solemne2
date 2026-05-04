import { defineStore } from 'pinia'
import { ref } from 'vue'

type Difficulty = 'facil' | 'medio' | 'dificil'
type Mode = 'solitario' | 'multijugador'

export interface GameSettings {
  playerName: string
  difficulty: Difficulty
  mode: Mode
  timeLimit: number
  sound: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  playerName: '',
  difficulty: 'medio',
  mode: 'solitario',
  timeLimit: 60,
  sound: true,
}

export const useGameStore = defineStore('game', () => {
  const settings = ref<GameSettings>({ ...DEFAULT_SETTINGS })

  function setSettings(payload: Partial<GameSettings> | GameSettings) {
    settings.value = { ...settings.value, ...payload }
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    saveToLocal()
  }

  function loadFromLocal() {
    try {
      const raw = localStorage.getItem('gameSettings')
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GameSettings>
        settings.value = { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (e) {
      // ignore
    }
  }

  function saveToLocal() {
    try {
      localStorage.setItem('gameSettings', JSON.stringify(settings.value))
    } catch (e) {
      // ignore
    }
  }

  return { settings, setSettings, resetSettings, loadFromLocal, saveToLocal }
})
