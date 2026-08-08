import mongoose from 'mongoose';
import getEnv from '../utils/envResolver.js';

const mongoURI = getEnv('MONGO_URI');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully'.yellow.bold);
  } catch (error) {
    console.error('Error connecting to MongoDB:'.red, `${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDB;