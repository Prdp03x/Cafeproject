const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.cafeId = decoded.cafeId;

  next();
};

module.exports = auth;