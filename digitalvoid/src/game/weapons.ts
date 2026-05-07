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
    fireRate: 3,
    damage: 16,
    projectileSpeed: 600,
    projectileLifetime: 6.5,
    projectileSize: 9,
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