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

var usersRouter = require("./routes/users.js");
var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", usersRouter);

const PORT = 6139;
app.listen(PORT, () => {
  console.log(`Servidor de desarrollo escuchando en el puerto ${PORT}`);
});

conectarMongoDB();

module.exports = app;
