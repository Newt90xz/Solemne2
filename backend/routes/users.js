var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Default post. */
router.post('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Default put */
router.put('/', function(req, res, next) {
  res.send('respond with a resource');
});
module.exports = router;
