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

// In-memory store for active lobbies
const activeLobbies = new Map();

// Make io and activeLobbies available to app
app.locals.io = io;
app.locals.activeLobbies = activeLobbies;

// Create default public lobby on server start
const createDefaultLobby = async () => {
  const { LobbyModel } = require("./models/User.js");
  // Check if default lobby already exists in DB or activeLobbies
  let defaultLobby = null;
  for (const [, data] of activeLobbies.entries()) {
    if (data.name === 'Lobby Público' && data.host === 'Sistema') {
      defaultLobby = data;
      // Reset players for a fresh start
      defaultLobby.players = [];
      break;
    }
  }
  if (!defaultLobby) {
    const dbLobby = await LobbyModel.findOne({ name: 'Lobby Público', hostUsername: 'Sistema', isActive: true });
    if (dbLobby) {
      // Update the database to have no players for fresh start
      await LobbyModel.findByIdAndUpdate(dbLobby._id, { players: [] });
      defaultLobby = {
        id: dbLobby._id.toString(),
        name: dbLobby.name,
        host: dbLobby.hostUsername,
        players: [], // Fresh players list
        maxPlayers: dbLobby.maxPlayers,
        isActive: true,
      };
    } else {
      // Create new default lobby
      const newLobby = await LobbyModel.create({
        name: 'Lobby Público',
        hostUsername: 'Sistema',
        players: [],
        maxPlayers: 2,
        isActive: true,
      });
      defaultLobby = {
        id: newLobby._id.toString(),
        name: newLobby.name,
        host: newLobby.hostUsername,
        players: [],
        maxPlayers: newLobby.maxPlayers,
        isActive: true,
      };
    }
    // Add to activeLobbies
    activeLobbies.set(defaultLobby.id, defaultLobby);
  }
  console.log('Default lobby created/loaded:', defaultLobby.id);
};

// Wait for MongoDB connection and create default lobby
setTimeout(() => {
  createDefaultLobby();
}, 2000);

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

  // Join a lobby
  socket.on("lobby:join", async (lobbyId) => {
    try {
      const { LobbyModel } = require("./models/User.js");
      const lobby = await LobbyModel.findById(lobbyId);

      if (!lobby || !lobby.isActive) {
        socket.emit("lobby:error", "Lobby no encontrada");
        return;
      }

      // Leave any previous lobby
      for (const [id, data] of activeLobbies.entries()) {
        if (data.players.includes(socket.user.username)) {
          socket.leave(id);
          data.players = data.players.filter((p) => p !== socket.user.username);
          // If host leaves and no players left, mark lobby as inactive
          if (data.host === socket.user.username || data.players.length === 0) {
            await LobbyModel.findByIdAndUpdate(id, { isActive: false, players: data.players });
            activeLobbies.delete(id);
            io.emit("lobby:update", Array.from(activeLobbies.values()));
          } else {
            await LobbyModel.findByIdAndUpdate(id, { players: data.players });
            io.to(id).emit("lobby:playerLeft", socket.user.username);
            io.emit("lobby:update", Array.from(activeLobbies.values()));
          }
        }
      }

      socket.join(lobbyId);

      // Add to active lobbies
      if (!activeLobbies.has(lobbyId)) {
        activeLobbies.set(lobbyId, {
          id: lobbyId,
          name: lobby.name,
          host: lobby.hostUsername,
          players: [socket.user.username],
          maxPlayers: lobby.maxPlayers,
          isActive: true,
        });
        await LobbyModel.findByIdAndUpdate(lobbyId, { players: [socket.user.username] });
      } else {
        const lobbyData = activeLobbies.get(lobbyId);
        if (lobbyData.players.length >= lobbyData.maxPlayers) {
          socket.emit("lobby:error", "Lobby llena");
          return;
        }
        if (!lobbyData.players.includes(socket.user.username)) {
          lobbyData.players.push(socket.user.username);
          await LobbyModel.findByIdAndUpdate(lobbyId, { players: lobbyData.players });
        }
      }

      const currentLobby = activeLobbies.get(lobbyId);
      io.to(lobbyId).emit("lobby:update", currentLobby);
      io.emit("lobby:update", Array.from(activeLobbies.values()));

      // Check if lobby is full to start game
      if (currentLobby.players.length === currentLobby.maxPlayers) {
        setTimeout(() => {
          io.to(lobbyId).emit("lobby:startGame", currentLobby);
        }, 1000);
      }
    } catch (err) {
      console.error("Error joining lobby:", err);
      socket.emit("lobby:error", "Error al unirse a la lobby");
    }
  });

  socket.on("disconnect", async () => {
    console.log(`${socket.user.username} desconectado`);
    for (const [id, data] of activeLobbies.entries()) {
      if (data.players.includes(socket.user.username)) {
        socket.leave(id);
        data.players = data.players.filter((p) => p !== socket.user.username);
        const { LobbyModel } = require("./models/User.js");
        if (data.host === socket.user.username || data.players.length === 0) {
          await LobbyModel.findByIdAndUpdate(id, { isActive: false, players: data.players });
          activeLobbies.delete(id);
        } else {
          await LobbyModel.findByIdAndUpdate(id, { players: data.players });
          io.to(id).emit("lobby:playerLeft", socket.user.username);
        }
        io.emit("lobby:update", Array.from(activeLobbies.values()));
      }
    }
  });
});

// Expose activeLobbies for other modules
module.exports = { server, io, activeLobbies };

server.listen(PORT, () => {
  console.log(`Servidor de desarrollo escuchando en el puerto ${PORT}`);
});