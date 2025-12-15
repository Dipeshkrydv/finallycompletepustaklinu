import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pages: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  keywords: {
    type: DataTypes.STRING, // Comma separated tags
    allowNull: true,
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('available', 'on-hold', 'sold'),
    defaultValue: 'available',
  }
}, {
  tableName: 'Books',
  indexes: [
    { fields: ['sellerId'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['title'] }
  ]
});

export default Book;
