var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require('mongoose');
var { conectarMongoDB } = require('./db.js')
var cors = require('cors')

//Toma los urls para cors del ENV en Docker o el local.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:4173").split(",").map((o) => o.trim()).filter(Boolean);

var usersRouter = require("./routes/users.js");
var adminRouter = require("./routes/admin.js");
var app = express();
app.use(logger("dev"));
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", usersRouter);
app.use("/api/admin", adminRouter)

conectarMongoDB();

module.exports = app;