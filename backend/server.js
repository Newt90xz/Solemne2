var http = require("http");
var cookie = require("cookie");
var jwt = require("jsonwebtoken");
var { Server } = require("socket.io");
var app = require("./app.js");

const PORT = 6139;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.use((socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return next(new Error("No autenticado"));
  }

  try {
    const decoded = jwt.verify(token, "pan-con-queso");
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});

io.on("connection", (socket) => {
  console.log(`${socket.user.username} conectado (socket ${socket.id})`);

  socket.on("disconnect", () => {
    console.log(`${socket.user.username} desconectado`);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor de desarrollo escuchando en el puerto ${PORT}`);
});

module.exports = { server, io };