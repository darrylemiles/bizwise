import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import colors from 'colors';

import {
  CORS_OPTIONS,
  PORT,
  PROJECT_NAME,
} from './constants.js';

import notFoundHandler from './middlewares/notFound.middleware.js';
import errorHandler from './middlewares/error.middleware.js';

import userRoutes from './modules/users/user.route.js';
import categoryRoutes from './modules/categories/category.route.js';
import accountRoutes from './modules/accounts/account.route.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(express.json());

const baseApiPath = '/api/v1';

/* ========== Routes ========== */
app.use(`${baseApiPath}/users`, userRoutes);
app.use(`${baseApiPath}/categories`, categoryRoutes);
app.use('/api/v1/accounts', accountRoutes);

/* ========== Health Check ========== */
app.get('/api/v1/health', (req, res) => {
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
        `${PROJECT_NAME} API is running on port ${PORT}`.green.bold
      );
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();