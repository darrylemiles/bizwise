import mongoose from 'mongoose';

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid user ID');
    error.statusCode = 400;

    return next(error);
  }

  next();
};

export default validateObjectId;