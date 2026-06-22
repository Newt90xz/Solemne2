var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require('mongoose');

const server = '127.0.0.1:3095';
const database = 'digitalvoiddb';

const conectarMongoDB = async () => {
  try {
    await mongoose.connect(`mongodb://${server}/${database}`).then(() => console.log("Conexión a MongoDB exitosa"));
  } catch (error) {
    console.log("Error al conectar a MongoDB:", error);
  }
};

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", required: true },
  maxscore: { type: Number, default: 0},
  loops: { type: Number, default: 0},
  keybindup: { type: String, default: 'w'},
  keybinddown: { type: String, default: 's'},
  keybindleft: { type: String, default: 'a'},
  keybindright: { type: String, default: 'd'},
  keybinddash: { type: String, default: 'contextmenu'}, //right-click
  keybindshoot: { type: String, default: 'click'}, 
  keybindweaponnext: { type: String, default: 'e'},
  keybindweaponback: { type: String, default: 'q'} 
})

var UsersModel = mongoose.model('Users', userSchema)

var usersRouter = require("./routes/users.js");
var adminRouter = require("./routes/admin.js");
var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", usersRouter);
app.use("/api/admin", adminRouter)

const PORT = 6139;
app.listen(PORT, () => {
  console.log(`Servidor de desarrollo escuchando en el puerto ${PORT}`);
});

conectarMongoDB();

module.exports = {
  app,
  UsersModel
};
