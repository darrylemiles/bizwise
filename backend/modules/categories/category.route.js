import { Router } from 'express';

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

import validate from '../../middlewares/validate.middleware.js';
import validateObjectId from '../../middlewares/validateObjectId.middleware.js';

import {
  protect,
  requireAdmin,
} from '../../middlewares/auth.middleware.js';

import {
  createCategorySchema,
  updateCategorySchema,
} from './category.validation.js';

const router = Router();

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createCategorySchema),
  createCategory
);

router.get(
  '/',
  protect,
  getCategories
);

router.get(
  '/:id',
  protect,
  validateObjectId,
  getCategoryById
);

router.patch(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  deleteCategory
);

export default router;