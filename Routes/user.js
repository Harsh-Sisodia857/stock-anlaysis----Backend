const express = require("express");
const router = express.Router();
const {loginUser, createUser} = require('../Controller/AuthController')

router.post('/login', loginUser);
router.post('/signup', createUser);

module.exports = router;