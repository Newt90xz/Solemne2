const { mongoose } = require('../db');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', required: true },
  keybindup: { type: String, default: 'w' },
  keybinddown: { type: String, default: 's' },
  keybindleft: { type: String, default: 'a' },
  keybindright: { type: String, default: 'd' },
  keybinddash: { type: String, default: 'contextmenu' },
  keybindshoot: { type: String, default: 'click' },
  keybindweaponnext: { type: String, default: 'e' },
  keybindweaponback: { type: String, default: 'q' },
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
