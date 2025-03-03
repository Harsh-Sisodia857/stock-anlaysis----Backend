const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const User  = require('../Models/User'); 


// User registration
const createUser = async (req, res) => {
    let success = false;
    const {name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success, error: "Enter all required fields" });
    }
    try {
        // Check if user already exists with the same email
        let existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success, error: "User already exists with this email" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const securePass = await bcrypt.hash(password, salt);

        // Create a new user
        const user = await User.create({
            name,
            email,
            password: securePass,
        });

        // Generate auth token
        const data = {
            user: {
                id: user.id,
            },
        };
        const authToken = jwt.sign(data, jwtSecret, { expiresIn: '1h' }); // Added expiration for security
        success = true;
        const userData = {
            id: user.id,
            name: user.name,
            role: 'user',
            email : user.email
        };
        
        // Respond with the auth token
        res.json({ success, authToken, userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

// User login
const loginUser = async (req, res) => {
    let success = false;

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success, error: "Email and password are required" });
    }

    try {
        // Find user by email
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        // Compare the password
        const pwdCompare = await bcrypt.compare(password, user.password);
        if (!pwdCompare) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        // Generate auth token
        const data = {
            user: {
                id: user.id,
            },
        };
        const authToken = jwt.sign(data, jwtSecret, { expiresIn: '1h' }); // Added expiration for security
        success = true;

        // Send back user data along with auth token
        const userData = {
            id: user.id,
            name: user.name,
            role: user.role,
            email : user.email
        };

        res.json({ success, authToken, userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error", message: err.message });
    }
};

module.exports = { createUser, loginUser };
