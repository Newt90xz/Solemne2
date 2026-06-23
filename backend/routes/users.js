var express = require('express');
var UsersModel = require('../models/User.js')
var router = express.Router();


// No authorization
router.post('/register', async function(req, res, next) {
  const {username, password, role} = req.body;
  const userRole = role || 'user';

  // check if username taken
  UsersModel.findOne({ username: username })
    .then(existing => {
      if (existing) return res.status(409).json({ usertaken: true });

      // create user
      UsersModel.insertOne({username: username, password: password, role: userRole}).then(user => {
        if (user) return res.status(200).json({usertaken: false})
      })
    }).catch(err => next(err));
});

router.post('/login', async function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/leaderboard', async function(req, res, next) {
  const data = await UsersModel.find().select('username maxscore loops').lean()
  const leaderboard = data.sort((a,b) => b.maxscore - a.maxscore)
  res.send(leaderboard)
});

// User autorized
router.get('/profile', async function(req, res, next) {
  res.send('respond with a resource');
});

// Update maxscore and loops after game over
router.put('/game/end', async function(req, res, next) {
  res.send('respond with a resource');
});

// update keybinds
router.put('/settings', async function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/logout', async function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
