import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  followUpStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastFollowUpSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'Orders',
  indexes: [
    { fields: ['buyerId'] },
    { fields: ['status'] },
    { fields: ['bookId'] }
  ]
});

export default Order;
