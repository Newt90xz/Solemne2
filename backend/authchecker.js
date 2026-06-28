const jwt = require('jsonwebtoken');

const authorize = (roles) =>
  function (req, res, next) {
    res.set("Cache-Control", "no-store");

     const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = req.cookies.token || bearerToken;
    
    if (!token) {
      return res.status(401).send("No autenticado");
    }
    try {
      const decoded = jwt.verify(token, 'pan-con-queso');
      
      if (roles && decoded.role !== roles) {
        return res.status(403).json({ message: "No autorizado" });
      }
      
      req.user = decoded;

      return next();

    } catch (err) {
      return res.status(401).send("Token invalido");
    }
  };

module.exports = authorize;