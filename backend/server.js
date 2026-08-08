import {
  CORS_OPTIONS,
  PORT,
  PROJECT_NAME
} from './constants.js'

import helmet from "helmet";
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import colors from 'colors'
import logger from './utils/logger.js'

const app = express()
app.use(helmet());
dotenv.config()

app.use(cors(CORS_OPTIONS));

/* ========== Health Check ========== */
app.get(`/api/v1/health`, (req, res) => {
  res.status(200).json({ status: 'ok', project: PROJECT_NAME });
});

const startServer = () => {
  try {
    app.listen(PORT, () => {
      logger.success(`${PROJECT_NAME} API is running on port ${PORT}`)
    })
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`)
    process.exit(1);
  }
}

startServer()