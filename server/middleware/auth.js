const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).json({ message: "Access token not found." });
    }
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not found." });
    }
    // console.log(accessToken, refreshToken);
    
    const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedAccessToken.id).select('-password'); 

    if (!user) {
        return res.status(401).json({ message: "User not found." });
    }
    req.user = user;
    
        

    next();
};

module.exports = { verifyToken };