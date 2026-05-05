export type WeaponId =
  | 'virus_accion_directa'
  | 'ransomware'
  | 'troyano'
  | 'gusano'
  | 'spyware'
  | 'ddos'

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
}

export const DEFAULT_WEAPON_ID: WeaponId = 'virus_accion_directa'

export const WEAPON_ORDER: WeaponId[] = [
  'virus_accion_directa',
  'ransomware',
  'troyano',
  'gusano',
  'spyware',
  'ddos',
]

export const WEAPON_CATALOG: Record<WeaponId, WeaponDefinition> = {
  virus_accion_directa: {
    id: 'virus_accion_directa',
    name: 'Virus de Accion Directa',
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
    role: 'Arma pesada y de bloqueo',
    fireRate: 1.6,
    damage: 48,
    projectileSpeed: 580,
    projectileLifetime: 1.2,
    projectileSize: 10,
    projectileColor: '#ef476f',
    pellets: 1,
    spreadDeg: 0,
  },
  troyano: {
    id: 'troyano',
    name: 'Troyano',
    alias: 'El Caballo de Troya',
    role: 'Arma de sigilo y engano',
    fireRate: 4.5,
    damage: 18,
    projectileSpeed: 980,
    projectileLifetime: 0.95,
    projectileSize: 5,
    projectileColor: '#90e0ef',
    pellets: 1,
    spreadDeg: 0,
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
  spyware: {
    id: 'spyware',
    name: 'Spyware/Keylogger',
    alias: 'El Ojo Digital',
    role: 'Arma de apoyo e informacion',
    fireRate: 6,
    damage: 8,
    projectileSpeed: 930,
    projectileLifetime: 1,
    projectileSize: 4,
    projectileColor: '#cdb4db',
    pellets: 1,
    spreadDeg: 0,
  },
  ddos: {
    id: 'ddos',
    name: 'DDoS',
    alias: 'La Tormenta de Paquetes',
    role: 'Arma de area y caos',
    fireRate: 3,
    damage: 9,
    projectileSpeed: 760,
    projectileLifetime: 0.9,
    projectileSize: 4,
    projectileColor: '#f4a261',
    pellets: 7,
    spreadDeg: 34,
  },
}
