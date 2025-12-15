import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const AutomationLog = sequelize.define('AutomationLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('EMAIL', 'MESSAGE'),
        allowNull: false,
    },
    target: {
        type: DataTypes.STRING, // email or user id
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        defaultValue: 'PENDING',
    },
    payload: {
        type: DataTypes.JSON, // Stores message content, orderId, etc.
        allowNull: false,
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});

export default AutomationLog;
