import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
});

export default Feedback;
