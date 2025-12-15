import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Otp = sequelize.define('Otp', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
});

export default Otp;
