import { Router } from 'express';

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
} from './transaction.controller.js';

import validate from '../../middlewares/validate.middleware.js';
import validateObjectId from '../../middlewares/validateObjectId.middleware.js';

import {
  protect,
  requireAdmin,
} from '../../middlewares/auth.middleware.js';

import {
  createTransactionSchema,
} from './transaction.validation.js';

const router = Router();

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createTransactionSchema),
  createTransaction
);

router.get(
  '/',
  protect,
  getTransactions
);

router.get(
  '/:id',
  protect,
  validateObjectId,
  getTransactionById
);

router.delete(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  deleteTransaction
);

export default router;