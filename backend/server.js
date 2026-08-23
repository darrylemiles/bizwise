import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import colors from 'colors';

import connectDB from './config/connectDB.js';

import {
  CORS_OPTIONS,
  ALLOWED_ORIGINS,
  PORT,
  PROJECT_NAME,
  NODE_ENV,
} from './constants.js';

import notFoundHandler from './middlewares/notFound.middleware.js';
import errorHandler from './middlewares/error.middleware.js';

import userRoutes from './modules/users/user.route.js';
import categoryRoutes from './modules/categories/category.route.js';
import accountRoutes from './modules/accounts/account.route.js';
import transactionRoutes from './modules/transactions/transaction.route.js';
import productRoutes from './modules/products/product.route.js';
import salesRoutes from './modules/sales/sale.route.js';
import financialGoalRoutes from './modules/financial-goals/financial-goal.route.js';
import dashboardRoutes from './modules/dashboard/dashboard.route.js';
import reportRoutes from './modules/reports/report.route.js';

const app = express();

const baseApiPath = '/api/v1';

/* =========================================================
   Security / Middleware
========================================================= */

app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================================================
   Health Check
========================================================= */

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    project: PROJECT_NAME,
    environment: NODE_ENV,
  });
});

app.get(`${baseApiPath}/health`, (req, res) => {
  res.status(200).json({
    status: 'ok',
    project: PROJECT_NAME,
    environment: NODE_ENV,
  });
});

/* =========================================================
   Routes
========================================================= */

app.use(`${baseApiPath}/users`, userRoutes);
app.use(`${baseApiPath}/categories`, categoryRoutes);
app.use(`${baseApiPath}/accounts`, accountRoutes);
app.use(`${baseApiPath}/transactions`, transactionRoutes);
app.use(`${baseApiPath}/products`, productRoutes);
app.use(`${baseApiPath}/sales`, salesRoutes);
app.use(`${baseApiPath}/financial-goals`, financialGoalRoutes);
app.use(`${baseApiPath}/dashboard`, dashboardRoutes);
app.use(`${baseApiPath}/reports`, reportRoutes);

/* =========================================================
   Error Handling
========================================================= */

app.use(notFoundHandler);
app.use(errorHandler);

/* =========================================================
   Start Server
========================================================= */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `${PROJECT_NAME} API is running on port ${PORT} in ${NODE_ENV} mode`
          .green
          .bold
      );

      console.log(
        `Allowed CORS origins: ${ALLOWED_ORIGINS.join(', ')}`.cyan
      );
    });
  } catch (error) {
    console.error(
      `Error starting server: ${error.message}`.red.bold
    );

    process.exit(1);
  }
};

startServer();