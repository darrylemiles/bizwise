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


dotenv.config();

const app = express();

app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(express.json());

/* ========== Health Check ========== */

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    project: PROJECT_NAME,
  });
});

/* ========== Start Server ========== */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `${PROJECT_NAME} API is running on port ${PORT}`.bgBlue
      );
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();