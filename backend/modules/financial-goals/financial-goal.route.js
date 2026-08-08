import express from 'express';

import {
  createFinancialGoal,
  getFinancialGoals,
  getFinancialGoalById,
  updateFinancialGoal,
  contributeToGoal,
  deleteFinancialGoal,
} from './financial-goal.controller.js';

import {
  createFinancialGoalSchema,
  updateFinancialGoalSchema,
  contributeToGoalSchema,
} from './financial-goal.validation.js';

import validate from '../../middlewares/validate.middleware.js';

import validateObjectId from '../../middlewares/validateObjectId.middleware.js';
import { protect, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  getFinancialGoals
);

router.get(
  '/:id',
  protect,
  validateObjectId,
  getFinancialGoalById
);

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createFinancialGoalSchema),
  createFinancialGoal
);

router.patch(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  validate(updateFinancialGoalSchema),
  updateFinancialGoal
);

router.delete(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  deleteFinancialGoal
);

router.post(
  '/:id/contribute',
  protect,
  validateObjectId,
  validate(contributeToGoalSchema),
  contributeToGoal
);

export default router;