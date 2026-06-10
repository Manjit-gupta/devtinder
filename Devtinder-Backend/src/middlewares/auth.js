const jwt = require('jsonwebtoken');
const User = require('../models/user');



const userAuth =  async (req,res,next)=>{

    try{
// Support both cookie and Authorization Bearer header
const authHeader = req.headers['authorization'];
const token = (authHeader && authHeader.startsWith('Bearer ')
  ? authHeader.slice(7)
  : req.cookies?.token) || null;
if (!token) {
    throw new Error("No token found");
  }
const decodedmessage = await jwt.verify(token, process.env.jwt_secret);
const { userId } = decodedmessage;


const user = await User.findById(userId);
if (!user) {
  throw new Error("User not found");
}
req.user = user;
next();

    }catch(error){
        res.status(401).json({ requestId: req.requestId, error: "Unauthorized access", status: 401 });
    }
}

module.exports = { userAuth };