import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';
const PROJECT_NAME = 'Bizwise';

const allowedOrigins = [
  process.env.CLIENT_URL_LOCAL,
  process.env.CLIENT_URL_PRODUCTION,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

if (allowedOrigins.length === 0) {
  throw new Error(
    'At least one client URL must be configured with CLIENT_URL_LOCAL or CLIENT_URL_PRODUCTION',
  );
}

const CORS_OPTIONS = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

export {
  PORT,
  API_VERSION,
  PROJECT_NAME,
  CORS_OPTIONS
}