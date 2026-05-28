import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { DEFAULT_WEAPON_ID, type WeaponId } from '../game/weapons.ts'

type Difficulty = 'facil' | 'medio' | 'dificil'
type Mode = 'solitario' | 'multijugador'

export interface GameSettings {
  playerName: string
  difficulty: Difficulty
  mode: Mode
  timeLimit: number
  sound: boolean
  musicVolume: number
}

export interface PlayerStats {
  level: number
  experience: number
  experienceToLevel: number
  health: number
  maxHealth: number
  damageMultiplier: number
  speedMultiplier: number
  kills: number
  score: number
  currentdashes: number
  maxdashes: number
  isAkimbo: boolean       
  akimboTimer: number
  playerSize: number
  unlockedWeapons: WeaponId[]
  weaponUnlockTokens: number
}

export interface ActiveBuff {
  type: 'speed' | 'damage'
  value: number
  remainingTime: number
}

const DEFAULT_SETTINGS: GameSettings = {
  playerName: '',
  difficulty: 'medio',
  mode: 'solitario',
  timeLimit: 60,
  sound: true,
  musicVolume: 0.05,
}

const DEFAULT_PLAYER_STATS: PlayerStats = {
  level: 1,
  experience: 0,
  experienceToLevel: 100,
  health: 100,
  maxHealth: 100,
  damageMultiplier: 1,
  speedMultiplier: 1,
  kills: 0,
  score: 0,
  currentdashes: 1,
  maxdashes: 1,
  isAkimbo: false,
  akimboTimer: 0,
  playerSize: 48,
  unlockedWeapons: [DEFAULT_WEAPON_ID],
  weaponUnlockTokens: 0,
}

export const useGameStore = defineStore('game', () => {
  const settings = ref<GameSettings>({ ...DEFAULT_SETTINGS })
  const playerStats = reactive<PlayerStats>({ ...DEFAULT_PLAYER_STATS })
  const activeBuffs = reactive<ActiveBuff[]>([])

  function setSettings(payload: Partial<GameSettings> | GameSettings) {
    settings.value = { ...settings.value, ...payload }
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    saveToLocal()
  }

  function resetPlayerStats() {
    Object.assign(playerStats, { ...DEFAULT_PLAYER_STATS })
    activeBuffs.length = 0
  }

  function addExperience(amount: number) {
    playerStats.experience += amount
    playerStats.score += amount

    while (playerStats.experience >= playerStats.experienceToLevel) {
      playerStats.experience -= playerStats.experienceToLevel
      levelUp()
    }
  }

  function levelUp() {
    playerStats.level += 1
    playerStats.playerSize += 3
    playerStats.experienceToLevel = Math.floor(playerStats.experienceToLevel * 1.15)

    if (playerStats.level % 5 === 0) {
      playerStats.weaponUnlockTokens += 1
    }
  }

  function takeDamage(amount: number) {
    playerStats.health = Math.max(0, playerStats.health - amount)
  }

  function heal(amount: number) {
    playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + amount)
  }

  function addBuff(buff: { type: 'speed' | 'damage'; value: number; duration: number }) {
    const activeBuff: ActiveBuff = {
      type: buff.type,
      value: buff.value,
      remainingTime: buff.duration,
    }
    activeBuffs.push(activeBuff)

    if (buff.type === 'speed') {
      playerStats.speedMultiplier = buff.value
    } else if (buff.type === 'damage') {
      playerStats.damageMultiplier = buff.value
    }
  }

  function updateBuffs(dt: number) {
    for (let i = activeBuffs.length - 1; i >= 0; i--) {
      const buff = activeBuffs[i]
      if (!buff) continue
      buff.remainingTime -= dt

      if (buff.remainingTime <= 0) {
        activeBuffs.splice(i, 1)
      }
    }
    
    if (playerStats.isAkimbo) {
      playerStats.akimboTimer -= dt
      if (playerStats.akimboTimer <= 0) {
        playerStats.isAkimbo = false
        playerStats.akimboTimer = 0
      }
    }

    // Recalculate multipliers based on active buffs
    playerStats.speedMultiplier = 1
    playerStats.damageMultiplier = 1

    for (const buff of activeBuffs) {
      if (buff.type === 'speed') {
        playerStats.speedMultiplier = buff.value
      } else if (buff.type === 'damage') {
        playerStats.damageMultiplier = buff.value
      }
    }
  }

  function incrementKills() {
    playerStats.kills += 1
  }

  function applyUpgrade(type: 'akimbo' | 'dash' | 'health_up') {
    if (type === 'health_up') {
      playerStats.maxHealth += 30
      playerStats.health = playerStats.maxHealth
    } else if (type === 'dash') {
      playerStats.maxdashes += 1
      playerStats.currentdashes = playerStats.maxdashes
    } else if (type === 'akimbo') {
      playerStats.isAkimbo = true
      playerStats.akimboTimer = 15
    }
  }

  function loadFromLocal() {
    try {
      const raw = localStorage.getItem('gameSettings')
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GameSettings> & {
          musicVolumeMode?: 'low' | 'high'
        }

        const legacyMusicVolume =
          parsed.musicVolumeMode === 'low' ? 0.25 : parsed.musicVolumeMode === 'high' ? 0.7 : undefined

        settings.value = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          musicVolume:
            typeof parsed.musicVolume === 'number'
              ? Math.min(1, Math.max(0, parsed.musicVolume))
              : legacyMusicVolume ?? DEFAULT_SETTINGS.musicVolume,
        }
      }
    } catch {
      // ignore
    }
  }

  function saveToLocal() {
    try {
      localStorage.setItem('gameSettings', JSON.stringify(settings.value))
    } catch {
      // ignore
    }
  }

  return {
    settings,
    playerStats,
    activeBuffs,
    setSettings,
    resetSettings,
    resetPlayerStats,
    addExperience,
    levelUp,
    takeDamage,
    heal,
    addBuff,
    updateBuffs,
    incrementKills,
    applyUpgrade,
    loadFromLocal,
    saveToLocal,
  }
})
