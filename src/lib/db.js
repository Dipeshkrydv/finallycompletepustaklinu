import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

let sequelize;

const isProduction = process.env.NODE_ENV === 'production';

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
  dialectModule: mysql2,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
} : {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
};

// Singleton pattern for Sequelize instance
if (!global.sequelize) {
  // In production, we should ideally have the config, but we don't throw at module level
  // to avoid breaking the Next.js build process.
  if (isProduction && !useMySQL) {
    console.warn('WARNING: Running in production without full MySQL configuration. Falling back to SQLite.');
  }
  global.sequelize = new Sequelize(config);
}

sequelize = global.sequelize;

/**
 * Helper to ensure database is properly configured in production.
 * This should be called inside request handlers or server-side functions.
 */
export function ensureDbConfig() {
  if (isProduction && !useMySQL) {
    throw new Error('CRITICAL: Missing MySQL database configuration variables in production environment. Please set DB_HOST, DB_USER, and DB_NAME.');
  }
}

export default sequelize;
