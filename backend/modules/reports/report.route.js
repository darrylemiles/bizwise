import express from 'express';

import {
  protect,
} from '../../middlewares/auth.middleware.js';

import validate from '../../middlewares/validate.middleware.js';

import {
  reportQuerySchema,
} from './report.validation.js';

import {
  getFinancialReport,
  getSalesReport,
  getExpenseReport,
  getProductReport,
  getInventoryReport,
  getOverviewReport,
} from './report.controller.js';

const router = express.Router();

router.get(
  '/financial',
  protect,
  validate(
    reportQuerySchema,
    'query'
  ),
  getFinancialReport
);

router.get(
  '/sales',
  protect,
  validate(
    reportQuerySchema,
    'query'
  ),
  getSalesReport
);

router.get(
  '/expenses',
  protect,
  validate(
    reportQuerySchema,
    'query'
  ),
  getExpenseReport
);

router.get(
  '/products',
  protect,
  validate(
    reportQuerySchema,
    'query'
  ),
  getProductReport
);

router.get(
  '/inventory',
  protect,
  getInventoryReport
);

router.get(
  '/overview',
  protect,
  validate(
    reportQuerySchema,
    'query'
  ),
  getOverviewReport
);

export default router;