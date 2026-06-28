var express = require("express");
var { UsersModel, LeaderboardModel } = require("../models/User.js");
var router = express.Router();
var jwt = require("jsonwebtoken");
var authorize = require("../authchecker.js");

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
      const user = await UsersModel.create([{
        username: username,
        password: password,
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
  const exists = await UsersModel.findOne({ username: username, password: password})
  // Crear cookie si no existe.
  if (!exists){
    return res.status(401).json({ loggedIn: false, message: "Usuario o Contraseña Incorrectas"})
  }

  const token = jwt.sign(
    { id: exists._id, username: exists.username, role: exists.role },
    "pan-con-queso",
    { expiresIn: "2h"}
  )
  if (exists.role == "user"){
    res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    samesite: "lax",
    maxAge: 2 * 60 * 60 * 1000
  })
  }
  
  res.json({loggedIn: true, username: exists.username, role: exists.role})
});

router.get("/leaderboard", async function (req, res, next) {
  const data = await LeaderboardModel.find()
    .select("username maxscore loops")
    .lean();
  const leaderboard = data.sort((a, b) => b.maxscore - a.maxscore);
  res.send(leaderboard);
});

// User autorized
router.get("/profile", authorize(), async function (req, res, next) {
  
  res.json({
    loggedIn: true,
    username: req.user.username,
    role: req.user.role
  });
});

// Posts maxscore and loops of the user after game over
router.post("/game/end", authorize(),async function (req, res, next) {
  const { username, maxscore, loops } = req.body;
  await LeaderboardModel.insertOne({
    username: username,
    maxscore: maxscore,
    loops: loops,
  })
    .then(res.status(200).json({ message: "Puntaje Publicado" }))
    .catch((err) => next(err));
});

// update keybinds
router.put("/settings",authorize(), async function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/logout", async function (req, res, next) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })
  res.json({ loggedIn: false })
})

module.exports = router;
