const { Sequelize } = require('sequelize');

// Initialize Sequelize with MySQL connection settings
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER,  
    process.env.DB_PASSWORD,  
    {
        host: process.env.HOST ,
        dialect: 'mysql', // MySQL dialect
        logging: false,   
    }
);

module.exports = sequelize;
