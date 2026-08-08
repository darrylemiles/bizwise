import dotenv from 'dotenv';

dotenv.config();

const getEnv = (varName) => {
  const nodeEnv = (process.env.NODE_ENV || 'LOCAL').toUpperCase();
  const suffixedVarName = `${varName}_${nodeEnv}`;

  return process.env[suffixedVarName];
};

export default getEnv;