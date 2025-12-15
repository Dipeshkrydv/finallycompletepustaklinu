import { Sequelize } from 'sequelize';

let sequelize;

const isProduction = process.env.NODE_ENV === 'production';

// Check for MySQL Environment Variables (Only use in Production or if explicitly requested)
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
  dialectModule: require('mysql2'), // Ensure mysql2 is used
  pool: {
    max: 5,
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
  sequelize = new Sequelize(config);
} else {
  if (!global.sequelize) {
    global.sequelize = new Sequelize(config);
  }
  sequelize = global.sequelize;
}

export default sequelize;
