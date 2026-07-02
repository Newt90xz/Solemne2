var http = require("http");
var jwt = require("jsonwebtoken");
var { Server } = require("socket.io");
var app = require("./app.js");
var { LobbyModel } = require("./models/User.js");

const PORT = process.env.PORT || 6139;
const server = http.createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// In-memory store for active lobbies
const activeLobbies = new Map();

// Make io and activeLobbies available to app
app.locals.io = io;
app.locals.activeLobbies = activeLobbies;

function lobbyList() {
  return Array.from(activeLobbies.values());
}
function broadcastList() {
  io.emit("lobby:update", lobbyList());
}
async function closeLobby(lobbyId) {
  if (!activeLobbies.has(lobbyId)) return;
  activeLobbies.delete(lobbyId);
  io.to(lobbyId).emit("lobby:closed", lobbyId);
  try {
    await LobbyModel.findByIdAndUpdate(lobbyId, { isActive: false, players: [] });
  } catch {}
  broadcastList();
}

setTimeout(() => {
  LobbyModel.updateMany({ isActive: true }, { isActive: false }).catch(() => {});
}, 1500);

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const key = part.slice(0, i).trim();
    if (key) out[key] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

io.use((socket, next) => {
  const cookies = parseCookies(socket.handshake.headers.cookie || "");
  const token = cookies.token;
  if (!token) return next(new Error("No autenticado"));
  try {
    socket.user = jwt.verify(token, "pan-con-queso");
    next();
  } catch {
    next(new Error("Token inválido"));
  }
});

io.on("connection", (socket) => {
  const username = socket.user.username;
  console.log(`${username} conectado (socket ${socket.id})`);
  socket.data.lobbyId = null;

  async function leaveCurrent() {
    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;
    socket.leave(lobbyId);
    socket.data.lobbyId = null;
    const data = activeLobbies.get(lobbyId);
    if (!data) return;
    data.players = data.players.filter((p) => p !== username);
    if (data.host === username) {
      const nextHost = data.players[0];
      if (!nextHost) {
        await closeLobby(lobbyId);
        return;
      }
      data.host = nextHost;
      try {
        await LobbyModel.findByIdAndUpdate(lobbyId, {
          hostUsername: nextHost,
          players: data.players,
        });
      } catch {}
      io.to(lobbyId).emit("lobby:hostChanged", nextHost);
      broadcastList();
    } else {
      try {
        await LobbyModel.findByIdAndUpdate(lobbyId, { players: data.players });
      } catch {}
      io.to(lobbyId).emit("lobby:peerLeft", username);
      broadcastList();
    }
  }


  socket.on("lobby:open", async ({ name, maxPlayers = 2 } = {}) => {
    try {
      await leaveCurrent();
      for (const [id, data] of activeLobbies.entries()) {
        if (data.host === username) await closeLobby(id);
      }
      const doc = await LobbyModel.create({
        name: name || `Inyección de ${username}`,
        hostUsername: username,
        players: [username],
        maxPlayers: Math.min(Math.max(2, maxPlayers), 2),
        isActive: true,
      });
      const lobbyId = doc._id.toString();
      const data = {
        id: lobbyId,
        name: doc.name,
        host: username,
        players: [username],
        maxPlayers: doc.maxPlayers,
        isActive: true,
      };
      activeLobbies.set(lobbyId, data);
      socket.join(lobbyId);
      socket.data.lobbyId = lobbyId;
      socket.emit("lobby:opened", data);
      broadcastList();
    } catch (err) {
      console.error("lobby:open", err);
      socket.emit("lobby:error", "No se pudo abrir la sala");
    }
  });

  // Ver al jugador en cooperativo. Devuelve las coordenadas.
  socket.on("coop:state", (payload) => {
  if (!socket.data.lobbyId) return;
  socket.to(socket.data.lobbyId).emit("coop:state", { user: username, ...payload });
  });

  // Ver los disparos
  socket.on("coop:fire", (shots) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:fire", shots);
  });

  //Building y Obstaculos
  socket.on("coop:snapshot", (payload) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:snapshot", payload);
  });

  // Ver enemigos
  socket.on("coop:enemies", (list) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:enemies", list);
  });

  // Registrar daño de disparos en ambos lados
  socket.on("coop:hit", (payload) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:hit", payload);
  });

  // Registra daño recibido
  socket.on("coop:damage", (payload) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:damage", payload);
  });

  // Disparo de enemigos al guest y host
  socket.on("coop:efire", (payload) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:efire", payload);
  });

  socket.on("coop:escapepoint", (payload) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:escapepoint", payload);
  });
  socket.on("coop:loop", () => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:loop");
  });
  socket.on("coop:kills", (n) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:kills", n);
  });
  socket.on("coop:score", (payload) => {
    if (!socket.data.lobbyId) return;
    socket.to(socket.data.lobbyId).emit("coop:score", payload);
  });
  
  socket.on("lobby:join", async (lobbyId) => {
    const data = activeLobbies.get(lobbyId);
    if (!data || !data.isActive) return socket.emit("lobby:error", "Sala no disponible");
    if (data.players.length >= data.maxPlayers && !data.players.includes(username))
      return socket.emit("lobby:error", "Sala llena");

    await leaveCurrent();
    socket.join(lobbyId);
    socket.data.lobbyId = lobbyId;
    if (!data.players.includes(username)) {
      data.players.push(username);
      try {
        await LobbyModel.findByIdAndUpdate(lobbyId, { players: data.players });
      } catch {}
    }
    socket.emit("lobby:joined", data); 
    socket.to(lobbyId).emit("lobby:peerJoined", username); 
    broadcastList();
  });

  socket.on("lobby:leave", leaveCurrent);

  socket.on("disconnect", async () => {
    console.log(`${username} desconectado`);
    await leaveCurrent();
  });
});

// Expose activeLobbies for other modules
module.exports = { server, io, activeLobbies };

server.listen(PORT, () => {
  console.log(`Servidor de desarrollo escuchando en el puerto ${PORT}`);
});