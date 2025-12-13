import { Sequelize } from 'sequelize';

let sequelize;

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'old_book_platform',
    process.env.DB_USER || 'root',
    {
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
    }
  );
} else {
  if (!global.sequelize) {
    global.sequelize = new Sequelize(
      {
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false,
      }
    );
  }
  sequelize = global.sequelize;
}

export default sequelize;
