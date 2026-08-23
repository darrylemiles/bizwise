import express from 'express';
import cookieParser from "cookie-parser"
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import colors from 'colors';

import {
  CORS_OPTIONS,
  PORT,
  PROJECT_NAME,
  NODE_ENV
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

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(cookieParser())

const baseApiPath = '/api/v1';

/* ========== Routes ========== */
app.use(`${baseApiPath}/users`, userRoutes);
app.use(`${baseApiPath}/categories`, categoryRoutes);
app.use(`${baseApiPath}/accounts`, accountRoutes);
app.use(`${baseApiPath}/transactions`, transactionRoutes);
app.use(`${baseApiPath}/products`, productRoutes);
app.use(`${baseApiPath}/sales`, salesRoutes);
app.use(`${baseApiPath}/financial-goals`, financialGoalRoutes);
app.use(`${baseApiPath}/dashboard`, dashboardRoutes);
app.use(`${baseApiPath}/reports`, reportRoutes);


/* ========== Health Check ========== */
app.get(`${baseApiPath}/health`, (req, res) => {
  res.status(200).json({
    status: 'ok',
    project: PROJECT_NAME,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

/* ========== Start Server ========== */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `${PROJECT_NAME} API is running on port ${PORT} in ${NODE_ENV} mode`.green.bold
      );
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();