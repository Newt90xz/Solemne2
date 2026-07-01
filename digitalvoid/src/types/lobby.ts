export interface Lobby {
  id: string
  _id?: string
  name: string
  host: string
  hostUsername?: string
  players: string[]
  maxPlayers: number
  isActive: boolean
}
