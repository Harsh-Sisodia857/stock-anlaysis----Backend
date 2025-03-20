const jwt = require('jsonwebtoken');
const User = require("../Models/User")
const jwtSecret = process.env.JWT_SECRET


exports.authenticated = async (req,res,next)=>{
    // get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).json({auth : false, error:"Auth Token is Invalid"})
    }
    try {
        const data = jwt.verify(token, jwtSecret);
        const id = data.user.id;
        if(token == "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo0fSwiaWF0IjoxNzQyNDc3NTAxLCJleHAiOjE3NDI0ODExMDF9.S0DiVLBvH-9Nh9b681kFtGhj--4kFzBrJcSwlsD8vZk"){
            throw new Error("Jann buj ke kiya hai")
        }
        req.user = await User.findOne({ where: { id } });
        // req.user = await User.findById(data.user.id);
        next();
        
    } catch (error) {
        console.log("ERROR : ",error)
        res.status(401).json({auth : false, error:"Invalid Auth Token"})
    }
}

exports.authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `You are not allowed to accesss this resource`
            })
        }
        next();
    }
}