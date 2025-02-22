const express = require("express");
const app = express();
require('dotenv').config();
app.use('/api',require('./Routes/index'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`))