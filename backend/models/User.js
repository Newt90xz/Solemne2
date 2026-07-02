const { mongoose } = require('../db');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', required: true },
  keybindup: { type: String, default: 'KeyW' },
  keybinddown: { type: String, default: 'KeyS' },
  keybindleft: { type: String, default: 'KeyA' },
  keybindright: { type: String, default: 'KeyD' },
  keybindinteract: { type: String, default: 'KeyF' },
  keybindpause: { type: String, default: 'Escape' },   
  keybinddash: { type: String, default: 'contextmenu' },
  keybindshoot: { type: String, default: 'click' },
  keybindweaponnext: { type: String, default: 'KeyE' },
  keybindweaponback: { type: String, default: 'KeyQ' },
});

const LeaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  loops: { type: Number, default: 0 }
});

const LobbySchema = new mongoose.Schema({
  name: { type: String, required: true },
  hostUsername: { type: String, required: true },
  players: { type: [String], default: [] },
  maxPlayers: { type: Number, default: 4 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const LeaderboardModel = mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);
const UsersModel = mongoose.models.Users || mongoose.model('Users', userSchema);
const LobbyModel = mongoose.models.Lobby || mongoose.model('Lobby', LobbySchema);

module.exports = { UsersModel, LeaderboardModel, LobbyModel };
