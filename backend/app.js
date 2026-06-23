var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require('mongoose');
var { conectarMongoDB } = require('./db.js')
var cors = require('cors')


var usersRouter = require("./routes/users.js");
var adminRouter = require("./routes/admin.js");
var app = express();
app.use(logger("dev"));
app.use(cors({
  origin: "http://localhost:5173", // Vite default port for frontend
  credentials: true
}));
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

module.exports = app;
