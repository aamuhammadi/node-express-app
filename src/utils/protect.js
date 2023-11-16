const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { SECRET_KEY } = require("../config/env");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1].trim();
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not Authorized, Token failed" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Not Authorized, no token" });
  }
};

module.exports = { protect };
