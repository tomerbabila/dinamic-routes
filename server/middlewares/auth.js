const jwt = require('jsonwebtoken');

const checkToken = (req, res, next) => {
  // Express headers are auto converted to lowercase
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json('Token is not valid.');
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(401).json('Auth token is not supplied.');
  }
};

module.exports = checkToken;
