import dotenv from 'dotenv';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';

export const PORT = Number(process.env.PORT) || 5000;

export const API_VERSION = process.env.API_VERSION || 'v1';

export const PROJECT_NAME = 'Bizwise';

export const CLIENT_URL_LOCAL =
  process.env.CLIENT_URL_LOCAL || 'http://localhost:3000';

export const CLIENT_URL_PRODUCTION =
  process.env.CLIENT_URL_PRODUCTION ||
  'https://bizwise-xi.vercel.app';

export const ALLOWED_ORIGINS = [
  CLIENT_URL_LOCAL,
  CLIENT_URL_PRODUCTION,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

console.log('Environment:', NODE_ENV);
console.log('Allowed CORS origins:', ALLOWED_ORIGINS);

export const CORS_OPTIONS = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (ALLOWED_ORIGINS.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);

    return callback(
      new Error(`Origin is not allowed by CORS: ${origin}`)
    );
  },

  credentials: false,

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'Accept',
    'X-Requested-With',
  ],

  optionsSuccessStatus: 204,
};