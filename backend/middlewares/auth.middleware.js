import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';

const protect = async (req, res, next) => {
  try {
    let token;

    const authorization = req.headers.authorization;

    if (
      authorization &&
      authorization.startsWith('Bearer ')
    ) {
      token = authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;

      return next(error);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('User no longer exists');
      error.statusCode = 401;

      return next(error);
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.message = 'Invalid authentication token';
    }

    if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Authentication token has expired';
    }

    next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    const error = new Error('Authentication required');
    error.statusCode = 401;

    return next(error);
  }

  if (req.user.role !== 'admin') {
    const error = new Error('Admin access required');
    error.statusCode = 403;

    return next(error);
  }

  next();
};

const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    const error = new Error('Authentication required');
    error.statusCode = 401;

    return next(error);
  }

  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user._id.toString() === req.params.id;

  if (!isAdmin && !isSelf) {
    const error = new Error(
      'You are not authorized to access this resource'
    );
    error.statusCode = 403;

    return next(error);
  }

  next();
};

export {
  protect,
  requireAdmin,
  requireSelfOrAdmin,
};