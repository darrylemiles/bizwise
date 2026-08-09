import { Router } from 'express';

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  loginUser,
  getMe,
} from './user.controller.js';

import validate from '../../middlewares/validate.middleware.js';
import validateObjectId from '../../middlewares/validateObjectId.middleware.js';

import {
  protect,
  requireAdmin,
  requireSelfOrAdmin,
} from '../../middlewares/auth.middleware.js';

import {
  loginUserSchema,
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
} from './user.validation.js';

const router = Router();

router.post(
  '/login',
  validate(loginUserSchema),
  loginUser
);

router.get("/me", protect, getMe)

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createUserSchema),
  createUser
);

router.get(
  '/',
  protect,
  requireAdmin,
  getUsers
);

router.get(
  '/:id',
  protect,
  validateObjectId,
  requireSelfOrAdmin,
  getUserById
);

router.patch(
  '/:id',
  protect,
  validateObjectId,
  requireSelfOrAdmin,
  validate(updateUserSchema),
  updateUser
);

router.patch(
  '/:id/role',
  protect,
  validateObjectId,
  requireAdmin,
  validate(updateUserRoleSchema),
  updateUserRole
);

router.delete(
  '/:id',
  protect,
  validateObjectId,
  requireAdmin,
  deleteUser
);

export default router;