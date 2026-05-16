const redis = require('redis');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

const connectRedis = async () => {
  try {
    const redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis max retry attempts reached');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      logger.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis Connected');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis Ready');
    });

    redisClient.on('end', () => {
      logger.warn('⚠️ Redis Connection Ended');
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis Reconnecting');
    });

    await redisClient.connect();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await redisClient.quit();
      logger.info('🔌 Redis connection closed through app termination');
    });

    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    // Don't exit - allow app to run without Redis in development
    return null;
  }
};

module.exports = connectRedis;
