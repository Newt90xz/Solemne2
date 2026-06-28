var express = require('express');
var router = express.Router();
var { UsersModel } = require('../models/User.js');
var authorize = require('../authchecker.js');

router.get('/users', authorize('admin'), async function (req, res, next) {
  try {
    const users = await UsersModel.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', authorize('admin'), async function (req, res, next) {
  try {
    const deleted = await UsersModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;