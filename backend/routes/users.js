var express = require('express');
var { UsersModel } = require('../app.js')
var router = express.Router();


// No authorization
router.post('/register', function(req, res, next) {

  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/leaderboard', function(req, res, next) {
  res.send('respond with a resource');
});

// User autorized
router.get('/profile', function(req, res, next) {
  res.send('respond with a resource');
});

// Update maxscore and loops after game over
router.put('/game/end', function(req, res, next) {
  res.send('respond with a resource');
});

// update keybinds
router.put('/settings', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/logout', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
