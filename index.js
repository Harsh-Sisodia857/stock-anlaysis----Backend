const express = require("express");
const app = express();
require('dotenv').config();
const sequelize = require('./Config/connectToDb');
const bodyParser = require('body-parser');
const cors = require('cors');


app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors());
// Add authentication check
sequelize.authenticate()
    .then(() => {
        console.log('Database connection established successfully');
        return sequelize.sync({ force: false });
    })
    .then(() => {
        console.log('Database synced!');
    })
    .catch((err) => {
        console.error('Unable to connect to the database :', err);
    });


app.use('/api',require('./Routes/index'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`))