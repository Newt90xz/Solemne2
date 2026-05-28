export type WeaponId =
  | 'Disparo_Memoria'
  | 'ransomware'
  | 'gusano'
  | 'tormenta_anuncios'
  | 'virus_troyano'

export interface WeaponDefinition {
  id: WeaponId
  name: string
  alias: string
  role: string
  image: string
  fireRate: number
  damage: number
  projectileSpeed: number
  projectileLifetime: number
  projectileSize: number
  projectileColor: string
  pellets: number
  spreadDeg: number
  piercing?: boolean
  orbiting?: boolean
  explosive?: boolean
}

import arma1 from '../assets/weaponicons/Mem.png'
import arma2 from '../assets/weaponicons/Ham.png'
import arma3 from '../assets/weaponicons/Gus.png'
import arma4 from '../assets/weaponicons/Orb.png'
import arma5 from '../assets/weaponicons/Troy.png'


export const DEFAULT_WEAPON_ID: WeaponId = 'Disparo_Memoria'

export const WEAPON_ORDER: WeaponId[] = [
  'Disparo_Memoria',
  'ransomware',
  'gusano',
  'tormenta_anuncios',
  'virus_troyano',
]

export const WEAPON_CATALOG: Record<WeaponId, WeaponDefinition> = {
  Disparo_Memoria: {
    id: 'Disparo_Memoria',
    name: 'Memoria Corrupta',
    alias: 'La Carga Defectuosa',
    role: 'Arma basica de dano directo',
    image: arma1,
    fireRate: 5,
    damage: 14,
    projectileSpeed: 750,
    projectileLifetime: 1.1,
    projectileSize: 28,
    projectileColor: '#ff0303',
    pellets: 1,
    spreadDeg: 0,
  },
  ransomware: {
    id: 'ransomware',
    name: 'Ransomware',
    alias: 'El Cripto-Martillo',
    role: 'Arma pesada con perforacion de enemigos',
    image: arma2,
    fireRate: 1,
    damage: 28,
    projectileSpeed: 580,
    projectileLifetime: 1.2,
    projectileSize: 35,
    projectileColor: '#ef476f',
    pellets: 1,
    spreadDeg: 0,
    piercing: true,
  },
  gusano: {
    id: 'gusano',
    name: 'Gusano',
    alias: 'El Nanobot Contagioso',
    role: 'Arma de area y propagacion',
    image: arma3,
    fireRate: 2.4,
    damage: 11,
    projectileSpeed: 720,
    projectileLifetime: 1.05,
    projectileSize: 20,
    projectileColor: '#80ed99',
    pellets: 4,
    spreadDeg: 24,
  },
  tormenta_anuncios: {
    id: 'tormenta_anuncios',
    name: 'Tormenta de Popups',
    alias: 'El Spam Orbital',
    role: 'Balas que orbitan el cursor antes de liberarse',
    image: arma4,
    fireRate: 3,
    damage: 8,
    projectileSpeed: 600,
    projectileLifetime: 6.5,
    projectileSize: 25,
    projectileColor: '#ff6b35',
    pellets: 1,
    spreadDeg: 0,
    orbiting: true,
  },
  virus_troyano: {
    id: 'virus_troyano',
    name: 'Virus Troayno',
    alias: 'Amenaza inminente',
    role: 'Balas lentas que explotan al detenerse',
    image: arma5,
    fireRate: 2,
    damage: 8,
    projectileSpeed: 420,
    projectileLifetime: 3.5,
    projectileSize: 40,
    projectileColor: '#a8dadc',
    pellets: 1,
    spreadDeg: 0,
    explosive: true,
  },
}