const jwt = require('jsonwebtoken');

const authorize = (roles) =>
  function (req, res, next) {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
      return res.status(403).send("Se necesita un token");
    }
    try {
      const decoded = jwt.verify(token, 'your-super-secret');
      return next(); // token válido, dejar pasar
    } catch (err) {
      return res.status(401).send("Token invalido");
    }
  };

module.exports = authorize;