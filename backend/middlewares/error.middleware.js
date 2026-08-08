const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Only expose stack traces during local development
  if (process.env.NODE_ENV === 'LOCAL') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
