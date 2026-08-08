import express from 'express';

import {
  createSale,
  getSales,
  getSaleById,
} from './sale.controller.js';

import {
  createSaleSchema,
} from './sale.validation.js';

import validate from '../../middlewares/validate.middleware.js';

import validateObjectId from '../../middlewares/validateObjectId.middleware.js';
import { protect, requireAdmin } from '../../middlewares/auth.middleware.js';

const router =
  express.Router();

router.get(
  '/',
  protect,
  getSales
);

router.get(
  '/:id',
  protect,
  validateObjectId,
  getSaleById
);

router.post(
  '/',
  protect,
  requireAdmin,
  validate(createSaleSchema),
  createSale
);

export default router;