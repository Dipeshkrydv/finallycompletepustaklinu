require('dotenv').config({ path: '.env.local' });

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'old_book_platform',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: 3306
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'old_book_platform_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'old_book_platform_prod',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  }
};
