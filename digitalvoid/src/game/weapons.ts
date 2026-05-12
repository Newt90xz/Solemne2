export type WeaponId =
  | 'virus_troyano'
  | 'ransomware'
  | 'gusano'
  | 'tormenta_anuncios'
  | 'exploit_sivo'

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

import arma1 from '../assets/Arma_1.png'
import arma2 from '../assets/Arma_2.png'
import arma3 from '../assets/Arma_3.png'
import arma4 from '../assets/Arma_4.png'
import arma5 from '../assets/Arma_5.png'

export const DEFAULT_WEAPON_ID: WeaponId = 'virus_troyano'

export const WEAPON_ORDER: WeaponId[] = [
  'virus_troyano',
  'ransomware',
  'gusano',
  'tormenta_anuncios',
  'exploit_sivo',
]

export const WEAPON_CATALOG: Record<WeaponId, WeaponDefinition> = {
  virus_troyano: {
    id: 'virus_troyano',
    name: 'Virus Troyano',
    alias: 'La Carga Explosiva',
    role: 'Arma basica de dano directo',
    image: arma1,
    fireRate: 5,
    damage: 14,
    projectileSpeed: 860,
    projectileLifetime: 1.1,
    projectileSize: 6,
    projectileColor: '#ffb703',
    pellets: 1,
    spreadDeg: 0,
  },
  ransomware: {
    id: 'ransomware',
    name: 'Ransomware',
    alias: 'El Cripto-Martillo',
    role: 'Arma pesada con perforacion de enemigos',
    image: arma2,
    fireRate: 1.6,
    damage: 48,
    projectileSpeed: 580,
    projectileLifetime: 1.2,
    projectileSize: 10,
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
    projectileSize: 6,
    projectileColor: '#80ed99',
    pellets: 4,
    spreadDeg: 24,
  },
  tormenta_anuncios: {
    id: 'tormenta_anuncios',
    name: 'Tormenta de Anuncios',
    alias: 'El Spam Orbital',
    role: 'Balas que orbitan el cursor antes de liberarse',
    image: arma4,
    fireRate: 3,
    damage: 16,
    projectileSpeed: 600,
    projectileLifetime: 6.5,
    projectileSize: 20,
    projectileColor: '#ff6b35',
    pellets: 1,
    spreadDeg: 0,
    orbiting: true,
  },
  exploit_sivo: {
    id: 'exploit_sivo',
    name: 'Exploit-sivo',
    alias: 'El Zero-Day',
    role: 'Balas lentas que explotan al detenerse',
    image: arma5,
    fireRate: 4,
    damage: 8,
    projectileSpeed: 420,
    projectileLifetime: 3.5,
    projectileSize: 7,
    projectileColor: '#a8dadc',
    pellets: 1,
    spreadDeg: 0,
    explosive: true,
  },
}