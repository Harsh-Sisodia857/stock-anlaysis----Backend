const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const User = require("../Models/User");

// User registration
const createUser = async (req, res) => {
  let success = false;
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success, error: "Enter all required fields" });
  }
  try {
    // Check if user already exists with the same email
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success, error: "User already exists with this email" });
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
    const authToken = jwt.sign(data, jwtSecret, { expiresIn: "3h" }); // Added expiration for security
    const refreshToken = jwt.sign(data, refreshSecret, { expiresIn: "7d" });

    success = true;
    const userData = {
      id: user.id,
      name: user.name,
      role: "user",
      email: user.email,
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
    return res
      .status(400)
      .json({ success, error: "Email and password are required" });
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
    const authToken = jwt.sign(data, jwtSecret, { expiresIn: "1h" }); // Added expiration for security
    const refreshToken = jwt.sign(data, refreshSecret, { expiresIn: "7d" });
    success = true;

    // Send back user data along with auth token
    const userData = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    };

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,  // ✅ Set to false for local testing
      sameSite: "Lax", // ✅ Required for cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    

    console.log("REFRESH TOKEN : ", refreshToken)

    res.json({ success, authToken, userData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Refresh Token : ", req.cookies)
  
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const userId = decoded.user.id;
    
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }
    
    if (user.tokenVersion !== undefined && decoded.version !== user.tokenVersion) {
      return res.status(403).json({ error: "Token has been revoked" });
    }
    
    const newAuthToken = jwt.sign(
      { user: { id: user.id } }, 
      jwtSecret, 
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      authToken: newAuthToken
    });
  } catch (error) {
    console.error(error);
    res.status(403).json({ error: "Invalid refresh token" });
  }
};


module.exports = { createUser, loginUser, refreshToken };