const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../Config/connectToDb');

const User = sequelize.define('User', {
    // User ID (Primary key)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, 
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'user', 
    }
}, {
    timestamps: true, // To automatically create createdAt and updatedAt fields
    tableName: 'users', // Custom table name (optional)
});

module.exports = User;
