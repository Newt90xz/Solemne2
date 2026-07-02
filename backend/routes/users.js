var express = require("express");
var { UsersModel, LeaderboardModel, LobbyModel } = require("../models/User.js");
var router = express.Router();
var jwt = require("jsonwebtoken");
var authorize = require("../authchecker.js");
var bcrypt = require('bcrypt')

// No authorization
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, role } = req.body;
    const userRole = role || "user";

    const existing = await UsersModel.findOne({ username: username });

    //si existe, no se registra el usuario, si no encuentra, lo crea y devuelve 
    if (existing) {
      return res.json({ registered: false });
    } else {  
      // 10-12 rondas de sal esta bien.
      const encrypted = await  bcrypt.hash(password , 10 )  
      const user = await UsersModel.create([{
        username: username,
        password: encrypted,
        role: userRole,
      }],{lean: true});
      if (user) {
      return res.json({ registered: true})
      }
    }
  } catch (error) {
    return res.json({ message: error });
  }
});

router.post("/login", async function (req, res) {
  // Agarrar el usuario de cookies si existe, sino agarrar de req.body.
  const {username, password } = req.body

  const exists = await UsersModel.findOne({ username: username})

  // Crear cookie si no existe y si es usuario.
  if (exists){
    const isTheSame = await bcrypt.compare(password,exists.password)
    if (!isTheSame){
      return res.status(401).json({ loggedIn: false, message: "Usuario o Contraseña Incorrectas"})
    }
  } else{
    return res.status(401).json({ loggedIn: false, message: "Usuario o Contraseña Incorrectas"})
  }

  const token = jwt.sign(
    { id: exists._id, username: exists.username, role: exists.role },
    "pan-con-queso",
    { expiresIn: "2h"}
  )
  if (exists.role === "user") {
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    })
  } else {
    response.token = token
  }
  res.json({loggedIn: true, username: exists.username, role: exists.role})
});


router.get("/leaderboard/global", async function (req, res, next) {
  try {
    const data = await LeaderboardModel.find()
      .select("username score loops")
      .sort({ score: -1 }) //intrepetacion de mongo para descendente
      .limit(50)
      .lean();

    res.json(data);
  } catch (err) {
    next(err);
  }
});


// User autorized
router.get("/leaderboard/me", authorize(), async function (req, res, next) {
  try {
    const data = await LeaderboardModel.find({ username: req.user.username })
      .select({ username: 1, score: 1, loops: 1, _id: 0 })
      .sort({ score: -1 })
      .lean();

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/profile", authorize(), async function (req, res, next) {
  const user = await UsersModel.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ loggedIn: false });

  res.json({
    loggedIn: true,
    username: req.user.username,
    role: req.user.role,
    controls: {
      moveUp: user.keybindup,
      moveDown: user.keybinddown,
      moveLeft: user.keybindleft,
      moveRight: user.keybindright,
      interact: user.keybindinteract,
      pause: user.keybindpause,
      weaponPrev: user.keybindweaponback,
      weaponNext: user.keybindweaponnext,
    },
  });
});

// Posts score and loops of the user after game over
router.post("/game/end", authorize(), async function (req, res, next) {
  try {
    const { score, loops } = req.body;
    const username = req.user.username;

    await LeaderboardModel.create({ username, score, loops });

    res.status(200).json({ message: "Puntaje publicado" });
  } catch (err) {
    next(err);
  }
});

// update keybinds
router.put("/settings", authorize(), async function (req, res, next) {
  try {
    const { controls } = req.body;
    if (!controls) return res.status(400).json({ message: "Faltan los controles" });

    await UsersModel.findByIdAndUpdate(req.user.id, {
      keybindup: controls.moveUp,
      keybinddown: controls.moveDown,
      keybindleft: controls.moveLeft,
      keybindright: controls.moveRight,
      keybindinteract: controls.interact,
      keybindpause: controls.pause,
      keybindweaponback: controls.weaponPrev,
      keybindweaponnext: controls.weaponNext,
    });

    res.json({ message: "Controles actualizados" });
  } catch (err) {
    next(err);
  }
});


router.post("/logout", async function (req, res, next) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })
  res.json({ loggedIn: false })
})

// Lobbies: la lista de salas abiertas vive en memoria (activeLobbies).
router.get("/lobbies", function (req, res) {
  const { activeLobbies } = req.app.locals;
  res.json(activeLobbies ? Array.from(activeLobbies.values()) : []);
});

module.exports = router;
