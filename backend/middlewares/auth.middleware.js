import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token

    if (!token) {
      const error = new Error("Not authenticated")
      error.statusCode = 401
      throw error
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    )

    const user = await User.findById(decoded.id)

    if (!user) {
      const error = new Error("User not found")
      error.statusCode = 401
      throw error
    }

    req.user = user

    next()
  } catch (error) {
    next(error)
  }
}

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