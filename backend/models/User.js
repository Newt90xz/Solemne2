const { mongoose } = require('../db');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', required: true },
  maxscore: { type: Number, default: 0 },
  loops: { type: Number, default: 0 },
  keybindup: { type: String, default: 'w' },
  keybinddown: { type: String, default: 's' },
  keybindleft: { type: String, default: 'a' },
  keybindright: { type: String, default: 'd' },
  keybinddash: { type: String, default: 'contextmenu' },
  keybindshoot: { type: String, default: 'click' },
  keybindweaponnext: { type: String, default: 'e' },
  keybindweaponback: { type: String, default: 'q' },
});

const UsersModel = mongoose.models.Users || mongoose.model('Users', userSchema);

module.exports = UsersModel;
