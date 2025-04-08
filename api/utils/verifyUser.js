import { errorHandler } from './errorHandler.js';
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, 'Not authenticated'));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(errorHandler(401, 'Token expired'));
      }
      return next(errorHandler(403, 'Invalid token'));
    }

    req.user = decoded;
    next();
  });
};
