import User from './user.model.js';
import generateToken from '../../utils/generateToken.js';

import {
  getPagination,
  buildPaginationMeta,
} from '../../utils/pagination.js';

const createUser = async (userData) => {
  const existingUser = await User.findOne({
    username: userData.username,
  });

  if (existingUser) {
    const error = new Error('Username already exists');
    error.statusCode = 409;

    throw error;
  }

  const user = await User.create(userData);

  return user;
};

const loginUser = async (username, password) => {
  const user = await User.findOne({
    username,
  }).select('+password');

  if (!user) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;

    throw error;
  }

  const isPasswordValid = await user.comparePassword(
    password
  );

  if (!isPasswordValid) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;

    throw error;
  }

  const token = generateToken(user._id.toString());

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  };
};

const getUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return {
    data: users,
    pagination: buildPaginationMeta({
      page,
      limit,
      total,
    }),
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId)

  if (!user) {
    const error = new Error("User not found")
    error.statusCode = 404

    throw error
  }

  return {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
  }
}

const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;

    throw error;
  }

  return user;
};

const updateUser = async (id, userData) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;

    throw error;
  }

  if (
    userData.username &&
    userData.username !== user.username
  ) {
    const existingUser = await User.findOne({
      username: userData.username,
      _id: { $ne: id },
    });

    if (existingUser) {
      const error = new Error('Username already exists');
      error.statusCode = 409;

      throw error;
    }
  }

  Object.assign(user, userData);

  await user.save();

  return user;
};

const updateUserRole = async (id, role) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;

    throw error;
  }

  user.role = role;

  await user.save();

  return user;
};

const deleteUser = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;

    throw error;
  }

  await user.deleteOne();

  return user;
};

export default {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  getMe
};