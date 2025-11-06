import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../modules/user/user.model.js";

export const auth = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      // verify token
      const decoded = jwt.verify(token, JWT_SECRET);

  // no server-side blacklist: auth is based on token validity and user existence

      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: "Invalid token" });

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};
