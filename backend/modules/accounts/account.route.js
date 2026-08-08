import { Router } from 'express';

import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from './account.controller.js';

import validate from '../../middlewares/validate.middleware.js';
import validateObjectId from '../../middlewares/validateObjectId.middleware.js';

import {
  protect,
  requireAdmin,
} from '../../middlewares/auth.middleware.js';

import {
  createAccountSchema,
  updateAccountSchema,
} from './account.validation.js';

const router = Router();

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createAccountSchema),
  createAccount
);

router.get(
  '/',
  protect,
  getAccounts
);

router.get(
  '/:id',
  protect,
  validateObjectId,
  getAccountById
);

router.patch(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  validate(updateAccountSchema),
  updateAccount
);

router.delete(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  deleteAccount
);

export default router;