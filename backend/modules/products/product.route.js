import { Router } from 'express';

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
} from './product.controller.js';

import validate from '../../middlewares/validate.middleware.js';

import validateObjectId from '../../middlewares/validateObjectId.middleware.js';

import {
  protect,
  requireAdmin,
} from '../../middlewares/auth.middleware.js';

import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
} from './product.validation.js';

const router = Router();

router.get(
  '/',
  protect,
  getProducts
);

router.get(
  '/:id',
  protect,
  validateObjectId,
  getProductById
);

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createProductSchema),
  createProduct
);

router.patch(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  validate(updateProductSchema),
  updateProduct
);

router.patch(
  '/:id/stock',
  protect,
  requireAdmin,
  validateObjectId,
  validate(adjustStockSchema),
  adjustStock
);

router.delete(
  '/:id',
  protect,
  requireAdmin,
  validateObjectId,
  deleteProduct
);

export default router;