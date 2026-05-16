const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB Reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
