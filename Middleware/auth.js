const jwt = require('jsonwebtoken');
const User = require("../Models/User")
const jwtSecret = process.env.JWT_SECRET


exports.authenticated = async (req,res,next)=>{
    // get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Auth Token is Invalid"})
    }
    try {
        const data = jwt.verify(token, jwtSecret);
        const id = data.user.id;
        req.user = await User.findOne({ where: { id } });
        // req.user = await User.findById(data.user.id);
        next();
        
    } catch (error) {
        console.log("ERROR : ",error)
        res.status(401).send({error:"Invalid Auth Token"})
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
