import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("middleware: ", token);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    // Token verification failure or other errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    // Log the error for debugging
    console.error("Error authenticating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// authorization
export const isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Unauthorized: Role '${
          req.user.role
        }' does not have access. Allowed roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};
