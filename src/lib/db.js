import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

let sequelize;

const isProduction = process.env.NODE_ENV === 'production';

// In production, we MUST use MySQL. Error out if config is missing.
if (isProduction) {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error('CRITICAL: Missing MySQL database configuration variables in production environment.');
  }
}

// Check for MySQL Environment Variables
const useMySQL = (isProduction || process.env.DB_DIALECT === 'mysql') &&
  process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

const config = useMySQL ? {
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  logging: false,
  dialectModule: mysql2, // Use imported mysql2 to avoid require/import issues
  pool: {
    max: 10, // Increased for production
    min: 0,
    acquire: 30000,
    idle: 10000
  }
} : {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
};

if (isProduction) {
  // In production, use a global variable to prevent hot-reload connection leaks if serverless function stays warm
  // though typically standard singleton logic applies.
  if (!global.sequelize) {
    global.sequelize = new Sequelize(config);
  }
  sequelize = global.sequelize;
} else {
  // Development: Use global to prevent connection accumulation during HMR
  if (!global.sequelize) {
    global.sequelize = new Sequelize(config);
  }
  sequelize = global.sequelize;
}

export default sequelize;
