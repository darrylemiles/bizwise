import colors from 'colors';

const logger = {
  success: (message) => {
    console.log(`${message}`.green);
  },

  info: (message) => {
    console.info(`${message}`.blue);
  },

  warn: (message) => {
    console.warn(`${message}`.yellow);
  },

  error: (message) => {
    console.error(`${message}`.red);
  },
};

export default logger;