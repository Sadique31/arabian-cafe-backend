const adminMiddleware = (req, res, next) => {

  // Pehle ensure user exist karta hai
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Role check
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};

module.exports = adminMiddleware;
