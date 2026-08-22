import dotenv from 'dotenv';

dotenv.config();

const getEnv = (varName) => {
  const nodeEnv = (process.env.NODE_ENV || "LOCAL").toUpperCase()
  const suffixedVarName = `${varName}_${nodeEnv}`
  const value = process.env[suffixedVarName]

  if (!value) {
    throw new Error(
      `Missing environment variable: ${suffixedVarName}`,
    )
  }

  return value
}

export default getEnv;