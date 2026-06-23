var express = require('express');
var router = express.Router();


// Admin authorization
router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});

router.delete('/users/:id', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
