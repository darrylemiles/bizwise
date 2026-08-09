import getEnv from "./utils/envResolver.js"; 

const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';
const PROJECT_NAME = 'Bizwise';
const CORS_OPTIONS = {
  origin: getEnv("CLIENT_URL"),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

export {
  PORT,
  API_VERSION,
  PROJECT_NAME,
  CORS_OPTIONS
}