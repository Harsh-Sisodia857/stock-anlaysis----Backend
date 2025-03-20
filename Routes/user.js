const express = require("express");
const router = express.Router();
const {loginUser, createUser, refreshToken} = require('../Controller/authController')

router.post('/login', loginUser);
router.post('/signup', createUser);
router.post('/refreshToken', refreshToken)

module.exports = router;